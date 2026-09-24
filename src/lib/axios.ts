import type { AuthTokens } from "@/types";
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "/api";

export const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let accessToken: string | null = localStorage.getItem("accessToken");

export const setAccessToken = (token: string | null) => {
    accessToken = token;
    if (token) {
        localStorage.setItem("accessToken", token);
    } else {
        localStorage.removeItem("accessToken");
    }
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
            if (!refreshPromise) {
            refreshPromise = api
                .post<AuthTokens>("/auth/refresh")
                .then((res) => {
                setAccessToken(res.data.accessToken);
                return res.data.accessToken;
                })
                .catch(() => {
                setAccessToken(null);
                return null;
                })
                .finally(() => {
                refreshPromise = null;
                });
            }
            const newToken = await refreshPromise;
            if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
            }
        } catch {
            setAccessToken(null);
        }
        }
        return Promise.reject(error);
    }
);
