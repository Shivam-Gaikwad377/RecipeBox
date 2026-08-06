'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '@/components/PrimaryButton';
import { toast } from 'sonner';

import axios from 'axios';

interface RatingInputProps {
  recipeId: string | undefined;
  initialValue: number | null; // null = user hasn't rated yet
  onClose: () => void;
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export function RatingInput({ recipeId, initialValue, onClose }: RatingInputProps) {
  const [selected, setSelected] = useState(initialValue ?? 0); // pending, user-driven
  const [saved, setSaved] = useState(initialValue ?? 0);       // last confirmed value
  const [hovered, setHovered] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const displayValue = hovered ?? selected;

  async function submitRating(newValue: number) {
    if (isSubmitting || newValue === saved) return;

    const previous = saved;
    setSaved(newValue); // optimistic
    setError(null);
    setIsSubmitting(true);

    try {
      await axios.post(`/api/recipe/${recipeId}/rating`, { value: newValue });
      toast.success('Rating saved!');
      router.refresh();
      onClose();
    } catch {
      setSaved(previous);
      setSelected(previous); // roll back the visible selection too
      setError('Could not save your rating.');
      toast.error('Could not save your rating.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rate this recipe"
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
    >
      <div className="bg-surface relative border border-outline-variant/40 rounded-xl p-lg flex flex-col items-center gap-sm w-auto h-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cancel"
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
        >
          {/* <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
          </svg> */}
          <span className="material-symbols-outlined">close</span>
        </button>

        <fieldset
          className="flex gap-1"
          disabled={isSubmitting}
          onMouseLeave={() => setHovered(null)}
        >
          <legend className="sr-only">Rate this recipe</legend>
          {STAR_VALUES.map((star) => (
            <label key={star} className="cursor-pointer">
              <input
                type="radio"
                name={`rating-${recipeId}`}
                value={star}
                checked={selected === star}
                onChange={() => setSelected(star)}
                onMouseEnter={() => setHovered(star)}
                className="peer sr-only"
              />
              <svg
                viewBox="0 0 20 20"
                className="w-6 h-6 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1 peer-focus-visible:ring-blue-500 rounded-sm"
                fill={star <= displayValue ? '#facc15' : 'none'}
                stroke="#facc15"
              >
                <path d="M10 1l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6L1.3 7.2l6.1-.6z" />
              </svg>
            </label>
          ))}
          {error && (
            <span role="alert" className="text-sm text-red-500 ml-2">
              {error}
            </span>
          )}
        </fieldset>
           <div className="flex items-center gap-4 mt-md">
            <PrimaryButton label="Confirm" onClick={() => submitRating(selected)} fontSize="medium" type="button" />
            
        </div>
      </div>
    </div>
  );
}