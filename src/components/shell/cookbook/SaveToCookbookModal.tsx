// components/SaveToCookbookModal.tsx
"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import axios from "axios";
type Cookbook = {
  _id: string;
  name: string;
  recipes: string[];
};

type SaveToCookbookModalProps = {
  recipeId: string;
  onClose: () => void;
};

const SaveToCookbookModal = ({ recipeId, onClose }: SaveToCookbookModalProps) => {
  const { data: session, status } = useSession();
  const [cookbooks, setCookbooks] = useState<Cookbook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    if (status !== "authenticated") return;

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get<Cookbook[]>(`/api/users/${session.user._id}/cookbook`, {
          signal: controller.signal,
        });
        setCookbooks(res.data);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Couldn't load your cookbooks. Try again.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [status, session?.user._id]);

  const handleSave = async (cookbookId: string) => {
    if (!session?.user._id || savingId) return;
    setSavingId(cookbookId);

    try {
        const res = await axios.patch(`/api/users/${session.user._id}/cookbook/${cookbookId}`, {
            recipeId,
        });
        if (res.status !== 200) {
            throw new Error("Failed to save recipe to cookbook");
        }
      setCookbooks((prev) =>
        prev.map((cb) =>
          cb._id === cookbookId ? { ...cb, recipes: [...cb.recipes, recipeId] } : cb
        )
      );
    } catch {
      setError("Couldn't save to that cookbook. Try again.");
    } finally {
      setSavingId(null);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-96 max-h-[70vh] bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl p-md overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Save recipe to cookbook"
      >
        <div className="flex items-center justify-between mb-sm">
          <h2 className="font-headline-sm text-on-surface">Save to cookbook</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        {status === "unauthenticated" && (
          <p className="text-sm text-on-surface-variant py-md text-center">Sign in to save recipes.</p>
        )}
        {loading && <p className="text-sm text-on-surface-variant py-md text-center">Loading…</p>}
        
        {!loading && !error && status === "authenticated" && cookbooks.length === 0 && (
          <p className="text-sm text-on-surface-variant py-md text-center">
            You don&apos;t have any cookbooks yet.
          </p>
        )}

        <ul className="flex flex-col gap-xs">
          {cookbooks.map((cb) => {
            const isSaved = cb.recipes.includes(recipeId);
            const isSaving = savingId === cb._id;

            return (
              <li key={cb._id}>
                <button
                  type="button"
                  disabled={isSaved || isSaving}
                  onClick={() => handleSave(cb._id)}
                  className="w-full flex items-center justify-between px-sm py-2 rounded-lg hover:bg-surface-container disabled:opacity-60"
                >
                  <span className="text-sm text-on-surface">{cb.name}</span>
                  <span
                    className={`material-symbols-outlined text-lg ${isSaving ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  >
                    {isSaving ? "progress_activity" : isSaved ? "check_circle" : "add_circle"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body
  );
};

export default SaveToCookbookModal;