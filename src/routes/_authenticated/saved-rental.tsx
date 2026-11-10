import EmptyState from '@/components/EmptyState'
import type { Filters } from '@/components/Filter/Filter'
import InfiniteScroll from '@/components/InfiniteScroll'
import SearchBar from '@/components/SearchAdd'
import Warehouse from '@/components/Warehouse/Warehouse'
import {
    getSavedWarehouses,
    saveWarehouse,
    unsaveWarehouse,
} from '@/lib/api/savedwarehouse'
import type { ApiError, WarehouseResponse } from '@/types'
import { Box, Flex, Grid, Text } from '@chakra-ui/react'
import {
    infiniteQueryOptions,
    keepPreviousData,
    useInfiniteQuery,
    useMutation,
    useQueryClient,
    type InfiniteData,
} from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'
import { useCallback, useMemo, useState } from 'react'

export const Route = createFileRoute('/_authenticated/saved-rental')({
    component: RouteComponent,
    loader: ({ context: { queryClient } }) =>
        queryClient.infiniteQuery(feedQueryOptions()),
})

type Page = Awaited<ReturnType<typeof getSavedWarehouses>>

const feedQueryOptions = (search = '', filters?: Filters) =>
    infiniteQueryOptions({
        queryKey: ['warehouses', 'saved', { search, filters }],
        queryFn: ({ pageParam }) =>
            getSavedWarehouses({
                size: 10,
                cursor: pageParam,
                search,
                filters,
            }),
        staleTime: 5 * 60 * 1000,
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) =>
            lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    })

function RouteComponent() {
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState<Filters>()
    const options = feedQueryOptions(search, filters)
    const queryClient = useQueryClient()
    const queryKey = options.queryKey

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isPlaceholderData,
        isError,
        error,
    } = useInfiniteQuery({
        ...options,
        refetchOnWindowFocus: false,
        placeholderData: keepPreviousData,
    })

    const warehouses = useMemo(
        () => data?.pages.flatMap((page) => page.items) ?? [],
        [data]
    )

    const isEmpty = warehouses.length === 0

    const errorMessage = isError
        ? axios.isAxiosError<ApiError>(error)
            ? (error.response?.data?.message ?? 'Something went wrong')
            : 'Something went wrong'
        : null

    const toggleSaveMutation = useMutation({
        mutationFn: ({ id, wasSaved }: { id: string; wasSaved: boolean }) =>
            wasSaved ? unsaveWarehouse(id) : saveWarehouse(id),

        onMutate: async ({ id }) => {
            await queryClient.cancelQueries({ queryKey })

            const previous =
                queryClient.getQueryData<InfiniteData<Page>>(queryKey)

            queryClient.setQueryData<InfiniteData<Page>>(
                queryKey,
                (old) =>
                    old && {
                        ...old,
                        pages: old.pages.map((page) => ({
                            ...page,
                            items: page.items.filter(
                                (w: WarehouseResponse) => w.warehouseId !== id
                            ),
                        })),
                    }
            )

            return { previous }
        },

        onError: (_err, _vars, ctx) => {
            if (ctx?.previous) queryClient.setQueryData(queryKey, ctx.previous)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] })
        },
    })

    const toggleSave = (w: WarehouseResponse) =>
        toggleSaveMutation.mutate({ id: w.warehouseId, wasSaved: w.saved })

    const loadMoreWarehouse = useCallback(() => {
        if (!hasNextPage || isFetchingNextPage) return
        fetchNextPage()
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    return (
        <>
            <Flex w="100%" height="100%" gap="12px">
                <Box flex={'1'} minW={0}>
                    <SearchBar onSearch={setSearch} onFilters={setFilters} />
                    {errorMessage && <Text>{errorMessage}</Text>}
                    <Grid
                        alignContent="start"
                        alignItems="start"
                        templateColumns={
                            isEmpty
                                ? '1fr'
                                : 'repeat(auto-fill, minmax(300px, 1fr))'
                        }
                        rowGap="8px"
                        columnGap="16px"
                        padding={{ base: '12px 0px 0px', md: '24px 24px 0px' }}
                        opacity={isPlaceholderData ? 0.6 : 1}
                    >
                        {isLoading ? (
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
                                    isSaved={w.saved}
                                    toggleSave={toggleSave}
                                />
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
                    isLoading={isFetchingNextPage}
                />
            </Flex>
        </>
    )
}
