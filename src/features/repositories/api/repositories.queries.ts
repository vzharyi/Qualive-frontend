import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { repositoriesApi } from './repositories.api'
import type { CreateRepositoryDto, UpdateRepositoryDto } from '../types/repositories.types'

export const repositoryKeys = {
    all: ['repositories'] as const,
    byProject: (projectId: number) => [...repositoryKeys.all, 'project', projectId] as const,
    detail: (id: number) => [...repositoryKeys.all, 'detail', id] as const,
}

// ─── Queries ───
export function useProjectRepositories(projectId: number) {
    return useQuery({
        queryKey: repositoryKeys.byProject(projectId),
        queryFn: () => repositoriesApi.getProjectRepositories(projectId),
        enabled: !!projectId,
    })
}

export function useRepository(id: number) {
    return useQuery({
        queryKey: repositoryKeys.detail(id),
        queryFn: () => repositoriesApi.getRepository(id),
        enabled: !!id,
    })
}

// ─── Mutations ───
export function useCreateRepository() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateRepositoryDto) => repositoriesApi.createRepository(data),
        onSuccess: (newRepo) => {
            queryClient.invalidateQueries({ queryKey: repositoryKeys.byProject(newRepo.projectId) })
        },
    })
}

export function useUpdateRepository() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateRepositoryDto }) =>
            repositoriesApi.updateRepository(id, data),
        onSuccess: (updatedRepo) => {
            queryClient.invalidateQueries({ queryKey: repositoryKeys.byProject(updatedRepo.projectId) })
            queryClient.invalidateQueries({ queryKey: repositoryKeys.detail(updatedRepo.id) })
        },
    })
}

export function useDeleteRepository() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => repositoriesApi.deleteRepository(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: repositoryKeys.all })
        },
    })
}

export function useGithubInstallHelper() {
    return useMutation({
        mutationFn: (projectId: number) => repositoriesApi.getGithubInstallUrl(projectId),
    })
}
