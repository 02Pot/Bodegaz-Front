import { useContext } from 'react'
import { type AuthContextValue, AuthContext } from '../context/authContext'

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
    return ctx
}
