import { z } from 'zod'

// ─── Login ───
export const loginSchema = z.object({
    login: z
        .string()
        .min(3, 'Login must be at least 3 characters')
        .max(100, 'Login must be at most 100 characters'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be at most 100 characters'),
})

export type LoginDto = z.infer<typeof loginSchema>

// ─── Register ───
export const registerSchema = z.object({
    login: z
        .string()
        .min(3, 'Login must be at least 3 characters')
        .max(100, 'Login must be at most 100 characters'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be at most 100 characters'),
    email: z
        .string()
        .email('Invalid email address')
        .max(255, 'Email must be at most 255 characters'),
    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(100, 'First name must be at most 100 characters'),
    lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(100, 'Last name must be at most 100 characters'),
    avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    githubId: z.string().optional(),
    googleId: z.string().optional(),
})

export type RegisterDto = z.infer<typeof registerSchema>

// ─── User ───
export const userSchema = z.object({
    id: z.number(),
    login: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    avatarUrl: z.string().nullable().optional(),
    createdAt: z.string(),
    // Confidential fields (only for /me)
    email: z.string().optional(),
    githubId: z.string().nullable().optional(),
    googleId: z.string().nullable().optional(),
})

export type User = z.infer<typeof userSchema>

// ─── Auth Response ───
export const authResponseSchema = z.object({
    accessToken: z.string(),
    user: userSchema,
})

export type AuthResponse = z.infer<typeof authResponseSchema>
