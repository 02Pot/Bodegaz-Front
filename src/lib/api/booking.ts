import { api } from '../axios';

interface BookingRequest {
    storageId: string,
    rentedVolumeCubicMeter: number,
    rentedWeightKg: number,
    startDate: string,
    endDate: string
}

export const createBooking = async (request: BookingRequest) => {
    const req = await api.post(`/bookings/create`, request)
    return req.data;
}

export const cancelBooking = async (orderId: string) => {
    const req = await api.post(`/bookings/${orderId}/cancel`)
    return req.data
}

export const getCapacity = async (storageId:string,startDate:Date,endDate:Date) => {
    const req = await api.get(`/bookings/${storageId}/capacity?startDate=${startDate}&endDate=${endDate}`);
    return req.data
}

export const getBookings = async () => {
    const req = await api.get(`/bookings/my-bookings`)
    return req.data
}

export const getStorageBooking = async (storageId: string) => {
    const req = await api.get(`/bookings/${storageId}`)
    return req.data
}

export const getOwnerBookings = async () => {
    const req = await api.get(`/bookings/owner`)
    return req.data
}