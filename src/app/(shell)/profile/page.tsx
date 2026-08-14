"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import type { UserDocument } from "@/models/user.model";
import { RecipeDocument } from "@/models/recipe.model";
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
import { getErrorMessage } from "@/helpers/getErrorMessage";
import PrimaryButton from "@/components/PrimaryButton";
import SecondaryButton from "@/components/SecondaryButton";
import useFetch from "@/hooks/useFetch";
import RecipeSection from "@/components/shell/profile/RecipeSection";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_AVATAR = "/default-avatar.png";
const USERNAME_CHECK_DEBOUNCE_MS = 500;

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "error";
type ProfileTab = "recipes" | "cookbooks" | "about";

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: "recipes", label: "Recipes" },
  { id: "cookbooks", label: "Cookbooks" },
  { id: "about", label: "About" },
];

// Minimal shape this page needs from a Recipe. Rename/trim fields to match
// your actual Recipe model — I don't have that schema in front of me, so
// treat these field names as a starting guess, not a confirmed contract.







// function CookbooksGrid({
//   cookbooks,
//   loading,
//   isOwnProfile,
// }: {
//   cookbooks: CookbookSummary[];
//   loading: boolean;
//   isOwnProfile: boolean;
// }) {
//   if (loading) return <GridSkeleton />;

//   if (cookbooks.length === 0) {
//     return (
//       <EmptyState
//         icon="menu_book"
//         title={isOwnProfile ? "No cookbooks yet" : "No cookbooks to show"}
//         description={
//           isOwnProfile
//             ? "Group your saved recipes into cookbooks."
//             : undefined
//         }
//         actionHref={isOwnProfile ? "/cookbooks/new" : undefined}
//         actionLabel={isOwnProfile ? "New cookbook" : undefined}
//       />
//     );
//   }

// return (
//   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-gutter">
//     {cookbooks.map((cookbook) => (
//       <a
//         key={cookbook._id}
//         href={`/cookbooks/${cookbook._id}`}
//         className="rounded-xl overflow-hidden bg-surface-container-lowest paper-shadow hover-lift transition-transform"
//       >
//         <div className="aspect-square grid grid-cols-2 grid-rows-2 gap-px bg-surface-dim">
//           {Array.from({ length: 4 }).map((_, i) => (
//             <div
//               key={i}
//               className="bg-surface-container flex items-center justify-center overflow-hidden"
//             >
//               {cookbook.coverImages?.[i] ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={cookbook.coverImages[i]}
//                   alt=""
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <span className="material-symbols-outlined text-[18px] text-outline">
//                   menu_book
//                 </span>
//               )}
//             </div>
//           ))}
//         </div>
//         <div className="p-sm">
//           <p className="text-label-md text-on-surface truncate">
//             {cookbook.name}
//           </p>
//           <p className="text-label-sm text-on-surface-variant mt-xs">
//             {cookbook.recipeCount} {cookbook.recipeCount === 1 ? "recipe" : "recipes"}
//           </p>
//         </div>
//       </a>
//     ))}
//   </div>
// );


