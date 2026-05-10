import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentsApi } from './comments.api'
import type { CreateCommentDto } from '../types/comments.types'

// ─── Query Keys ───
export const commentKeys = {
    all: ['comments'] as const,
    byTask: (taskId: number) => [...commentKeys.all, 'task', taskId] as const,
}

// ─── Queries ───

export function useTaskComments(taskId: number) {
    return useQuery({
        queryKey: commentKeys.byTask(taskId),
        queryFn: () => commentsApi.getComments(taskId),
        enabled: !!taskId,
    })
}

// ─── Mutations ───

export function useCreateComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCommentDto) => commentsApi.createComment(data),
        onSuccess: (newComment) => {
            queryClient.invalidateQueries({ queryKey: commentKeys.byTask(newComment.taskId) })
        },
    })
}

export function useDeleteComment() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, taskId: _taskId }: { id: number; taskId: number }) =>
            commentsApi.deleteComment(id),
        onSuccess: (_, { taskId }) => {
            queryClient.invalidateQueries({ queryKey: commentKeys.byTask(taskId) })
        },
    })
}
