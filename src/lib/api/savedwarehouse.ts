import type { Filters } from "@/components/Filter";
import { api } from "../axios";

export const saveWarehouse = (id: string) => api.put(`/warehouse/saved/${id}/save`, null,)

export const unsaveWarehouse = (id: string) => api.delete(`/warehouse/saved/${id}/save`)

export const getSavedWarehouses = async ({ size = 10, cursor,search,filters }: { size?: number; cursor?: string; search:string; filters?: Filters }) => {
    const req = await api.get(`/warehouse/saved/all`,{params: {cursor,size,search,...filters}})
    return req.data
}