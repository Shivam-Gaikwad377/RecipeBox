"use client";

import { Fragment, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import useFetch from "@/hooks/useFetch";
import { getErrorMessage } from "@/helpers/getErrorMessage";
import { CreatePlannerItemModal } from "@/components/shell/profile/Planner";

const MEAL_SLOTS = ["Breakfast", "Lunch", "Dinner"] as const;
type MealSlot = (typeof MEAL_SLOTS)[number];

interface PlannerRecipe {
  _id: string;
  title: string;
  coverImage?: string;
}

interface PlannerItemData {
  _id: string;
  date: string; // ISO
  mealSlot: MealSlot;
  recipe: PlannerRecipe;
}

interface PlannerSectionProps {
  isOwnProfile: boolean;
}

// Monday-start week, UTC-normalized to match the backend's toDayStart —
// mixing local-time and UTC-normalized dates was exactly the bug in the
// original schema, so the frontend has to stay consistent with the fix.
function getWeekStart(date: Date): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDayLabel(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", timeZone: "UTC" });
}

export default function PlannerSection({ isOwnProfile }: PlannerSectionProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [refreshKey, setRefreshKey] = useState(0);
  const [items, setItems] = useState<PlannerItemData[] | null>([]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = weekDays[6];

  // _r is a pure cache-buster, stripped by the route's zod schema which
  // only reads startDate/endDate off searchParams.
  const url = `/api/planner?startDate=${toISODate(weekStart)}&endDate=${toISODate(weekEnd)}&_r=${refreshKey}`;
  const { loading, error } = useFetch<PlannerItemData[]>(url, {}, setItems);

  const [modalState, setModalState] = useState<{ open: boolean; date?: Date; mealSlot?: MealSlot }>({
    open: false,
  });

  function itemFor(date: Date, mealSlot: MealSlot): PlannerItemData | undefined {
    const iso = toISODate(date);
    return items?.find((item) => item.date.slice(0, 10) === iso && item.mealSlot === mealSlot);
  }

  async function handleRemove(itemId: string) {
    const previous = items;
    setItems((curr : PlannerItemData[] | null) => curr ? curr.filter((i) => i._id !== itemId) : null); // optimistic
    try {
      await axios.delete(`/api/planner/${itemId}`);
      toast.success("Removed from meal plan.");
    } catch (err) {
      setItems(previous); // rollback — the DELETE actually failed
      toast.error(getErrorMessage(err, "Couldn't remove that meal."));
    }
  }

  return (
    <section className="bg-surface-container-lowest w-full rounded-xl p-md md:p-lg paper-shadow">
      <div className="flex items-center justify-between mb-lg border-b border-surface-dim pb-sm">
        <h2 className="font-headline-md text-headline-md text-on-surface">Meal Planner</h2>
        <div className="flex items-center gap-sm">
          <button
            type="button"
            aria-label="Previous week"
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">chevron_left</span>
          </button>
          <span className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
            {formatDayLabel(weekStart)} – {formatDayLabel(weekEnd)}
          </span>
          <button
            type="button"
            aria-label="Next week"
            className="p-2 rounded-full hover:bg-surface-container transition-colors"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
          >
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant">chevron_right</span>
          </button>
        </div>
      </div>

      {error && <p className="text-error text-sm mb-md">Couldn&apos;t load your meal plan.</p>}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-sm">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-40 rounded-lg bg-surface-container animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="grid grid-cols-[80px_repeat(7,minmax(120px,1fr))] gap-xs min-w-[720px]">
            <div />
            {weekDays.map((day) => (
              <div key={toISODate(day)} className="text-center font-label-sm text-label-sm text-on-surface-variant pb-xs">
                {formatDayLabel(day)}
              </div>
            ))}

            {MEAL_SLOTS.map((slot) => (
              <Fragment key={slot}>
                <div className="flex items-center font-label-sm text-label-sm text-on-surface-variant">{slot}</div>
                {weekDays.map((day) => {
                  const item = itemFor(day, slot);
                  return (
                    <div
                      key={`${toISODate(day)}-${slot}`}
                      className="min-h-24 rounded-lg border border-outline-variant p-xs flex flex-col"
                    >
                      {item ? (
                        <div className="flex flex-col gap-1 h-full">
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-body-sm text-body-sm text-on-surface line-clamp-2">
                              {item.recipe.title}
                            </span>
                            {isOwnProfile && (
                              <button
                                type="button"
                                aria-label="Remove from plan"
                                className="text-on-surface-variant hover:text-error shrink-0"
                                onClick={() => handleRemove(item._id)}
                              >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                              </button>
                            )}
                          </div>
                          {item.recipe.coverImage && (
                            <img
                              src={item.recipe.coverImage}
                              alt={item.recipe.title}
                              className="w-full h-16 object-cover rounded-md mt-auto"
                            />
                          )}
                        </div>
                      ) : isOwnProfile ? (
                        <button
                          type="button"
                          className="flex-1 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-md transition-colors"
                          onClick={() => setModalState({ open: true, date: day, mealSlot: slot })}
                        >
                          <span className="material-symbols-outlined text-[20px]">add</span>
                        </button>
                      ) : (
                        <div className="flex-1" />
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {isOwnProfile && (
        <CreatePlannerItemModal
          isOpen={modalState.open}
          onClose={() => setModalState({ open: false })}
          onSuccess={() => setRefreshKey((k) => k + 1)}
          initialDate={modalState.date}
          initialMealSlot={modalState.mealSlot}
        />
      )}
    </section>
  );
}