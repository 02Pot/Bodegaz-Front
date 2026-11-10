import { api } from '../axios'

interface BookingRequest {
    storageId: string
    rentedVolumeCubicMeter: number
    rentedWeightKg: number
    startDate: string
    endDate: string
}

export const createBooking = async (request: BookingRequest) => {
    const req = await api.post(`/bookings/create`, request)
    return req.data
}

export const cancelBooking = async (orderId: string) => {
    const req = await api.post(`/bookings/${orderId}/cancel`)
    return req.data
}

export const getCapacity = async (
    storageId: string,
    startDate: Date,
    endDate: Date
) => {
    const req = await api.get(
        `/bookings/${storageId}/capacity?startDate=${startDate}&endDate=${endDate}`
    )
    return req.data
}

export const getBookings = async ({
    cursor,
    limit = 10,
}: { cursor?: string; limit?: number } = {}) => {
    const req = await api.get(`/bookings/my-bookings`, {
        params: { cursor, limit },
    })
    return req.data
}

export const getStorageBooking = async (storageId: string) => {
    const req = await api.get(`/bookings/${storageId}`)
    return req.data
}

export const getOwnerBookings = async ({
    page,
    size,
    search,
    status,
}: {
    page: number
    size: number
    search?: string
    status?: string
}) => {
    const req = await api.get(`/bookings/owner`, {
        params: {
            page,
            size,
            search: search || undefined,
            status: status && status !== 'all' ? status : undefined,
        },
    })
    return req.data
}

export const approveBooking = async (orderId: string) => {
    const req = await api.post(`/bookings/${orderId}/approve`)
    return req.data
}

export const rejectBooking = async (orderId: string) => {
    const req = await api.post(`/bookings/${orderId}/reject`)
    return req.data
}

export const getOwnerBookingStats = async (): Promise<{
    active: number
    pending: number
    total: number
    endingSoon: number
    revenue: number
}> => (await api.get(`/bookings/owner/stats`)).data
