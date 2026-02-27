import { api, API_BASE_URL } from '@/api/axios-instance'
import type { LoginDto, RegisterDto, AuthResponse } from '../types/auth.types'

export const authApi = {
    login: async (data: LoginDto): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', data)
        return response.data
    },

    register: async (data: RegisterDto): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/register', data)
        return response.data
    },

    googleAuth: () => {
        window.location.href = `${API_BASE_URL}/auth/google`
    },

    githubAuth: () => {
        window.location.href = `${API_BASE_URL}/auth/github`
    },
}
