import {z} from "zod";

export const updateProfileSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long").max(20, "Username cannot exceed 20 characters").optional(),
    name: z.string().min(1, "Name is required").max(50, "Name cannot exceed 50 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
})

export type UpdateProfileInput = z.input<typeof updateProfileSchema>;
export type UpdateProfileOutput = z.output<typeof updateProfileSchema>;
