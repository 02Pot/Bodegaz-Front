import EmptyState from '@/components/EmptyState'
import InfiniteScroll from '@/components/InfiniteScroll'
import RecentVisited from '@/components/Recent'
import SearchBar from '@/components/SearchAdd'
import Warehouse from '@/components/Warehouse'
import { saveWarehouse, unsaveWarehouse } from '@/lib/api/savedwarehouse'
import { getFeedWarehouses } from '@/lib/api/warehouse'
import type { ApiError, WarehouseInterface } from '@/types'
import { Box, Flex, Grid } from '@chakra-ui/react'
import { createFileRoute } from '@tanstack/react-router'
import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'

export const Route = createFileRoute('/_authenticated/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [isAppending, setIsAppending] = useState<boolean>(false)
  const [warehouses, setWarehouse] = useState<WarehouseInterface[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasNext, setHasNext] = useState<boolean>(false)
  const [savedIds, setSavedIds] = useState<Set<WarehouseInterface["warehouseId"]>>(new Set());

  const isEmpty = warehouses.length === 0
  useEffect(() => {
    setSavedIds(new Set(warehouses.filter((w) => w.saved).map((w) => w.warehouseId)));
  }, [warehouses]);


  const setSaved = (id: WarehouseInterface["warehouseId"], saved: boolean) =>
    setSavedIds((prev) => {
      const next = new Set(prev);
      saved ? next.add(id) : next.delete(id);
      return next;
    });

  const toggleSave = async (w: WarehouseInterface) => {
    const id = w.warehouseId;
    const wasSaved = savedIds.has(id);

    setSaved(id, !wasSaved);

    try {
      wasSaved ? await unsaveWarehouse(id) : await saveWarehouse(id);
    } catch {
      setSaved(id, wasSaved);
    }
  };

  const loadMoreWarehouse = useCallback(() => {
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
      console.log(data.items)
      setHasNext(data.hasNext);
      setCursor(data.nextCursor);
    } catch (err) {
      if (axios.isAxiosError<ApiError>(err)) {
        setError(err.response?.data?.message ?? "Something went wrong");
      }
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
      <Flex w='100%' height='100%' gap='12px'>
        <Box flex={'1'} minW={0}>
          <SearchBar/>
          <Grid
            alignContent='start'
            alignItems='start'
            templateColumns={
              isEmpty ? "1fr" : "repeat(auto-fill, minmax(300px, 1fr))"
            }
            rowGap="8px"
            columnGap="16px"
            padding={{ base: '12px 0px 0px', md: '24px 24px 0px' }}
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
                  loading={false} 
                  isSaved={savedIds.has(w.warehouseId)} 
                  toggleSave={toggleSave}/>
              ))
            )}

            {isAppending &&
              Array.from({ length: 4 }).map((_, i) => (
                <Warehouse key={`append-${i}`} loading />
              ))}
          </Grid>
        </Box>
        
        <InfiniteScroll
          rootMargin="400px"
          onLoadMore={loadMoreWarehouse}
          hasMore={hasNext}
          isLoading={isLoading}
        />

        <Box display={{ base: "none", lg: "block" }}>
          <RecentVisited />
        </Box>
      </Flex>
    </>
  )
}
