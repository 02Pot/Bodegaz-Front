import { api } from '../axios';

interface WarehouseRequest {
    name: string,
    warehouseCapacityKg: number,
    addressLine1: string,
    addressLine2: string,
    city: string,
    stateProvince: string,
    country: string,
    postalCode: string
}

export const getFeedWarehouses = async ({ size = 10, cursor }: { size?: number; cursor?: string }) => {
    const req = await api.get(`/warehouse/all`, {params: {cursor,size}});
    return req.data;
};

export const getWarehouseById = async (id: string) => {
    const req = await api.get(`/warehouse/${id}`);
    return req.data;
}

export const addWarehouse = async (request: WarehouseRequest) => {
    const req = await api.post(`/warehouse/add`, {request})
    return req.data;
}

export const updateWarehouse = async (id: string) => {
    const req = await api.patch(`/warehouse/${id}`, )
    return req.data
}

export const deleteWarehouse = async (id: string) => {
    const req = await api.delete(`/warehouse/${id}`)
    return req.data
}

export const trendingWarehouses = async (size: number) => {
    const req = await api.get(`/warehouse/trending`, {params: {size}})
    return req.data
}

export const newestWarehouses = async (size: number) => {
    const req = await api.get(`/warehouse/newest`, {params:{ size}})
    return req.data
}