import { authcheck } from '@/lib/api/auth'
import type { LoginRequest, User } from '@/types'
import { queryOptions } from '@tanstack/react-query'
import { createContext } from 'react'

export interface AuthContextValue {
    currentUser: User | null | undefined
    isLoading: boolean
    isAuthenticated: boolean
    login: (payload: LoginRequest) => Promise<void>
    logout: () => Promise<void>
    loginError: string | null
    isLoggingIn: boolean
}

export const authQueryOptions = queryOptions({
    queryKey: ['auth', 'me'],
    queryFn: async (): Promise<User | null> => {
        try {
            return await authcheck()
        } catch {
            return null
        }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
})

export const AuthContext = createContext<AuthContextValue | undefined>(
    undefined
)
