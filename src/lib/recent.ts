import type { WarehouseResponse } from '@/types'
import { useSyncExternalStore } from 'react'

export interface RecentWarehouse {
    warehouseId: string
    name: string
    address: string
    imageUrl?: string
}

const KEY = 'recentWarehouses'
const MAX = 6
const subs = new Set<() => void>()

const read = (): RecentWarehouse[] => {
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? '[]')
    } catch {
        return []
    }
}

let cache = read()

const write = (list: RecentWarehouse[]) => {
    cache = list
    localStorage.setItem(KEY, JSON.stringify(list))
    subs.forEach((fn) => fn())
}

export const addRecent = (w: WarehouseResponse) =>
    write(
        [
            {
                warehouseId: w.warehouseId,
                name: w.name,
                address: [w.address?.addressLine1, w.address?.city]
                    .filter(Boolean)
                    .join(', '),
                imageUrl: w.imageUrls?.[0],
            },
            ...cache.filter((r) => r.warehouseId !== w.warehouseId),
        ].slice(0, MAX)
    )

export const clearRecent = () => write([])

export const useRecent = () =>
    useSyncExternalStore(
        (cb) => {
            subs.add(cb)
            return () => subs.delete(cb)
        },
        () => cache
    )
