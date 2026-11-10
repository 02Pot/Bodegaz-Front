import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { useMemo, useState, type ReactNode } from 'react'
import { login as loginRequest, logout as logoutRequest } from '../api/auth'
import {
    AuthContext,
    authQueryOptions,
    type AuthContextValue,
} from '../context/authContext'

export function AuthProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient()
    const [loginError, setLoginError] = useState<string | null>(null)

    const { data: currentUser, isLoading } = useQuery(authQueryOptions)

    const { mutateAsync: loginAsync, isPending: isLoggingIn } = useMutation({
        mutationFn: loginRequest,
        onMutate: () => setLoginError(null),
        onSuccess: async () => {
            setLoginError(null)
            await queryClient.invalidateQueries({
                queryKey: authQueryOptions.queryKey,
            })
        },
        onError: (error: AxiosError<{ message?: string }>) => {
            setLoginError(error.response?.data?.message ?? 'Login failed')
        },
    })

    const { mutateAsync: logoutAsync } = useMutation({
        mutationFn: logoutRequest,
        onSuccess: () => {
            queryClient.setQueryData(authQueryOptions.queryKey, null)
            queryClient.removeQueries({
                predicate: (q) => q.queryKey[0] !== 'auth',
            })
        },
    })

    const value = useMemo<AuthContextValue>(
        () => ({
            currentUser,
            isLoading,
            isAuthenticated: !!currentUser,
            login: async (payload) => {
                await loginAsync(payload)
            },
            logout: async () => {
                await logoutAsync()
            },
            loginError,
            isLoggingIn,
        }),
        [
            currentUser,
            isLoading,
            loginAsync,
            logoutAsync,
            loginError,
            isLoggingIn,
        ]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
