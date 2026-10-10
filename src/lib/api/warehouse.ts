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

export const addWarehouse = async ({request,images}: {request: WarehouseRequest, images:File[]}) => {
    const form = new FormData()
    form.append('data', new Blob([JSON.stringify(request)],{type: 'application/json'}))
    images.forEach((file) => form.append('images', file))
    const req = await api.post(`/warehouse/add`, form)
    return req.data;
}

export const updateWarehouse = async ({warehouseId, request, newImages,removeImages} : {warehouseId:string, request: WarehouseRequest,newImages: File[], removeImages: string[]}) => {
    const form = new FormData()
    form.append('data', new Blob([JSON.stringify(request)],{type: 'application/json'}))
    newImages.forEach((file) => form.append('images', file))
    removeImages.forEach((id) => form.append('removeImageIds', id))
    const req = await api.put(`/warehouse/${warehouseId}`, form,{headers: {'Content-Type': undefined}} )
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

export const uploadWarehouseImage = async (warehouseId:string,files:File) => {
    const req = await api.post(`/warehouse/${warehouseId}`,{params: {files}})
    return req.data
}

export const viewWarehouseImage = async (warehouseId: string) => {
    const req = await api.get(`/warehouse/${warehouseId}/images`)
    return req.data
}

export const viewWarehouseImageById = async (imageId: string) => {
    const req = await api.get(`/warehouse/images/${imageId}`)
    return req.data
}

export const downloadWarehouseImageById = async (imageId: string) => {
    const req = await api.get(`/warehouse/images/${imageId}/download`)
    return req.data
}

export const deleteWarehouseImageById = async (imageId: string) => {
    const req = await api.delete(`/warehouse/images/${imageId}`)
    return req.data
}