import { createContext, useContext } from 'react'
import type { User } from '../types/auth.types'

export interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean
}

export interface AuthContextValue extends AuthState {
    setAuth: (token: string, user: User) => void
    logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return ctx
}
