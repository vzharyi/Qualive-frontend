import { z } from 'zod'
import { userSchema } from '@/features/auth/types/auth.types'

// ─── Enums ───
export const ProjectStatus = {
    ACTIVE: 'ACTIVE',
    ARCHIVED: 'ARCHIVED',
} as const

export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus]

export const ProjectRole = {
    ADMIN: 'ADMIN',
    DEVELOPER: 'DEVELOPER',
    VIEW_ONLY: 'VIEW_ONLY',
} as const

export type ProjectRole = (typeof ProjectRole)[keyof typeof ProjectRole]

// ─── Project Member ───
export const projectMemberSchema = z.object({
    id: z.number(),
    userId: z.number(),
    role: z.string(),
    user: userSchema.optional(),
})

export type ProjectMember = z.infer<typeof projectMemberSchema>

// ─── Project ───
export const projectSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
    status: z.string(),
    ownerId: z.number(),
    defaultViewSettings: z.unknown().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    // Populated on GET /projects/:id
    owner: userSchema.optional(),
    members: z.array(projectMemberSchema).optional(),
})

export type Project = z.infer<typeof projectSchema>

// ─── Create Project ───
export const createProjectSchema = z.object({
    name: z
        .string()
        .min(1, 'Project name is required')
        .max(100, 'Project name must be at most 100 characters'),
    description: z.string().max(500, 'Description must be at most 500 characters').optional(),
    avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    columns: z.array(
        z.object({
            name: z.string().min(1),
            color: z.string().optional(),
        })
    ).optional(),
})

export type CreateProjectDto = z.infer<typeof createProjectSchema>

// ─── Update Project ───
export const updateProjectSchema = z.object({
    name: z
        .string()
        .min(1, 'Project name is required')
        .max(100, 'Project name must be at most 100 characters')
        .optional(),
    description: z.string().max(500, 'Description must be at most 500 characters').optional(),
    avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
})

export type UpdateProjectDto = z.infer<typeof updateProjectSchema>

// ─── Add Member ───
export const addMemberSchema = z.object({
    email: z.string().email('Invalid email').optional(),
    userId: z.number().optional(),
    role: z.string().min(1, 'Role is required'),
})

export type AddMemberDto = z.infer<typeof addMemberSchema>

