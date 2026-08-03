import { z } from "zod";

const updateIngredientSchema = z
  .object({
    name: z.string().min(1, "Ingredient name is required"),
    quantity: z.coerce.number().positive("Quantity must be greater than 0").optional(),
    unit: z.string().min(1).optional(),
   
  })
const updateInstructionSchema = z.object({
  text: z.string().min(1, "Instruction text is required"),
  // no `order` — array position is the source of truth
});

const updateNutritionalInfoSchema = z.object({
  calories: z.coerce.number().nonnegative(),
  protein: z.coerce.number().nonnegative(),
  carbs: z.coerce.number().nonnegative(),
  fat: z.coerce.number().nonnegative(),
});

export const updateRecipeSchema = z
  .object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    coverImage: z
      .object({
        coverImageURL: z.string().url("Invalid URL"),
        coverImagePublicId: z.string().min(1),
      })
      .optional(),
    ingredients: z
      .array(updateIngredientSchema)
      .min(1, "At least one ingredient is required")
      .optional(),
    instructions: z
      .array(updateInstructionSchema)
      .min(1, "At least one instruction is required")
      .optional(),
    nutritionalInfo: updateNutritionalInfoSchema.optional(),
    tags: z.array(z.string().min(1)).optional(),
    prepTime: z.coerce.number().nonnegative().optional(),
    cookTime: z.coerce.number().nonnegative().optional(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });