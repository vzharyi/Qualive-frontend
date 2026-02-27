import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from './projects.api'
import type {
    CreateProjectDto,
    UpdateProjectDto,
    AddMemberDto,
    CreateTaskInProjectDto,
} from '../types/projects.types'

// ─── Query Keys ───
export const projectKeys = {
    all: ['projects'] as const,
    detail: (id: number) => ['projects', id] as const,
}

// ─── Queries ───

export function useProjects() {
    return useQuery({
        queryKey: projectKeys.all,
        queryFn: projectsApi.getProjects,
    })
}

export function useProject(id: number) {
    return useQuery({
        queryKey: projectKeys.detail(id),
        queryFn: () => projectsApi.getProject(id),
        enabled: !!id,
    })
}

// ─── Mutations ───

export function useCreateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateProjectDto) => projectsApi.createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all })
        },
    })
}

export function useUpdateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateProjectDto }) =>
            projectsApi.updateProject(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all })
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) })
        },
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => projectsApi.deleteProject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: projectKeys.all })
        },
    })
}

export function useAddMember() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: number; data: AddMemberDto }) =>
            projectsApi.addMember(projectId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
        },
    })
}

export function useRemoveMember() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, userId }: { projectId: number; userId: number }) =>
            projectsApi.removeMember(projectId, userId),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
        },
    })
}

export function useCreateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: number; data: CreateTaskInProjectDto }) =>
            projectsApi.createTask(projectId, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) })
        },
    })
}
