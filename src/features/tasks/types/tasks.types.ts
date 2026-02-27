import { z } from 'zod'

// ─── Column ───
export const columnSchema = z.object({
    id: z.number(),
    projectId: z.number(),
    name: z.string(),
    color: z.string().nullable().optional(),
    order: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
})

export type Column = z.infer<typeof columnSchema>

export const createColumnSchema = z.object({
    name: z.string().min(1, 'Column name is required'),
    color: z.string().optional(),
    order: z.number().optional(),
})

export type CreateColumnDto = z.infer<typeof createColumnSchema>

export const updateColumnSchema = z.object({
    name: z.string().min(1, 'Column name is required').optional(),
    color: z.string().optional(),
    order: z.number().optional(),
})

export type UpdateColumnDto = z.infer<typeof updateColumnSchema>

// ─── Task Priority ───
export const TaskPriority = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
} as const

export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority]

// ─── Task Schema ───
export const taskSchema = z.object({
    id: z.number(),
    projectId: z.number(),
    columnId: z.number(),
    title: z.string(),
    description: z.string().nullable().optional(),
    assigneeId: z.number().nullable().optional(),
    reporterId: z.number().nullable().optional(),
    priority: z.string().nullable().optional(),
    githubCommitHash: z.string().nullable().optional(),
    linesOfCode: z.number().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    // Populated relations
    column: columnSchema.optional(),
    assignee: z.object({
        id: z.number(),
        login: z.string(),
        firstName: z.string().nullable().optional(),
        lastName: z.string().nullable().optional(),
        avatarUrl: z.string().nullable().optional(),
    }).optional(),
    reporter: z.object({
        id: z.number(),
        login: z.string(),
        firstName: z.string().nullable().optional(),
        lastName: z.string().nullable().optional(),
        avatarUrl: z.string().nullable().optional(),
    }).optional(),
})

export type Task = z.infer<typeof taskSchema>

// ─── Create Task DTO ───
export const createTaskSchema = z.object({
    title: z
        .string()
        .min(1, 'Task title is required')
        .max(100, 'Task title must be at most 100 characters'),
    description: z.string().optional(),
    assigneeId: z.number().optional(),
    priority: z.string().optional(),
    columnId: z.number(),
})

export type CreateTaskDto = z.infer<typeof createTaskSchema>

// ─── Update Task DTO ───
export const updateTaskSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    assigneeId: z.number().nullable().optional(),
    priority: z.string().optional(),
    columnId: z.number().optional(),
    githubCommitHash: z.string().optional(),
})

export type UpdateTaskDto = z.infer<typeof updateTaskSchema>

// ─── Query Params ───
export interface TasksQueryParams {
    projectId: number
    columnId?: number
    assigneeId?: number
    reporterId?: number
    priority?: string
    sortBy?: 'createdAt' | 'priority' | 'updatedAt'
    sortOrder?: 'asc' | 'desc'
}
