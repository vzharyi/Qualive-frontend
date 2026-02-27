import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from './tasks.api'
import type {
    CreateTaskDto,
    UpdateTaskDto,
    TasksQueryParams,
    CreateColumnDto,
    UpdateColumnDto,
} from '../types/tasks.types'

// ─── Query Keys ───
export const taskKeys = {
    all: ['tasks'] as const,
    lists: () => [...taskKeys.all, 'list'] as const,
    list: (params: TasksQueryParams) => [...taskKeys.lists(), params] as const,
    details: () => [...taskKeys.all, 'detail'] as const,
    detail: (id: number) => [...taskKeys.details(), id] as const,
}

export const columnKeys = {
    all: ['columns'] as const,
    byProject: (projectId: number) => [...columnKeys.all, projectId] as const,
}

// ─── Task Queries ───
export function useTasks(params: TasksQueryParams) {
    return useQuery({
        queryKey: taskKeys.list(params),
        queryFn: () => tasksApi.getTasks(params),
        enabled: !!params.projectId,
    })
}

export function useTask(id: number) {
    return useQuery({
        queryKey: taskKeys.detail(id),
        queryFn: () => tasksApi.getTask(id),
        enabled: !!id,
    })
}

// ─── Task Mutations ───
export function useCreateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: number; data: CreateTaskDto }) =>
            tasksApi.createTask(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
        },
    })
}

export function useUpdateTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTaskDto }) =>
            tasksApi.updateTask(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
        },
    })
}

export function useDeleteTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => tasksApi.deleteTask(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
        },
    })
}

// ─── Column Queries ───
export function useColumns(projectId: number) {
    return useQuery({
        queryKey: columnKeys.byProject(projectId),
        queryFn: () => tasksApi.getColumns(projectId),
        enabled: !!projectId,
    })
}

// ─── Column Mutations ───
export function useCreateColumn() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: number; data: CreateColumnDto }) =>
            tasksApi.createColumn(projectId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: columnKeys.byProject(projectId) })
        },
    })
}

export function useUpdateColumn() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            projectId,
            columnId,
            data,
        }: {
            projectId: number
            columnId: number
            data: UpdateColumnDto
        }) => tasksApi.updateColumn(projectId, columnId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: columnKeys.byProject(projectId) })
        },
    })
}

export function useDeleteColumn() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, columnId }: { projectId: number; columnId: number }) =>
            tasksApi.deleteColumn(projectId, columnId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: columnKeys.byProject(projectId) })
            queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
        },
    })
}
