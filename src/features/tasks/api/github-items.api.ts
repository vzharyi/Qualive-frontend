import { api } from '@/api/axios-instance'
import type {
    TaskGithubItem,
    CreateGithubItemDto,
    GithubPullRequest,
    GithubCommit,
} from '../types/github-items.types'

export const githubItemsApi = {
    // ─── Task GitHub Items (CRUD) ───

    // POST /tasks/:taskId/github-items
    linkItem: async (taskId: number, data: CreateGithubItemDto): Promise<TaskGithubItem> => {
        const response = await api.post<TaskGithubItem>(`/tasks/${taskId}/github-items`, data)
        return response.data
    },

    // GET /tasks/:taskId/github-items
    getItems: async (taskId: number): Promise<TaskGithubItem[]> => {
        const response = await api.get<TaskGithubItem[]>(`/tasks/${taskId}/github-items`)
        return response.data
    },

    // DELETE /github-items/:id
    unlinkItem: async (id: number): Promise<void> => {
        await api.delete(`/github-items/${id}`)
    },

    // ─── GitHub Lists (for dropdowns) ───

    // GET /projects/:projectId/github/pull-requests
    getPullRequests: async (projectId: number): Promise<GithubPullRequest[]> => {
        const response = await api.get<GithubPullRequest[]>(
            `/projects/${projectId}/github/pull-requests`
        )
        return response.data
    },

    // GET /projects/:projectId/github/commits
    getCommits: async (projectId: number): Promise<GithubCommit[]> => {
        const response = await api.get<GithubCommit[]>(
            `/projects/${projectId}/github/commits`
        )
        return response.data
    },
}
