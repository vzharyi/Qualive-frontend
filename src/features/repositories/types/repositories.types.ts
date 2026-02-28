export interface Repository {
    id: number
    projectId: number
    githubRepoId: string // BigInt returned as string
    installationId: string | null // BigInt returned as string or null
    connectedAt: string
}

export interface CreateRepositoryDto {
    projectId: number
    githubRepoId: string | number
    accessToken?: string
}

export interface UpdateRepositoryDto {
    githubRepoId?: string | number
    accessToken?: string
}
