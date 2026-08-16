 // fails the build immediately, with a clear message, if this ever leaks into client code again

import { z } from "zod";


const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId");


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