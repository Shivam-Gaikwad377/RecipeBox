import { z } from "zod";

export const ingredientsSchema = z.object({
    name: z.string().trim().min(1, "Ingredient name is required").max(100, "Ingredient name cannot exceed 100 characters"),
    quantity: z.number().min(1, "Ingredient quantity is required"),
    unit: z.string().min(1).optional(),

});

export const instructionsSchema = z.object({
    order: z.number().int().min(1, "Instruction order must be a positive integer"),
    text: z.string().trim().min(1, "Instruction text is required").max(2000, "Instruction text cannot exceed 2000 characters"),
});

export const nutritionalInfoSchema = z.object({
    calories: z.number().min(0, "Calories cannot be negative").optional(),
    protein: z.number().min(0, "Protein cannot be negative").optional(),
    carbs: z.number().min(0, "Carbs cannot be negative").optional(),
    fat: z.number().min(0, "Fat cannot be negative").optional(),
});

export const coverImageSchema = z.object({
    coverImageURL: z.string().url("Invalid image URL").optional(),
    coverImageFileId: z.string().optional(),
});

export const recipeSchema = z.object({
    title: z.string().trim().min(1, "Recipe title is required").max(150, "Recipe title cannot exceed 150 characters"),
    description: z.string().trim().min(1, "Recipe description is required").max(2000, "Recipe description cannot exceed 2000 characters"),

    ingredients: z.array(ingredientsSchema)
        .min(1, "At least one ingredient is required")
        .max(100, "Cannot exceed 100 ingredients"),
    instructions: z.array(instructionsSchema)
        .min(1, "At least one instruction is required")
        .max(100, "Cannot exceed 100 instructions"),
    nutritionalInfo: nutritionalInfoSchema.optional(),
    coverImage: coverImageSchema.optional(),
    cookTime: z.number().min(0, "Cook time cannot be negative"),
    prepTime: z.number().min(0, "Prep time cannot be negative"),
    servings: z.number().min(1, "Servings must be at least 1"),
    difficulty: z.enum(["Easy", "Medium", "Hard"], {
        message: "Difficulty must be one of 'Easy', 'Medium', or 'Hard'",
    }).optional(),
    tags: z.array(z.string().trim().max(30, "Tag cannot exceed 30 characters"))
        .max(20, "Cannot exceed 20 tags")
        .optional(),
});

export type Ingredient = z.infer<typeof ingredientsSchema>;
export type Instruction = z.infer<typeof instructionsSchema>;
export type NutritionalInfo = z.infer<typeof nutritionalInfoSchema>;
export type CoverImage = z.infer<typeof coverImageSchema>;
export type Recipe = z.infer<typeof recipeSchema>;