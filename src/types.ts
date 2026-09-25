export interface User {
    id: string
    email: string
    username: string
    userType: UserType
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

export type UserType = "SELLER_ROLE" | "BUYER_ROLE" | "";
export type AuthAction = "OTP_SENT" | "RESUME_ONBOARDING" | "LOGIN_REQUIRED";
export type Step = "info" | "otp" | "information";

