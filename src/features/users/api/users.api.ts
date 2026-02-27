import { api } from '@/api/axios-instance'
import type { User, RegisterDto } from '@/features/auth/types/auth.types'
import type { UpdateUserDto } from '../types/users.types'

export const usersApi = {
    getMe: async (): Promise<User> => {
        const response = await api.get<User>('/users/me')
        return response.data
    },

    getUsers: async (): Promise<User[]> => {
        const response = await api.get<User[]>('/users')
        return response.data
    },

    getUserById: async (id: number): Promise<User> => {
        const response = await api.get<User>(`/users/${id}`)
        return response.data
    },

    createUser: async (data: RegisterDto): Promise<User> => {
        const response = await api.post<User>('/users', data)
        return response.data
    },

    updateUser: async (id: number, data: UpdateUserDto): Promise<User> => {
        const response = await api.patch<User>(`/users/${id}`, data)
        return response.data
    },

    deleteUser: async (id: number): Promise<void> => {
        await api.delete(`/users/${id}`)
    },
}
