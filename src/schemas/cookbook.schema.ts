import { z } from "zod";

export const cookbookSchema = z.object({

    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    author: z.string().min(1),
    coverImage: z.object({
        coverImageURL: z.string().min(1),
        coverImageFileId: z.string().min(1),
    }).optional(),
});

export type CookbookSchema = z.infer<typeof cookbookSchema>;