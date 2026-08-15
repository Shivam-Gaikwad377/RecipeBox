import { z } from "zod";
import { isValidObjectId } from "mongoose";

const objectId = z.string().refine(isValidObjectId, { message: "Invalid ObjectId" });

export const mealSlotEnum = z.enum(["Breakfast", "Lunch", "Dinner"]);

export const createPlannerItemSchema = z.object({
  recipeId: objectId,
  date: z.coerce.date(),
  mealSlot: mealSlotEnum,
});

export const updatePlannerItemSchema = z.object({
  recipeId: objectId,
});

export const plannerQuerySchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export function toDayStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}