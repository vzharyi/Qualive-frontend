import { z } from 'zod'

export const updateUserSchema = z.object({
    firstName: z
        .string()
        .min(1, 'First name is required')
        .max(100, 'First name must be at most 100 characters')
        .optional(),
    lastName: z
        .string()
        .min(1, 'Last name is required')
        .max(100, 'Last name must be at most 100 characters')
        .optional(),
    avatarUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    githubId: z.string().optional(),
    googleId: z.string().optional(),
})

export type UpdateUserDto = z.infer<typeof updateUserSchema>
