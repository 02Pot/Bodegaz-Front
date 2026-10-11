import type { LoginRequest, User } from '@/types';
import { api } from '../axios';

export const login = async (data: LoginRequest): Promise<User> => {
    const req = await api.post<User>(`/auth/login`, data);
    return req.data;
};

export const register = async ( email: string,contactNumber: string,password: string,userType: string,file?: File | null) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('contactNumber', contactNumber);
    formData.append('password', password);
    formData.append('userType', userType);
    if (file) formData.append('file', file);

    const res = await api.post('/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
}

export const authcheck = async (): Promise<User | null> => {
    const { data } = await api.get<User>(`/auth/me`);
    if (!data || typeof data !== "object" || !("email" in data)) return null;
    return data;
};

export const logout = async (): Promise<void> => {
    await api.post(`/auth/logout`);
};

export const sendOtp = async (name: string, email: string) => {
    const response = await api.post(`/auth/otp/send`, { name, email });
    return response.data;
}

export const verifyOtp = async (email:string,otp: string) => {
    const response = await api.post(`/auth/otp/verify`,{email,otp})
    return response.data;
}
