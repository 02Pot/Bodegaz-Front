import type {
    AcceptTermsRequest,
    AcceptTermsResponse,
    BookingRequest,
    CreateLeaseTemplateRequest,
    LeaseSummary,
    LeaseTemplate,
    LeaseView,
    UpdateLeaseTemplateRequest,
} from '@/types'
import { api } from '../axios'

export const previewLease = async (
    body: BookingRequest
): Promise<LeaseView> => {
    const req = await api.post(`/leases/preview`, body)
    return req.data
}

export const getLease = async (bookingId: string): Promise<LeaseView> => {
    const req = await api.get(`/bookings/${bookingId}/lease`)
    return req.data
}

export const acceptTerms = async (
    bookingId: string,
    request: AcceptTermsRequest
): Promise<AcceptTermsResponse> => {
    const req = await api.post(`/bookings/${bookingId}/accept-terms`, request)
    return req.data
}

export const getMyLeases = async (): Promise<LeaseSummary[]> => {
    const req = await api.get(`/leases/mine`)
    return req.data
}

export const getOwnerLeases = async (): Promise<LeaseSummary[]> => {
    const req = await api.get(`/leases/owner`)
    return req.data
}

export const getDefaultLeaseTemplate = async (): Promise<LeaseTemplate> => {
    const req = await api.get(`/lease-templates/default`)
    return req.data
}

export const getMyLeaseTemplates = async (): Promise<LeaseTemplate[]> => {
    const req = await api.get(`/lease-templates/mine`)
    return req.data
}

export const getLeaseTemplate = async (id: string): Promise<LeaseTemplate> => {
    const req = await api.get(`/lease-templates/${id}`)
    return req.data
}

export const createLeaseTemplate = async (
    request: CreateLeaseTemplateRequest
): Promise<LeaseTemplate> => {
    const req = await api.post(`/lease-templates`, request)
    return req.data
}

export const updateLeaseTemplate = async (
    id: string,
    request: UpdateLeaseTemplateRequest
): Promise<LeaseTemplate> => {
    const req = await api.put(`/lease-templates/${id}`, request)
    return req.data
}

export const deactivateLeaseTemplate = async (id: string): Promise<void> => {
    await api.delete(`/lease-templates/${id}`)
}
