import type { BookingStatus, MaterialType } from "./constant"

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
    email: string;
    name: string;
    otp: string;
    contactNumber: string;
    userType: UserType
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}

export interface AddressResponse {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    stateProvince: string;
    country: string;
    postalCode: string;
}

export interface WarehouseImageResponse {
    imageId: string;
    fileName: string,
    contentType: string,
    sizeBytes: string
    url: string;
}

export interface WarehouseResponse {
    warehouseId: string;
    name: string;
    warehouseCapacityKg: number;
    viewCount: number | null;
    createdAt: string;
    userId: string;
    address: AddressResponse;
    saved: boolean;
    imageUrls: string[];
}

export interface SellerWarehouseResponse {
    warehouseId: string;
    name: string;
    warehouseCapacityKg: number;
    viewCount: number | null;
    createdAt: string;
    address: AddressResponse;
    allocatedKg: number;
    storageCount: number;
    bookedCount: number;
    draft: boolean;
    images: WarehouseImageResponse[];
}

export interface WarehouseRequest {
    name: string;
    warehouseCapacityKg: number;
    viewCount?: number | null;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    stateProvince: string;
    country: string;
    postalCode: string;
}

export interface StorageTypeResponse {
    storageTypeId: string;
    name: string;
    lengthMeters: number;
    breadthMeters: number;
    heightMeters: number;
    capacityWeight: number;
    volumeCubicMeters: number;
}

export interface StorageResponse {
    storageId: string;
    blockName: string;
    section: string | null;
    maxWeight: number;
    isAvailable: boolean;
    pricePerCubicMeter: number;
    maxVolumeCubicMeter: number;
    materialType: MaterialType;
    storageTypeId: string;
    warehouseId: string;
}

export interface StorageRequest {
    blockName: string;
    section?: string | null;
    maxWeight?: number | null;
    materialType: MaterialType;
    pricePerCubicMeter: number;
    maxVolumeCubicMeter: number;
    storageTypeId: string;
    quantity?: number | null;
}

export interface BookingsResponse {
    orderId: string,
    storageId: string,
    unitNumber: string,
    startDate: string,
    endDate: string,
    status: BookingStatus,
    storage: StorageResponse,
    warehouse: WarehouseResponse
}

export type LeaseStatus =
    | "DRAFT"
    | "REVIEWING"
    | "AWAITING_SIGNATURE"
    | "ACTIVE"
    | "EXPIRED"
    | "TERMINATED"
    | "COLLECTIONS"
    | "PENDING_RENEWAL"
    | "CANCELLED";

export interface LeaseView {
    leaseId: string;
    bookingId: string;
    agreementNumber: string;
    termsConditions: string;
    termsHash: string;
    keyTerms: Record<string, string>;
    status: LeaseStatus;
    signDate: string | null;
    holdExpiresAt?: string | null
}

export interface AcceptTermsRequest {
    agreed: boolean;
    termsHash: string
}

export interface AcceptTermsResponse {
    bookingId: string;
    leaseId: string;
    agreementNumber: string;
    leaseStatus: LeaseStatus;
    bookingStatus: BookingStatus;
    signDate: string;
}

export interface LeaseSummary {
    leaseId: string;
    bookingId: string;
    agreementNumber: string;
    unitNumber: string;
    tenantName: string;
    status: LeaseStatus;
    startDate: string;
    endDate: string;
    signDate: string | null;
}

export interface LeaseClause {
    key: string;
    title: string;
    body: string;
}

export interface BookingRequest {
    storageId: string
    startDate: string
    endDate: string
    rentedVolumeCubicMeter: number
    rentedWeightKg: number
}

export interface LeaseTemplateConfig {
    termMonths: number;
    autoRenew: boolean;
    billingCycle: "MONTHLY" | "QUARTERLY" | "ANNUAL";
    billingDay: number;
    gracePeriodDays: number;
    lateFee: { type: "PERCENT" | "FIXED"; value: number };
    deposit: { type: "MONTHS_OF_RENT" | "FIXED"; value: number };
    depositRefundDays: number;
    noticeDaysToTerminate: number;
    defaultDays: number;
    insuranceRequired: boolean;
    permittedItems: string[];
    accessHours: string;
}

export interface LeaseTemplate {
    id: string;
    ownerId: string | null;
    name: string;
    version: number;
    platformDefault: boolean;
    active: boolean;
    config: LeaseTemplateConfig;
    clauses: LeaseClause[];
    createdAt: string;
    updatedAt: string;
}

export interface OwnerBooking {
    orderId: string; 
    unitNumber: string; 
    startDate: string; 
    endDate: string;
    status: string; 
    rentedVolumeCubicMeter: number; 
    rentedWeightKg: number;
    totalPrice: number; 
    warehouseId: string; 
    warehouseName: string; 
    storageId: string;
    blockName: string; 
    section: string; 
    tenantName: string; 
    tenantEmail: string;
};

export interface CreateLeaseTemplateRequest {
    name: string;
    config: LeaseTemplateConfig;
    clauses: LeaseClause[];
}

export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    fieldErrors: Record<string, string> | null;
}

export interface ScrollResponse<T> {
    items: T[];
    nextCursor: string | null;
    hasNext: boolean;
}

export type UpdateLeaseTemplateRequest = Partial<CreateLeaseTemplateRequest>;

export type UserType = "SELLER_ROLE" | "BUYER_ROLE" | "";
export type AuthAction = "OTP_SENT" | "RESUME_ONBOARDING" | "LOGIN_REQUIRED";
export type Step = "info" | "otp" | "information";


export const defaultConfig: LeaseTemplateConfig = {
    termMonths: 12, autoRenew: false, billingCycle: 'MONTHLY', billingDay: 1,
    gracePeriodDays: 5, lateFee: { type: 'PERCENT', value: 5 },
    deposit: { type: 'MONTHS_OF_RENT', value: 1 }, depositRefundDays: 30,
    noticeDaysToTerminate: 30, defaultDays: 15, insuranceRequired: false,
    permittedItems: [], accessHours: '8:00 AM – 6:00 PM',
}

export const defaultClauses: LeaseClause[] = [
    { key: 'maintenance', title: 'Maintenance Responsibilities', body: 'The owner maintains the structure. The renter keeps the unit clean and reports damage.' },
    { key: 'cancellation', title: 'Cancellation', body: 'Either party may terminate with the notice period stated above.' },
    { key: 'renewal', title: 'Renewal', body: 'The lease renews only if auto-renew is enabled or both parties agree.' },
]