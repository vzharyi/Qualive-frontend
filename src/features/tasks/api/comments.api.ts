import { api } from '@/api/axios-instance'
import type { Comment, CreateCommentDto } from '../types/comments.types'

export const commentsApi = {
    // GET /comments?taskId=:id
    getComments: async (taskId: number): Promise<Comment[]> => {
        const response = await api.get<Comment[]>('/comments', { params: { taskId } })
        return response.data
    },

    // POST /comments
    createComment: async (data: CreateCommentDto): Promise<Comment> => {
        const response = await api.post<Comment>('/comments', data)
        return response.data
    },

    // DELETE /comments/:id
    deleteComment: async (id: number): Promise<void> => {
        await api.delete(`/comments/${id}`)
    },
}