const ProfilePage = () => {
  const router = useRouter();
  const session = useSession();

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
  const [activeTab, setActiveTab] = useState<ProfileTab>("recipes");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userData, setUserData] = useState<UserDocument | null>(null);
  const [followerCount, setFollowerCount] = useState<{ count: number } | null>({ count: 0 });
  const [followingCount, setFollowingCount] = useState<{ count: number } | null>({ count: 0 });
  const [recipes, setRecipes] = useState<{total: number, recipes: RecipeDocument[]} | null>(null);
  // const [cookbooks, setCookbooks] = useState<CookbookSummary[] | null>([]);

  const { loading: userDataLoading, error: userDataError } = useFetch<UserDocument>(
    `/api/profile/${session?.data?.user?.username}`,
    {},
    setUserData
  );

  // This page fetches by session.data.user.username, so it only ever loads
  // the logged-in user's own data — it's a self-view/settings page, not a
  // param-driven public profile. isOwnProfile is hardcoded true to match
  // that reality. If you add a /profile/[username] route for viewing OTHER
  // users, that page needs its own data fetch keyed off the route param,
  // and isOwnProfile there should be
  // `session.data?.user?.username === routeUsername`.
  const isOwnProfile = true;
  const userId = userData?._id?.toString();

  const { loading: followerLoading } = useFetch<{ count: number }>(
    userId ? `/api/users/${userId}/followers` : " ",
    {},
    setFollowerCount
  );
  const { loading: followingLoading } = useFetch<{ count: number }>(
    userId ? `/api/users/${userId}/following` : " ",
    {},
    setFollowingCount
  );

  // ASSUMPTION: paths follow the same /api/users/:id/... convention as
  // followers/following above. Adjust if your real routes differ. Counts
  // below are derived from list length — swap for a dedicated count field
  // if either endpoint paginates instead of returning the full list.
  const { loading: recipesLoading } = useFetch<{ total: number; recipes: RecipeDocument[] }>(
    userId ? `/api/users/${userId}/recipes` : "",
    {},
    setRecipes

  );
  // const { loading: cookbooksLoading } = useFetch<CookbookSummary[]>(
  //   userId ? `/api/users/${userId}/cookbooks` : "",
  //   {},
  //   
  // );

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

  const watchedUsername = watch("username");
  const debouncedUsername = useDebounce(watchedUsername, USERNAME_CHECK_DEBOUNCE_MS);

  useEffect(() => {
    if (!userData) return;
    reset({
      name: userData.name || "",
      username: userData.username || "",
      email: userData.email || "",
      bio: userData.bio || "",
    });
  }, [userData, reset]);

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

        const response = await axios.patch<ApiResponse>("/api/profile/avatar", formData);
        setUserData(response.data.data);
        await session.update();
        toast.success("Avatar updated successfully!");
      } catch (error) {
        toast.error(getErrorMessage(error, "Error updating avatar."));
      } finally {
        setIsUploadingAvatar(false);
        e.target.value = "";
      }
    },
    []
  );

  const onSubmit = async (data: UpdateProfileOutput) => {
    const emailChanged = data.email !== userData?.email;
    const { email, ...profilePayload } = data;

    if (emailChanged) {
      try {
        await axios.patch<ApiResponse>("/api/profile/change-email", {
          newEmail: data.email,
        });
        toast.success("Verification email sent to your new address.");
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not start email change."));
      }
    }

    try {
      const response = await axios.patch<ApiResponse>(
        `/api/profile/${userData?.username}`,
        profilePayload
      );
      setUserData(response.data.data);
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
          {userDataLoading ? (
            <div className="w-48 h-8 rounded-md bg-surface-container animate-pulse mb-xs" />
          ) : (
            <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-xs">
              {userData?.name}
            </h1>
          )}
          {userDataLoading ? (
            <div className="w-28 h-5 rounded-md bg-surface-container animate-pulse mb-md" />
          ) : (
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-md">
              @{userData?.username}
            </p>
          )}
          {userDataError && (
            <p className="text-error text-label-sm mb-md">
              Couldn&apos;t load your profile. Try refreshing the page.
            </p>
          )}

          <div className="flex items-center gap-lg mb-md">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-label-md text-on-surface">
                {/* {recipesLoading ? "—" : recipes.length} */}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Recipes
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-label-md text-on-surface">
                {/* {cookbooksLoading ? "—" : cookbooks.length} */}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Cookbooks
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-label-md text-on-surface">
                {followerLoading ? "—" : followerCount?.count}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Followers
              </span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className="text-label-md text-on-surface">
                {followingLoading ? "—" : followingCount?.count}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Following
              </span>
            </div>
          </div>
          <SecondaryButton
            icon="edit"
            label="Edit Profile"
            onClick={() => {
              setActiveTab("about");
              setIsEditing(true);
            }}
            fontSize="medium"
          />
        </div>
      </section>

      <section className="col-span-4 md:col-span-12">
        <div
          role="tablist"
          aria-label="Profile sections"
          className="flex gap-lg border-b border-surface-dim mb-lg"
        >
          {PROFILE_TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={activeTab === tab.id}
              className={`pb-sm px-xs text-label-md transition-colors border-b-2 -mb-px ${activeTab === tab.id
                ? "text-primary border-primary font-semibold"
                : "text-on-surface-variant border-transparent hover:text-on-surface"
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "recipes" && (
          <RecipeSection recipes={recipes?.recipes} loading={recipesLoading} isOwnProfile={isOwnProfile} />
        )}

        {/* {activeTab === "cookbooks" && (
          <CookbooksGrid
            cookbooks={cookbooks}
            loading={cookbooksLoading}
            isOwnProfile={isOwnProfile}
          />
        )} */}

        {activeTab === "about" && (
          <div className="">
            {!isEditing ? (
              <section className="bg-surface-container-lowest w-full rounded-xl p-md md:p-lg paper-shadow">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-lg border-b border-surface-dim pb-sm">
                  Profile Details
                </h2>
                <div className="flex flex-col gap-md">
                  <div className="flex flex-col gap-xs relative pt-4">
                    <p className="absolute top-0 left-3 text-label-md text-on-surface-variant bg-surface-container-lowest px-1 -mt-2">
                      Full Name
                    </p>
                    <p className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm text-body-md text-on-surface placeholder:text-outline">
                      {userData?.name || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-xs relative pt-4 mt-sm">
                    <p className="absolute top-0 left-3 text-label-md text-on-surface-variant bg-surface-container-lowest px-1 -mt-2">
                      Username
                    </p>
                    <p className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm text-body-md text-on-surface placeholder:text-outline">
                      {userData?.username || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col gap-xs relative pt-4 mt-sm">
                    <p className="absolute top-0 left-3 text-label-md text-on-surface-variant bg-surface-container-lowest px-1 -mt-2">
                      Email Address
                    </p>
                    <div className="flex items-center gap-sm">
                      <p className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm text-body-md text-on-surface placeholder:text-outline">
                        {userData?.pendingEmail || userData?.email || "—"}
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

                  <div className="flex justify-end">
                    <SecondaryButton
                      icon="edit"
                      label="Edit"
                      onClick={() => setIsEditing(true)}
                      fontSize="medium"
                    />
                  </div>
                </div>
              </section>
            ) : (
              <section className="bg-surface-container-lowest rounded-xl p-md md:p-lg paper-shadow">
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
                    {errors.name && <p className="text-error text-sm">{errors.name.message}</p>}
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
                      <p className="text-error text-sm">Couldn&apos;t check availability — try again</p>
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
                    {errors.email && <p className="text-error text-sm">{errors.email.message}</p>}
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
                    <SecondaryButton
                      icon="cancel"
                      label="Cancel"
                      onClick={() => {
                        reset();
                        setIsEditing(false);
                      }}
                      fontSize="medium"
                    />
                    <PrimaryButton
                      label={isSubmitting ? <Spinner /> : "Save Changes"}
                      onClick={handleSubmit(onSubmit)}
                      icon={isSubmitting ? null : "check_circle"}
                      fontSize="medium"
                      disabled={isSaveDisabled}
                    />
                  </div>
                </form>
              </section>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default ProfilePage;