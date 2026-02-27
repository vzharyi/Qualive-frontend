import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from './users.api'
import type { UpdateUserDto } from '../types/users.types'
import type { RegisterDto } from '@/features/auth/types/auth.types'

// ─── Query Keys ───
export const userKeys = {
    all: ['users'] as const,
    me: ['users', 'me'] as const,
    detail: (id: number) => ['users', id] as const,
}

// ─── Queries ───

export function useMe() {
    return useQuery({
        queryKey: userKeys.me,
        queryFn: usersApi.getMe,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 min
    })
}

export function useUsers() {
    return useQuery({
        queryKey: userKeys.all,
        queryFn: usersApi.getUsers,
    })
}

export function useUser(id: number) {
    return useQuery({
        queryKey: userKeys.detail(id),
        queryFn: () => usersApi.getUserById(id),
        enabled: !!id,
    })
}

// ─── Mutations ───

export function useCreateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: RegisterDto) => usersApi.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all })
        },
    })
}

export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
            usersApi.updateUser(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all })
            queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) })
            queryClient.invalidateQueries({ queryKey: userKeys.me })
        },
    })
}

export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => usersApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all })
        },
    })
}
