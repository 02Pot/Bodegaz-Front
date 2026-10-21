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

export const confirmBooking = async (orderId: string) => {
    const req = await api.post(`/bookings/${orderId}/confirm`)
    return req.data
}

export const cancelBooking = async (orderId: string) => {
    const req = await api.post(`/bookings/${orderId}/cancel`)
    return req.data
}
