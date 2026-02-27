import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from './auth.api'
import { useAuth } from '../store/auth.store'
import type { LoginDto, RegisterDto } from '../types/auth.types'

export function useLogin() {
    const { setAuth } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: LoginDto) => authApi.login(data),
        onSuccess: (response) => {
            setAuth(response.accessToken, response.user)
            queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
            navigate('/dashboard')
        },
    })
}

export function useRegister() {
    const { setAuth } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: RegisterDto) => authApi.register(data),
        onSuccess: (response) => {
            setAuth(response.accessToken, response.user)
            queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
            navigate('/dashboard')
        },
    })
}
