import { api } from "../axios";

export const saveWarehouse = (id: string) => api.put(`/warehouse/saved/${id}/save`, null,)

export const unsaveWarehouse = (id: string) => api.delete(`/warehouse/saved/${id}/save`)

export const getSavedWarehouses = async ({ size = 10, cursor }: { size?: number; cursor?: string }) => {
    const req = await api.get(`/warehouse/saved/all`,{params: {cursor,size}})
    return req.data
}