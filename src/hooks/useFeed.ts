// hooks/useFeed.ts
"use client";

import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/axios";

export interface FeedAuthor {
  _id: string;
  name: string;
  avatar?: string;
}

export interface FeedRecipe {
  _id: string;
  title: string;
  coverImage?: string;
  avgRating: number;
  ratingCount: number;
  createdAt: string;
  author: FeedAuthor;
}

interface FeedResponse {
  recipes: FeedRecipe[];
  nextCursor: string | null;
}

const LIMIT = 12;

export function useFeed() {
  const [recipes, setRecipes] = useState<FeedRecipe[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // One in-flight request at a time; a new call cancels the previous one
  // instead of racing it (same intent as your fetch+AbortController pattern).
  const abortRef = useRef<AbortController | null>(null);

  const fetchPage = useCallback(async (nextCursor: string | null) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get<FeedResponse>("/feed", {
        params: {
          limit: LIMIT,
          ...(nextCursor ? { cursor: nextCursor } : {}),
        },
        signal: controller.signal,
      });

      setRecipes((prev) =>
        nextCursor ? [...prev, ...data.recipes] : data.recipes
      );
      setCursor(data.nextCursor);
      setHasMore(Boolean(data.nextCursor));
    } catch (err) {
      if (axios.isCancel(err)) return; // superseded by a newer request, not a real failure
      setError("Couldn't load your feed. Try again.");
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchPage(null);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchPage(cursor);
  }, [cursor, hasMore, isLoading, fetchPage]);

  const retry = useCallback(() => {
    fetchPage(cursor);
  }, [cursor, fetchPage]);

  return { recipes, isLoading, error, hasMore, initialized, loadMore, retry };
}