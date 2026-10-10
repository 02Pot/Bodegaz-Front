import EmptyState from '@/components/EmptyState'
import InfiniteScroll from '@/components/InfiniteScroll'
import RecentVisited from '@/components/Recent'
import SearchBar from '@/components/SearchAdd'
import Warehouse from '@/components/Warehouse'
import { saveWarehouse, unsaveWarehouse } from '@/lib/api/savedwarehouse'
import { getFeedWarehouses } from '@/lib/api/warehouse'
import type { ApiError, WarehouseInterface } from '@/types'
import { Box, Flex, Grid, Text } from '@chakra-ui/react'
import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'
import { useCallback, useMemo } from 'react'

export const Route = createFileRoute('/_authenticated/')({
  component: RouteComponent,
})

type Page = Awaited<ReturnType<typeof getFeedWarehouses>>

function RouteComponent() {
  const {
    data,
    isPending,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['warehouses'],
    queryFn: ({ pageParam }) =>
      getFeedWarehouses({ size: 10, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
  })

  const warehouses = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  )

  const queryClient = useQueryClient()
  const queryKey = ['warehouses']

  const isEmpty = warehouses.length === 0

  const errorMessage = isError ? axios.isAxiosError<ApiError>(error)
    ? (error.response?.data?.message ?? 'Something went wrong')
    : 'Something went wrong'
    : null


  const toggleSaveMutation = useMutation({
    mutationFn: ({ id, wasSaved }: { id: string; wasSaved: boolean }) =>
      wasSaved ? unsaveWarehouse(id) : saveWarehouse(id),

    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData<InfiniteData<Page>>(queryKey)

      queryClient.setQueryData<InfiniteData<Page>>(queryKey, (old) =>
        old && {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.filter((w:WarehouseInterface) => w.warehouseId !== id),
          })),
        }
      )

      return { previous }
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous)
    },
  })

  const toggleSave = (w: WarehouseInterface) =>toggleSaveMutation.mutate({ id: w.warehouseId, wasSaved: w.saved })

  const loadMoreWarehouse = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return
    fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])


  return(
    <>
      <Flex w='100%' height='100%' gap='12px'>
        <Box flex={'1'} minW={0}>
          <SearchBar/>
          {errorMessage && <Text color="red.500">{errorMessage}</Text>}
          
          <Grid
            alignContent='start'
            alignItems='start'
            templateColumns={
              isEmpty && !isPending ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))"
            }
            rowGap="8px"
            columnGap="16px"
            padding={{ base: '12px 0px 0px', md: '24px 24px 0px' }}
          >
            {isPending ? (
              Array.from({ length: 12 }).map((_, i) => (
                <Warehouse key={i} loading />
              ))
            ) : isEmpty ? (
              <EmptyState />
            ) : (
              warehouses.map((w) => (
                <Warehouse 
                  key={w.warehouseId} 
                  warehouse={w} 
                  loading={false} 
                  isSaved={w.saved} 
                  toggleSave={toggleSave}/>
              ))
            )}

            {isFetchingNextPage &&
              Array.from({ length: 4 }).map((_, i) => (
                <Warehouse key={`append-${i}`} loading />
              ))}
          </Grid>
        </Box>
        
        <InfiniteScroll
          rootMargin="400px"
          onLoadMore={loadMoreWarehouse}
          hasMore={!!hasNextPage}
          isLoading={isPending || isFetchingNextPage}
        />

        <Box display={{ base: "none", lg: "block" }}>
          <RecentVisited />
        </Box>
      </Flex>
    </>
  )
}
