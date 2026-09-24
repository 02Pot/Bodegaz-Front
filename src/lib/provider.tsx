import type { LoginRequest, User } from "@/types";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { authcheck, login as loginRequest, logout as logoutRequest } from "./api/auth";

interface AuthContextValue {
    user: User | null | undefined;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (payload: LoginRequest) => Promise<void>;
    logout: () => Promise<void>;
    loginError: string | null;
    isLoggingIn: boolean;
}

export const authQueryOptions = queryOptions({
    queryKey: ["auth", "me"],
    queryFn: async (): Promise<User | null> => {
        try {
        return await authcheck();
        } catch {
        return null;
        }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
});


const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
    return ctx;
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();
    const [loginError, setLoginError] = useState<string | null>(null);

    const { data: user, isLoading } = useQuery(authQueryOptions);

    const { mutateAsync: loginAsync, isPending: isLoggingIn } = useMutation({
        mutationFn: loginRequest,
        onSuccess: async () => {
        setLoginError(null);
        // refetch /auth/me so the cache holds a real User
        await queryClient.invalidateQueries({ queryKey: authQueryOptions.queryKey });
        },
        onError: (error: AxiosError<{ message?: string }>) => {
        setLoginError(error.response?.data?.message ?? "Login failed");
        },
    });
    
    const { mutateAsync: logoutAsync } = useMutation({
        mutationFn: logoutRequest,
        onSuccess: () => {
        queryClient.setQueryData(authQueryOptions.queryKey, null);
        queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== "auth" });
        },
    });

    const value = useMemo<AuthContextValue>(
        () => ({
        user,
        isLoading,
        isAuthenticated: !!user,
        login: async (payload) => { await loginAsync(payload); },
        logout: async () => { await logoutAsync(); },
        loginError,
        isLoggingIn,
        }),
        [user, isLoading, loginAsync, logoutAsync, loginError, isLoggingIn]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
