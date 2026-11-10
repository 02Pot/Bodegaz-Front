import type { QueryClient } from '@tanstack/react-query'

export const qk = {
    warehousesAll: ['warehouses'] as const,
    warehouses: (id: string) => ['warehouses', id] as const,
    storages: (warehouseId: string) => ['storages', warehouseId] as const,
    storagesAll: ['storages'] as const,
}

export const refreshWarehouseData = (qc: QueryClient, warehouseId?: string) =>
    Promise.all([
        qc.invalidateQueries({ queryKey: qk.warehousesAll }),
        qc.invalidateQueries({
            queryKey: warehouseId ? qk.storages(warehouseId) : qk.storagesAll,
        }),
    ])
