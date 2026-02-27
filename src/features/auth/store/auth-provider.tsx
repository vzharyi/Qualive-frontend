import { useState, useCallback, useMemo, type ReactNode } from 'react'
import { AuthContext, type AuthState } from './auth.store'
import type { User } from '../types/auth.types'

function getInitialState(): AuthState {
    const token = localStorage.getItem('accessToken')
    const userJson = localStorage.getItem('user')

    let user: User | null = null
    if (userJson) {
        try {
            user = JSON.parse(userJson)
        } catch {
            localStorage.removeItem('user')
        }
    }

    return {
        accessToken: token,
        user,
        isAuthenticated: !!token && !!user,
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(getInitialState)

    const setAuth = useCallback((token: string, user: User) => {
        localStorage.setItem('accessToken', token)
        localStorage.setItem('user', JSON.stringify(user))
        setState({ accessToken: token, user, isAuthenticated: true })
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        setState({ accessToken: null, user: null, isAuthenticated: false })
    }, [])

    const value = useMemo(
        () => ({ ...state, setAuth, logout }),
        [state, setAuth, logout],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
