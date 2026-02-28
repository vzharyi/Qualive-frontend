import { api } from '@/api/axios-instance'
import type { Repository, CreateRepositoryDto, UpdateRepositoryDto } from '../types/repositories.types'

export const repositoriesApi = {
    // ─── Repositories ───

    // GET /repositories/project/:projectId
    getProjectRepositories: async (projectId: number): Promise<Repository[]> => {
        const response = await api.get<Repository[]>(`/repositories/project/${projectId}`)
        return response.data
    },

    // POST /repositories
    createRepository: async (data: CreateRepositoryDto): Promise<Repository> => {
        const response = await api.post<Repository>('/repositories', data)
        return response.data
    },

    // GET /repositories/:id
    getRepository: async (id: number): Promise<Repository> => {
        const response = await api.get<Repository>(`/repositories/${id}`)
        return response.data
    },

    // PATCH /repositories/:id
    updateRepository: async (id: number, data: UpdateRepositoryDto): Promise<Repository> => {
        const response = await api.patch<Repository>(`/repositories/${id}`, data)
        return response.data
    },

    // DELETE /repositories/:id
    deleteRepository: async (id: number): Promise<void> => {
        await api.delete(`/repositories/${id}`)
    },

    // ─── GitHub App Flow ───

    // GET /github/install
    getGithubInstallUrl: async (projectId: number): Promise<string> => {
        // Here we hit the backend. If it returns 302, Axios might follow it and fail CORS.
        // If the backend returns a JSON with the URL or can handle AJAX requests without 302:
        try {
            const response = await api.get(`/github/install`, {
                params: { projectId },
                validateStatus: (status) => status >= 200 && status < 400
            })
            // If the redirect was followed and successful, response.request.responseURL has the final URL
            // Or if backend was changed to return JSON
            if (response.data && response.data.url) {
                return response.data.url
            }
            if (response.request && response.request.responseURL) {
                return response.request.responseURL
            }
            // Fallback for direct redirect approach from frontend if API just bounces
            throw new Error('Could not resolve redirect URL')
        } catch (error) {
            // Fallback: If backend ALWAYS does 302 and we hit CORS, we can't reliably catch the Location header.
            // The cleanest way is for the backend to just return { url: "..." } for XHR requests.
            console.error('Failed to start GitHub installation flow via AJAX', error)
            throw error
        }
    }
}
