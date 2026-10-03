import EmptyState from '@/components/EmptyState'
import InfiniteScroll from '@/components/InfiniteScroll'
import SearchBar from '@/components/SearchAdd'
import Warehouse from '@/components/Warehouse'
import { getFeedWarehouses } from '@/lib/api/warehouse'
import type { WarehouseInterface } from '@/types'
import { Box, Grid } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'

export const Route = createFileRoute('/_authenticated/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isAppending, setIsAppending] = useState<boolean>(false)

  const [warehouses, setWarehouse] = useState<WarehouseInterface[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState<boolean>(false)

  const isEmpty = warehouses.length === 0

  const loadMoreAnnouncement = useCallback(() => {
    if (isLoading || !hasNext || !cursor) return
  }, [ cursor, hasNext])

  const fetchWarehouses = useCallback(async (nextCursor?: string, append = false) => {
    try {
      append
        ? setIsAppending(true)
        : setLoading(true);
  
      const data = await getFeedWarehouses({ size: 10, cursor: nextCursor });

      setWarehouse((prev) =>
        append
          ? [...prev, ...data.items]
          : data.items
        );

      setHasNext(data.hasNext);
      setCursor(data.nextCursor);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch warehouses");
    } finally {
      setIsAppending(false)
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  return(
    <>
      <Box height='100%'>
        <SearchBar/>
        <Grid
          height='100%'
          templateColumns={
            isEmpty
              ? '1fr'
              : {
                  base: '1fr',
                  sm: 'repeat(2, 1fr)',
                  xl: 'repeat(4, 1fr)',
                }
          }
          rowGap="8px"
          columnGap="16px"
          padding={{ base: '12px 0px 0px', md: '24px 24px 0px' }}
        >
          {isLoading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <Warehouse
                key={i}
                loading={isLoading}
              />
            ))
          ) : (
              <EmptyState/>
          )}

          {isAppending &&
              Array.from({ length: 4 }).map((_, i) => (
                <Warehouse
                  key={i}
                  loading={isLoading}
                />
              ))}
        </Grid>
        <InfiniteScroll rootMargin="400px" onLoadMore={loadMoreAnnouncement} hasMore={hasNext} isLoading={isLoading} />
      </Box>
    </>
  )
}
