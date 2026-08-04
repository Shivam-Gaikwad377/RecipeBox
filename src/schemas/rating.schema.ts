import {z} from "zod";

export const ratingSchema = z.object({
    recipe: z.string().min(1, "Recipe ID is required"),
    user: z.string().min(1, "User ID is required"),
    value: z.number().min(1, "Rating must be at least 1").max(5, "Rating cannot be more than 5"),
});