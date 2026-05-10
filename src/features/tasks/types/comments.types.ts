// ─── Comment Types ───

export interface CommentUser {
    id: number
    login: string
    firstName: string | null
    lastName: string | null
    avatarUrl: string | null
}

export interface Comment {
    id: number
    content: string
    taskId: number
    userId: number
    createdAt: string
    updatedAt: string
    user: CommentUser
}

export interface CreateCommentDto {
    taskId: number
    content: string
}
