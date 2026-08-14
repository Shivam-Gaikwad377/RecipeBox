import {z} from "zod";

export const updateCookbookSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().optional(),
    coverImage: z.object({
        coverImageURL: z.string().url("Invalid URL").optional(),
        coverImageFileId: z.string().optional(),
    }).optional(),
});