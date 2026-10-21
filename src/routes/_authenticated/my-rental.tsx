import RentalPanel from '@/components/RentalPanel';
import WarehousesPanel from '@/components/Warehouse/WarehousePanel';
import { getMyWarehouse } from '@/lib/api/warehouse';
import { qk } from '@/lib/queryKeys';
import { Tabs, Text } from "@chakra-ui/react";
import { queryOptions, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { LuClipboardList, LuWarehouse } from "react-icons/lu";

export const Route = createFileRoute('/_authenticated/my-rental')({
  component: RouteComponent,
  loader: ({context: {queryClient}}) => queryClient.query(warehouseOptions),
})

const warehouseOptions = queryOptions({
  queryKey: qk.warehousesAll,
  queryFn: () => getMyWarehouse(),
  staleTime: 1000 * 60 * 5,
  retry: false
})

function RouteComponent() {
  const { data: warehouse } = useQuery(warehouseOptions)
  
  return (
    <Tabs.Root defaultValue="warehouses" variant="line" lazyMount unmountOnExit>
      <Tabs.List>
        <Tabs.Trigger value="warehouses">
          <LuWarehouse strokeWidth={3}/>
          <Text fontWeight='bold'>Warehouses</Text>
        </Tabs.Trigger>
        <Tabs.Trigger value="rentals">
          <LuClipboardList strokeWidth={3} />
          <Text fontWeight='bold'>Rentals</Text>
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="rentals">
        <RentalPanel />
      </Tabs.Content>
      <Tabs.Content value="warehouses">
        <WarehousesPanel warehouses={warehouse} />
      </Tabs.Content>
  </Tabs.Root>
  )
}

