import { api } from '@/api/axios-instance'
import type {
    Task,
    Column,
    CreateTaskDto,
    UpdateTaskDto,
    TasksQueryParams,
    CreateColumnDto,
    UpdateColumnDto,
} from '../types/tasks.types'

export const tasksApi = {
    // ─── Tasks ───

    // POST /projects/:projectId/tasks
    createTask: async (projectId: number, data: CreateTaskDto): Promise<Task> => {
        const response = await api.post<Task>(`/projects/${projectId}/tasks`, data)
        return response.data
    },

    // GET /tasks?projectId=X&...
    getTasks: async (params: TasksQueryParams): Promise<Task[]> => {
        const response = await api.get<Task[]>('/tasks', { params })
        return response.data
    },

    // GET /tasks/:id
    getTask: async (id: number): Promise<Task> => {
        const response = await api.get<Task>(`/tasks/${id}`)
        return response.data
    },

    // PATCH /tasks/:id
    updateTask: async (id: number, data: UpdateTaskDto): Promise<Task> => {
        const response = await api.patch<Task>(`/tasks/${id}`, data)
        return response.data
    },

    // DELETE /tasks/:id
    deleteTask: async (id: number): Promise<void> => {
        await api.delete(`/tasks/${id}`)
    },

    // ─── Columns ───

    // GET /projects/:projectId/columns
    getColumns: async (projectId: number): Promise<Column[]> => {
        const response = await api.get<Column[]>(`/projects/${projectId}/columns`)
        return response.data
    },

    // POST /projects/:projectId/columns
    createColumn: async (projectId: number, data: CreateColumnDto): Promise<Column> => {
        const response = await api.post<Column>(`/projects/${projectId}/columns`, data)
        return response.data
    },

    // PATCH /projects/:projectId/columns/:columnId
    updateColumn: async (projectId: number, columnId: number, data: UpdateColumnDto): Promise<Column> => {
        const response = await api.patch<Column>(`/projects/${projectId}/columns/${columnId}`, data)
        return response.data
    },

    // DELETE /projects/:projectId/columns/:columnId
    deleteColumn: async (projectId: number, columnId: number): Promise<void> => {
        await api.delete(`/projects/${projectId}/columns/${columnId}`)
    },
}
