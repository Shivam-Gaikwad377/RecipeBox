"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import type { UserDocument } from "@/models/user.model";
import { useSession } from "next-auth/react";
import type ApiResponse from "@/types/ApiResponse";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  updateProfileSchema,
  UpdateProfileInput,
  UpdateProfileOutput,
} from "@/schemas/updateProfile.schema";
import useDebounce from "@/hooks/useDebouncedValue";
import { Spinner } from "@/components/Spinner";


// --- constants -------------------------------------------------------------
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_AVATAR = "/default-avatar.png"; // ship a real static fallback at this path
const USERNAME_CHECK_DEBOUNCE_MS = 500;

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";

// --- helpers -----------------------------------------------------------------
// Centralizes error extraction so real backend messages (validation errors,
// "username taken", etc.) reach the user instead of a generic toast every time.
function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as ApiResponse | undefined)?.message ?? fallback;
  }
  return fallback;
}

const ProfilePage = () => {
  const router = useRouter();
  const session = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserDocument | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: userData?.name || "",
      username: userData?.username || "",
      email: userData?.email || "",
      bio: userData?.bio || "",
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = form;

  // Watching the RHF field directly (instead of a parallel useState) means the
  // value we debounce-check for availability is guaranteed to be the same value
  // that actually gets submitted.
  const watchedUsername = watch("username");
  const debouncedUsername = useDebounce(watchedUsername, USERNAME_CHECK_DEBOUNCE_MS);

  // --- fetch profile on session load ---------------------------------------
  useEffect(() => {
    const username = session?.data?.user?.username;
    if (!username) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `/api/profile/${username}`
        );
        if (!cancelled) setUserData(response.data.data);
      } catch (error) {
        if (!cancelled) toast.error(getErrorMessage(error, "Failed to load profile."));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.data?.user?.username]);

  // --- keep form in sync once userData arrives/changes ---------------------
  useEffect(() => {
    if (!userData) return;
    reset({
      name: userData.name || "",
      username: userData.username || "",
      email: userData.email || "",
      bio: userData.bio || "",
    });
  }, [userData, reset]);

  // --- live username availability check ------------------------------------
  useEffect(() => {
    if (!isEditing) return;

    if (!debouncedUsername || debouncedUsername === userData?.username) {
      setUsernameStatus("idle");
      return;
    }

    let cancelled = false;
    setUsernameStatus("checking");

    (async () => {
      try {
        const response = await axios.get<ApiResponse>(
          `/api/profile/username-check?username=${encodeURIComponent(debouncedUsername)}`
        );
        if (cancelled) return;
        setUsernameStatus(response.status === 200 ? "available" : "taken");
      } catch {
        if (cancelled) return;
        setUsernameStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedUsername, userData?.username, isEditing]);

  // --- avatar upload ---------------------------------------------------------
  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
        toast.error("Please upload a JPEG, PNG, or WebP image.");
        e.target.value = "";
        return;
      }
      if (file.size > MAX_AVATAR_BYTES) {
        toast.error("Image must be smaller than 5MB.");
        e.target.value = "";
        return;
      }

      setIsUploadingAvatar(true);
      try {
        const formData = new FormData();
        formData.append("avatar", file);

        // Assumes the PATCH endpoint returns the updated user document.
        // If it doesn't yet, that's a one-line backend change and it saves
        // a second round trip on every single avatar upload.
        const response = await axios.patch<ApiResponse>(
          "/api/profile/avatar",
          formData
        );
        setUserData(response.data.data);
        // Only needed if the session token/session object carries avatar
        // data (e.g. session.user.image) — drop this if it doesn't.
        await session.update();
        toast.success("Avatar updated successfully!");
      } catch (error) {
        toast.error(getErrorMessage(error, "Error updating avatar."));
      } finally {
        setIsUploadingAvatar(false);
        // Reset so selecting the same file again still fires onChange.
        e.target.value = "";
      }
    },
    []
  );

  // --- profile submit ---------------------------------------------------------
  const onSubmit = async (data: UpdateProfileOutput) => {
    const emailChanged = data.email !== userData?.email;
    // Email changes go through a separate verification flow — they should
    // never be written directly to the profile record.
    const { email, ...profilePayload } = data;

    if (emailChanged) {
      try {
        await axios.patch<ApiResponse>("/api/profile/change-email", {
          newEmail: data.email,
        });
        toast.success("Verification email sent to your new address.");
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not start email change."));
        // Don't abort the whole save over this — the rest of the form may
        // still be valid and worth persisting.
      }
    }

    try {
      const response = await axios.patch<ApiResponse>(
        `/api/profile/${userData?.username}`,
        profilePayload
      );
      setUserData(response.data.data);
      // Username/name changed on the server — refresh the session so
      // session.user.username stops being stale. This also re-triggers
      // the fetchUserData effect above (it depends on that value), which
      // matters if the username itself was the field that changed:
      // otherwise the next reload would still fetch by the OLD username.
      await session.update();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error, "Error updating profile."));
    }
  };

  const isSaveDisabled =
    isSubmitting || usernameStatus === "checking" || usernameStatus === "taken";
  useEffect(() => {
    const fetchFollowerCount = async () => {
      if(!userData?._id) return;
      try {
        const response = await axios.get<ApiResponse>(`/api/users/${userData?._id}/followers`);
        setFollowerCount(response.data.data.count);
      } catch (error) {
        console.error(getErrorMessage(error, "Failed to fetch follower count."));
      }
    };

    const fetchFollowingCount = async () => {
      if(!userData?._id) return;
      try {
        const response = await axios.get<ApiResponse>(`/api/users/${userData?._id}/following`);
        setFollowingCount(response.data.data.count);
      } catch (error) {
        console.error(getErrorMessage(error, "Failed to fetch following count."));
      }
    };

    fetchFollowerCount();
    fetchFollowingCount();
  }, [userData?._id]);
  return (
    <>
      <section className="col-span-4 md:col-span-12 flex flex-col md:flex-row items-center md:items-start gap-lg mb-xl mt-lg">
        <div className="relative group">
          <img
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-sm ring-4 ring-surface-container-lowest"
            alt={userData?.name ? `${userData.name}'s avatar` : "Profile avatar"}
            src={userData?.avatar?.avatarUrl || DEFAULT_AVATAR}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
          />
          <button
            type="button"
            aria-label="Change avatar"
            disabled={isUploadingAvatar}
            className="absolute bottom-0 right-0 bg-surface-container-lowest border border-outline-variant rounded-full p-2 shadow-sm text-primary hover:bg-surface-container hover-lift flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => fileInputRef.current?.click()}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              {isUploadingAvatar ? "hourglass_top" : "photo_camera"}
            </span>
          </button>
          <input
            className="hidden"
            type="file"
            accept={ACCEPTED_AVATAR_TYPES.join(",")}
            onChange={handleImageChange}
            ref={fileInputRef}
          />
        </div>

        <div className="flex flex-col items-center md:items-start text-center md:text-left grow">
          <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-xs">
            {userData?.name || "Jane Doe"}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-md">
            @{userData?.username || "janecooks"}
          </p>
          <div className="flex items-center gap-lg mb-md">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-label-md text-on-surface">
                {0}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Recipes
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-label-md text-on-surface">
                {followerCount}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Followers
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-label-md text-on-surface">
                {followingCount}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Following
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-md py-sm rounded-full border-2 border-primary text-primary text-label-md hover:bg-primary-fixed transition-colors hover-lift flex items-center gap-xs bg-surface-container-lowest"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            Edit Profile Details
          </button>
        </div>
      </section>

      <div className="col-span-4 md:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {!isEditing ? (
          <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-md md:p-lg paper-shadow">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-lg border-b border-surface-dim pb-sm">
              Profile Details
            </h2>
            <div className="flex flex-col gap-md">
              <div className="flex flex-col gap-xs relative pt-4">
                <p className="absolute top-0 left-3 text-label-md text-on-surface-variant bg-surface-container-lowest px-1 -mt-2">
                  Full Name
                </p>
                <p className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm text-body-md text-on-surface placeholder:text-outline">
                  {userData?.name || "Jane Doe"}
                </p>
              </div>

              <div className="flex flex-col gap-xs relative pt-4 mt-sm">
                <p className="absolute top-0 left-3 text-label-md text-on-surface-variant bg-surface-container-lowest px-1 -mt-2">
                  Username
                </p>
                <p className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm text-body-md text-on-surface placeholder:text-outline">
                  {userData?.username || "janecooks"}
                </p>
              </div>

              <div className="flex flex-col gap-xs relative pt-4 mt-sm">
                <p className="absolute top-0 left-3 text-label-md text-on-surface-variant bg-surface-container-lowest px-1 -mt-2">
                  Email Address
                </p>
                <div className="flex items-center gap-sm">
                  <p className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm text-body-md text-on-surface placeholder:text-outline">
                    {userData?.pendingEmail || userData?.email || "jane.doe@example.com"}
                  </p>
                  {userData?.pendingEmail && (
                    <button
                      type="button"
                      className="px-md py-sm rounded-full border-2 border-primary text-primary text-label-md hover:bg-primary-fixed transition-colors hover-lift flex items-center gap-xs bg-surface-container-lowest mt-sm"
                      onClick={() =>
                        router.push(`/verify-email?newEmail=${userData?.pendingEmail}`)
                      }
                    >
                      Verify
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-xs relative pt-4 mt-sm mb-md">
                <p className="absolute top-0 left-3 text-label-md text-on-surface-variant bg-surface-container-lowest px-1 -mt-2">
                  Bio
                </p>
                <p className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm text-body-md text-on-surface placeholder:text-outline resize-none">
                  {userData?.bio || "No bio available."}
                </p>
              </div>
            </div>
          </section>
        ) : (
          <section className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-md md:p-lg paper-shadow">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-lg border-b border-surface-dim pb-sm">
              Profile Details
            </h2>
            <form className="flex flex-col gap-md" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-xs relative pt-4">
                <label
                  className="absolute top-0 left-3 text-label-md font-bold text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"
                  htmlFor="fullName"
                >
                  Full Name
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="fullName"
                  type="text"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-error text-sm">{errors.name.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-xs relative pt-4 mt-sm">
                <label
                  className="absolute top-0 left-3 text-label-md text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="username"
                  type="text"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-error text-sm">{errors.username.message}</p>
                )}
                {usernameStatus === "checking" && (
                  <p className="text-sm text-on-surface-variant">Checking availability…</p>
                )}
                {usernameStatus === "available" && (
                  <p className="text-success text-sm">Username is available</p>
                )}
                {usernameStatus === "taken" && (
                  <p className="text-error text-sm">Username is not available</p>
                )}
                {usernameStatus === "error" && (
                  <p className="text-error text-sm">
                    Couldn't check availability — try again
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-xs relative pt-4 mt-sm">
                <label
                  className="absolute top-0 left-3 text-label-md text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="email"
                  type="email"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-error text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-xs relative pt-4 mt-sm mb-md">
                <label
                  className="absolute top-0 left-3 text-label-md text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"
                  htmlFor="bio"
                >
                  Bio
                </label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="bio"
                  rows={4}
                  {...register("bio")}
                />
                {errors.bio && <p className="text-error text-sm">{errors.bio.message}</p>}
              </div>

              <div className="flex w-full justify-end gap-sm">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-md py-sm rounded-full border-2 border-primary text-primary text-label-md hover:bg-primary-fixed transition-colors hover-lift flex items-center gap-xs bg-surface-container-lowest"
                >
                  <span className="material-symbols-outlined text-[18px]">cancel</span>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaveDisabled}
                  className="px-md bg-primary text-on-primary text-label-md py-sm rounded-full hover:bg-primary-container hover-lift transition-all shadow-sm flex items-center justify-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                  {isSubmitting ? (<Spinner />) : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="lg:col-span-7 flex flex-col gap-md">
          <div className="flex justify-between items-end mb-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              My Collections
            </h2>
            <button className="text-primary text-label-md hover:underline flex items-center gap-xs">
              View All
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">
            {/* Collection cards intentionally left as-is — not in scope of the reported bugs.
               These are still hardcoded/static and should be driven from userData.collections
               the same way the stats above now are, once that endpoint/shape exists. */}
          </div>
        </section>


       
      </div>
    </>
  );
};

export default ProfilePage;