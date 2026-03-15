import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { githubItemsApi } from './github-items.api'
import type { CreateGithubItemDto } from '../types/github-items.types'

// ─── Query Keys ───
export const githubItemKeys = {
    all: ['github-items'] as const,
    byTask: (taskId: number) => [...githubItemKeys.all, 'task', taskId] as const,
    pullRequests: (projectId: number) => ['github-pull-requests', projectId] as const,
    commits: (projectId: number) => ['github-commits', projectId] as const,
}

// ─── Queries ───

export function useTaskGithubItems(taskId: number) {
    return useQuery({
        queryKey: githubItemKeys.byTask(taskId),
        queryFn: () => githubItemsApi.getItems(taskId),
        enabled: !!taskId,
    })
}

export function useGithubPullRequests(projectId: number, enabled = true) {
    return useQuery({
        queryKey: githubItemKeys.pullRequests(projectId),
        queryFn: () => githubItemsApi.getPullRequests(projectId),
        enabled: !!projectId && enabled,
    })
}

export function useGithubCommits(projectId: number, enabled = true) {
    return useQuery({
        queryKey: githubItemKeys.commits(projectId),
        queryFn: () => githubItemsApi.getCommits(projectId),
        enabled: !!projectId && enabled,
    })
}

// ─── Mutations ───

export function useLinkGithubItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ taskId, data }: { taskId: number; data: CreateGithubItemDto }) =>
            githubItemsApi.linkItem(taskId, data),
        onSuccess: (newItem) => {
            queryClient.invalidateQueries({ queryKey: githubItemKeys.byTask(newItem.taskId) })
        },
    })
}

export function useUnlinkGithubItem() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => githubItemsApi.unlinkItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: githubItemKeys.all })
        },
    })
}
