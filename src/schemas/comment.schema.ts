import {z} from "zod";

export const commentSchema = z.object({
  recipe: z.string().min(1, "Recipe ID is required"),
  author: z.string().min(1, "Author ID is required"),
  body: z.string().min(1, "Comment body is required").max(600, "Comment body must be at most 600 characters"),
});

