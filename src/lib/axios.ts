import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";

const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "/api";
const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/refresh-token"];

export const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

let refreshPromise: Promise<boolean> | null = null;

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
        };
        
        const isAuthRoute = AUTH_ROUTES.some((route) => 
            originalRequest?.url?.includes(route)
        );

        if (error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthRoute
        ) {

            if (!refreshPromise) {
                refreshPromise = api
                    .post("/auth/refresh-token")
                    .then(() => true)
                    .catch(() => false)
                    .finally(() => {
                        refreshPromise = null
                    });
            }

            const refreshed = await refreshPromise;
            if (refreshed) {
                originalRequest._retry = true
                return api(originalRequest)
            }
        }

        return Promise.reject(error);
    }
);
