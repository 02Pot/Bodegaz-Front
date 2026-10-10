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

export interface WarehouseInterface{
    warehouseId: string,
    name: string,
    warehouseCapacityKg: string,
    viewCount: string,
    address: WarehouseAddress,
    createAt: Date,
    saved: boolean,
    imageUrls: string[]
}

export interface WarehouseAddress{
    id: string,
    addressLine1: string,
    addressLine2: string,
    city: string,
    stateProvince: string,
    country: string,
    postalCode: string,
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

