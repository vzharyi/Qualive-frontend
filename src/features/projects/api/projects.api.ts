import { api } from '@/api/axios-instance'
import type {
    Project,
    CreateProjectDto,
    UpdateProjectDto,
    AddMemberDto,
    ProjectMember,
} from '../types/projects.types'

export const projectsApi = {
    // ─── Projects CRUD ───
    getProjects: async (): Promise<Project[]> => {
        const response = await api.get<Project[]>('/projects')
        return response.data
    },

    getProject: async (id: number): Promise<Project> => {
        const response = await api.get<Project>(`/projects/${id}`)
        return response.data
    },

    createProject: async (data: CreateProjectDto): Promise<Project> => {
        const response = await api.post<Project>('/projects', data)
        return response.data
    },

    updateProject: async (id: number, data: UpdateProjectDto): Promise<Project> => {
        const response = await api.patch<Project>(`/projects/${id}`, data)
        return response.data
    },

    deleteProject: async (id: number): Promise<void> => {
        await api.delete(`/projects/${id}`)
    },

    // ─── Members ───
    addMember: async (projectId: number, data: AddMemberDto): Promise<ProjectMember> => {
        const response = await api.post<ProjectMember>(`/projects/${projectId}/members`, data)
        return response.data
    },

    removeMember: async (projectId: number, userId: number): Promise<void> => {
        await api.delete(`/projects/${projectId}/members/${userId}`)
    },
}

