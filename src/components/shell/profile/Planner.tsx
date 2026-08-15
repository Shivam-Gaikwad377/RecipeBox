"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createPlannerItemSchema, mealSlotEnum } from "@/schemas/planner.schema";

type FormValues = z.output<typeof createPlannerItemSchema>;
type FormInput = z.input<typeof createPlannerItemSchema>;
type MealSlot = z.infer<typeof mealSlotEnum>;

interface RecipeSearchResult {
  _id: string;
  title: string;
  coverImage?: string;
}

interface CreatePlannerItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialMealSlot?: MealSlot;
}

export function CreatePlannerItemModal({
  isOpen,
  onClose,
  initialDate,
  initialMealSlot,
}: CreatePlannerItemModalProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput>({
    resolver: zodResolver(createPlannerItemSchema),
    defaultValues: {
      date: new Date(),
      mealSlot: "Breakfast",
      recipeId: undefined,
    },
  });

  // Re-seed on every open, not just mount — same instance gets reused
  // across different chart cells.
  useEffect(() => {
    if (isOpen) {
      reset({
        date: initialDate ?? new Date(),
        mealSlot: initialMealSlot ?? "Breakfast",
        recipeId: undefined,
      });
      setQuery("");
      setResults([]);
      setSubmitError(null);
    }
  }, [isOpen, initialDate, initialMealSlot, reset]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RecipeSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const debounce = setTimeout(async () => {
      try {
        // Scoped to the logged-in user's own recipes only — adjust the
        // path/param to whatever your "my recipes" endpoint actually is.
        const res = await fetch(
          `/api/recipes/mine?search=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data.recipes ?? data);
        setSearchError(null);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setSearchError("Couldn't load recipes");
      }
    }, 300);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  function pickRecipe(recipe: RecipeSearchResult) {
    setValue("recipeId", recipe._id, { shouldValidate: true });
    setQuery(recipe.title);
    setResults([]);
  }

  async function onSubmit(values: FormInput) {
    setSubmitError(null);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.status === 409) {
        const data = await res.json();
        setSubmitError(data.error ?? "That slot is already planned.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSubmitError(data?.error ?? "Something went wrong.");
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setSubmitError("Network error — try again.");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">Add to Meal Plan</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              {...register("date", { valueAsDate: true })}
              className="mt-1 w-full rounded border px-3 py-2"
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Meal</label>
            <select {...register("mealSlot")} className="mt-1 w-full rounded border px-3 py-2">
              {mealSlotEnum.options.map((slot  ) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {errors.mealSlot && <p className="mt-1 text-sm text-red-600">{errors.mealSlot.message}</p>}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium">Recipe</label>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setValue("recipeId", "", { shouldValidate: false });
              }}
              placeholder="Search your recipes..."
              className="mt-1 w-full rounded border px-3 py-2"
            />
            {errors.recipeId && <p className="mt-1 text-sm text-red-600">Pick a recipe</p>}
            {searchError && <p className="mt-1 text-sm text-red-600">{searchError}</p>}

            {results.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded border bg-white shadow">
                {results.map((r) => (
                  <li
                    key={r._id}
                    onClick={() => pickRecipe(r)}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                  >
                    {r.title}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {submitError && <p className="text-sm text-red-600">{submitError}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}