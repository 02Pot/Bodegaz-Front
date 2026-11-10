import type { BookingStatus, MaterialType } from './constant'

export interface User {
    id: string
    email: string
    name: string
    userType: UserType
    isVerified: true
    isRegistered: true
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    name: string
    otp: string
    contactNumber: string
    userType: UserType
    password: string
}

export interface AuthTokens {
    accessToken: string
    refreshToken?: string
}

export interface AddressResponse {
    addressLine1: string
    addressLine2: string | null
    city: string
    stateProvince: string
    country: string
    postalCode: string
}

export interface WarehouseImageResponse {
    imageId: string
    fileName: string
    contentType: string
    sizeBytes: string
    url: string
}

export interface WarehouseResponse {
    warehouseId: string
    name: string
    warehouseCapacityKg: number
    viewCount: number | null
    createdAt: string
    userId: string
    address: AddressResponse
    saved: boolean
    imageUrls: string[]
}

export interface SellerWarehouseResponse {
    warehouseId: string
    name: string
    warehouseCapacityKg: number
    viewCount: number | null
    createdAt: string
    address: AddressResponse
    allocatedKg: number
    storageCount: number
    bookedCount: number
    draft: boolean
    images: WarehouseImageResponse[]
}

export interface WarehouseRequest {
    name: string
    warehouseCapacityKg: number
    viewCount?: number | null
    addressLine1: string
    addressLine2?: string | null
    city: string
    stateProvince: string
    country: string
    postalCode: string
}

export interface StorageTypeResponse {
    storageTypeId: string
    name: string
    lengthMeters: number
    breadthMeters: number
    heightMeters: number
    capacityWeight: number
    volumeCubicMeters: number
}

export interface StorageResponse {
    storageId: string
    blockName: string
    section: string | null
    maxWeight: number
    isAvailable: boolean
    pricePerCubicMeter: number
    maxVolumeCubicMeter: number
    materialType: MaterialType
    storageTypeId: string
    warehouseId: string
}

export interface StorageRequest {
    blockName: string
    section?: string | null
    maxWeight?: number | null
    materialType: MaterialType
    pricePerCubicMeter: number
    maxVolumeCubicMeter: number
    storageTypeId: string
    quantity?: number | null
}

export type LeaseStatus =
    | 'DRAFT'
    | 'REVIEWING'
    | 'AWAITING_SIGNATURE'
    | 'ACTIVE'
    | 'EXPIRED'
    | 'TERMINATED'
    | 'COLLECTIONS'
    | 'PENDING_RENEWAL'
    | 'CANCELLED'

export interface LeaseView {
    leaseId: string
    bookingId: string
    agreementNumber: string
    termsConditions: string
    termsHash: string
    keyTerms: Record<string, string>
    status: LeaseStatus
    signDate: string | null
    holdExpiresAt?: string | null
}

export interface AcceptTermsRequest {
    agreed: boolean
    termsHash: string
}

export interface AcceptTermsResponse {
    bookingId: string
    leaseId: string
    agreementNumber: string
    leaseStatus: LeaseStatus
    bookingStatus: BookingStatus
    signDate: string
}

export interface LeaseSummary {
    leaseId: string
    bookingId: string
    agreementNumber: string
    unitNumber: string
    tenantName: string
    status: LeaseStatus
    startDate: string
    endDate: string
    signDate: string | null
}

export interface LeaseClause {
    key: string
    title: string
    body: string
}

export interface BookingRequest {
    storageId: string
    startDate: string
    endDate: string
    rentedVolumeCubicMeter: number
    rentedWeightKg: number
}

export interface LeaseTemplateConfig {
    termMonths: number
    autoRenew: boolean
    billingCycle: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL'
    billingDay: number
    gracePeriodDays: number
    lateFee: { type: 'PERCENT' | 'FIXED'; value: number }
    deposit: { type: 'MONTHS_OF_RENT' | 'FIXED'; value: number }
    depositRefundDays: number
    noticeDaysToTerminate: number
    defaultDays: number
    insuranceRequired: boolean
    permittedItems: string[]
    accessHours: string
}

export interface LeaseTemplate {
    id: string
    ownerId: string | null
    name: string
    version: number
    platformDefault: boolean
    active: boolean
    config: LeaseTemplateConfig
    clauses: LeaseClause[]
    createdAt: string
    updatedAt: string
}

export interface OwnerBooking {
    orderId: string
    unitNumber: string
    startDate: string
    endDate: string
    status: string
    rentedVolumeCubicMeter: number
    rentedWeightKg: number
    totalPrice: number
    warehouseId: string
    warehouseName: string
    storageId: string
    blockName: string
    section: string
    tenant?: TenantSummary
}

export interface CreateLeaseTemplateRequest {
    name: string
    config: LeaseTemplateConfig
    clauses: LeaseClause[]
}

export interface ApiError {
    timestamp: string
    status: number
    error: string
    message: string
    fieldErrors: Record<string, string> | null
}

export interface TenantSummary {
    id: string
    name: string
    email: string
    contactNumber: string | null
    profilePicUrl: string | null
}

export interface BookingDetailResponse {
    orderId: string
    unitNumber: string
    startDate: string
    endDate: string
    status: BookingStatus
    rentedWeightKg: number
    rentedVolumeCubicMeter: number
    storage: StorageResponse
    warehouse: WarehouseResponse
}

export interface ScrollResponse<T> {
    items: T[]
    nextCursor: string | null
    hasNext: boolean
}

export type Range = {
    min: string
    max: string
}

export type Filters = {
    capacity: string
    city: string
    area: Range
    budget: Range
    sortOrder: 'newest' | 'oldest' | ''
    customDate: string
}

export type UserType = 'SELLER_ROLE' | 'BUYER_ROLE' | ''
export type AuthAction = 'OTP_SENT' | 'RESUME_ONBOARDING' | 'LOGIN_REQUIRED'
export type Step = 'info' | 'otp' | 'information'
