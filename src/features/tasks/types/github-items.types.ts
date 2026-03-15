// ─── GitHub Item Types ───

export type GithubItemType = 'PULL_REQUEST' | 'COMMIT'

export interface TaskGithubItem {
    id: number
    taskId: number
    type: GithubItemType
    githubId: string
    url: string
    title: string
    author: string
    codeScore: number | null
    createdAt: string
}

export interface CreateGithubItemDto {
    type: GithubItemType
    githubId: string
    url: string
    title: string
    author: string
}

// ─── GitHub Lists (for dropdowns) ───

export interface GithubPullRequest {
    type: 'PULL_REQUEST'
    githubId: string
    url: string
    title: string
    author: string
    state: string
    mergedAt: string | null
}

export interface GithubCommit {
    type: 'COMMIT'
    githubId: string
    url: string
    title: string
    author: string
}
