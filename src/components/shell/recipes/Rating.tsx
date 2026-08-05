'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
interface RatingInputProps {
  recipeId: string | undefined;
  initialValue: number | null; // null = user hasn't rated yet
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export function RatingInput({ recipeId, initialValue }: RatingInputProps) {
  const [value, setValue] = useState(initialValue ?? 0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const displayValue = hovered ?? value;

  async function submitRating(newValue: number) {
    if (isSubmitting || newValue === value) return;

    const previousValue = value;
    setValue(newValue);
    setError(null);
    setIsSubmitting(true);

    try {
     const res = await axios.post(`/api/recipe/${recipeId}/rating`, { value: newValue });

      

      router.refresh(); // re-pulls server-computed avgRating/ratingCount
    } catch {
      setValue(previousValue);
      setError('Could not save your rating.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
            checked={value === star}
            onChange={() => submitRating(star)}
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
  );
}