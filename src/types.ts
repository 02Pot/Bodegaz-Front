import type { MaterialType } from "./constant"

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

export interface ApiError {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    fieldErrors: Record<string, string> | null;
}

export type UserType = "SELLER_ROLE" | "BUYER_ROLE" | "";
export type AuthAction = "OTP_SENT" | "RESUME_ONBOARDING" | "LOGIN_REQUIRED";
export type Step = "info" | "otp" | "information";

