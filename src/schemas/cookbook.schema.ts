import { z } from "zod";

export const cookbookSchema = z.object({

    title: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    author: z.string().min(1),
    recipes: z.array(z.string()).optional(),
    coverImage: z.object({
        coverImageURL: z.string().min(1),
        coverImagePublicId: z.string().min(1),
    }),
});

export type CookbookSchema = z.infer<typeof cookbookSchema>;