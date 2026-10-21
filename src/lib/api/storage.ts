import type { AddStorageValues } from "@/components/Storage/AddStorageDialog";
import type { StorageResponse } from "@/types";
import { api } from "../axios";

export const listType = async () => {
    const req = await api.get(`/storage/types`)
    return req.data
}

export const addStorage = async (warehouseId: string, values: AddStorageValues) => {
    const res = await api.post(`/warehouses/${warehouseId}/storages`, values);
    return res.data;
};

export const updateStorage = async (warehouseId: string, storageId: string, values: Partial<StorageResponse>) => {
    const res = await api.patch(`/warehouses/${warehouseId}/storages/${storageId}`, values);
    return res.data
}

export const deleteStorage = async (warehouseId:string,storageId: string) => {
    const res = await api.delete(`/warehouses/${warehouseId}/storages/${storageId}`);
    return res.data;
}

export const getStorageByWarehouseId = async(warehouseId: string) => {
    const res = await api.get(`/warehouses/${warehouseId}/storages`);
    return res.data;
}