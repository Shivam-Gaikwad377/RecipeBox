"use client"
import React from 'react'
import axios from "axios"
import { UserDocument } from "@/models/user.model";
import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react";
import ApiResponse from "@/types/ApiResponse";
import { toast } from "sonner";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateProfileSchema, UpdateProfileInput, UpdateProfileOutput } from '@/schemas/updateProfile.schema';
import useDebounce from '@/hooks/useDebouncedValue';
const page = () => {
  const session = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserDocument | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [usernameAvailable, setUsernameAvailable] = useState<number>(0);
  const [newusername, setNewUsername] = useState<string>("");
  const debouncedUsername = useDebounce(newusername, 1000);
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (debouncedUsername && debouncedUsername !== session?.data?.user?.username) {
        try {
          const response = await axios.get<ApiResponse>(`/api/profile/username-check?username=${debouncedUsername}`);
          setUsernameAvailable(response?.status);
        } catch (error) {
          console.error("Error checking username availability:", error);
        }
      } else {
        setUsernameAvailable(null);
      }
    };
    checkUsernameAvailability();
  }, [debouncedUsername]);

  const form = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: userData?.name || "",
      username: newusername || "",
      email: userData?.email || "",
      bio: userData?.bio || "",
    },
  });
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = form;
  useEffect(() => {
    if (userData) {
      reset({
        name: userData.name || "",
        username: newusername || "",
        email: userData.email || "",
        bio: userData.bio || "",
      });
    }
  }, [userData, reset]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.data?.user?.username) {
        const username = session?.data?.user?.username;

        try {
          const response = await axios.get<ApiResponse>(`/api/profile/${username}`);
          setUserData(response?.data?.data);
          setNewUsername(response?.data?.data?.username || "");
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchUserData();
  }, [session?.data?.user?.username]);
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Grab the file directly from the event target
    const targetFile = e.target.files?.[0];
    if (!targetFile) return;

    // Update local state for tracking if needed
    setAvatarFile(targetFile);
    try {
      const uploadData = new FormData();
      uploadData.append("avatar", targetFile as File);

      const res = await axios.patch("/api/profile/avatar", uploadData);
      const updatedProfile = await axios.get(`/api/profile/${userData?.username}`);
      setUserData(updatedProfile.data.data);
      toast.success("Avatar updated successfully!");
      // Refresh profile data to show new avatar
    } catch (error) {
      toast.error("Error updating avatar.");
    } finally {
    }
  };
  return (


    <>
      <section
        className="col-span-4 md:col-span-12 flex flex-col md:flex-row items-center md:items-start gap-lg mb-xl mt-lg"
      >

        <div className="relative group">
          <img
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-sm ring-4 ring-surface-container-lowest"
            data-alt="A high-quality, professional portrait photograph of a woman with warm lighting. She is smiling softly, set against a blurred, bright kitchen background. The image has a clean, natural, and inviting warm minimalist aesthetic with soft depth of field."
            src={userData?.avatar?.avatarUrl}
          />
          <button
            aria-label="Change avatar"
            className="absolute bottom-0 right-0 bg-surface-container-lowest border border-outline-variant rounded-full p-2 shadow-sm text-primary hover:bg-surface-container hover-lift flex items-center justify-center transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <span
              className="material-symbols-outlined text-[20px]"
              data-icon="photo_camera"
              data-weight="fill"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >photo_camera</span>
          </button>
          <input
            className="px-md py-sm hidden bg-surface-container-high text-on-surface  text-label-md rounded border border-outline-variant hover:bg-surface-variant transition-colors  items-center gap-xs"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
          />
        </div>
        <div
          className="flex flex-col items-center md:items-start text-center md:text-left grow"
        >
          <h1
            className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface mb-xs"
          >
            {userData?.name || "Jane Doe"}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-md">
            @{userData?.username || "janecooks"}
          </p>
          <div className="flex items-center gap-lg mb-md">
            <div className="flex flex-col items-center md:items-start">
              <span className=" text-label-md text-on-surface"
              > 24</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant"
              >Recipes</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className=" text-label-md text-on-surface"
              >1.2k</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant"
              >Followers</span>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <span className=" text-label-md text-on-surface"
              > 158</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant"
              >Following</span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-md py-sm rounded-full border-2 border-primary text-primary  text-label-md hover:bg-primary-fixed transition-colors hover-lift flex items-center gap-xs bg-surface-container-lowest"
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="edit"
            >edit</span>
            Edit Profile Details
          </button>
        </div>
      </section>

      <div
        className="col-span-4 md:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-xl items-start"
      >

        {!isEditing ? (<section
          className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-md md:p-lg paper-shadow"
        >
          <h2
            className="font-headline-md text-headline-md text-on-surface mb-lg border-b border-surface-dim pb-sm"
          >
            Profile Details
          </h2>
          <form className="flex flex-col gap-md">

            <div className="flex flex-col gap-xs relative pt-4">
              <p
                className="absolute top-0 left-3 text-label-md  text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"

              >Full Name</p>
              <p
                className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm  text-body-md text-on-surface placeholder:text-outline"

              >{userData?.name || "Jane Doe"}</p>
            </div>

            <div className="flex flex-col gap-xs relative pt-4 mt-sm">
              <p
                className="absolute top-0 left-3 text-label-md  text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"

              >Username</p>
              <p
                className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm  text-body-md text-on-surface placeholder:text-outline"

              >{userData?.username || "janecooks"}</p>
            </div>

            <div className="flex flex-col gap-xs relative pt-4 mt-sm">
              <p
                className="absolute top-0 left-3 text-label-md  text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"

              >Email Address</p>
              <p
                className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm  text-body-md text-on-surface placeholder:text-outline"

              >{userData?.email || "jane.doe@example.com"}</p>
            </div>

            <div className="flex flex-col gap-xs relative pt-4 mt-sm mb-md">
              <p
                className="absolute top-0 left-3 text-label-md  text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"

              >Bio</p>
              <p
                className="minimal-input w-full bg-transparent rounded-lg px-sm py-sm  text-body-md text-on-surface placeholder:text-outline resize-none"

              >
                {userData?.bio || "No bio available."}</p>
            </div>


          </form>
        </section>) : (
          <section
            className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-md md:p-lg paper-shadow"
          >
            <h2
              className="font-headline-md text-headline-md text-on-surface mb-lg border-b border-surface-dim pb-sm"
            >
              Profile Details
            </h2>
            <form className="flex flex-col gap-md">

              <div className="flex flex-col gap-xs relative pt-4">
                <label
                  className="absolute top-0 left-3 text-label-md font-bold text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"
                  htmlFor="fullName"
                >Full Name</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="fullName"
                  type="text"
                  
                />
              </div>

              <div className="flex flex-col gap-xs relative pt-4 mt-sm">
                <label
                  className="absolute top-0 left-3 text-label-md  text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"
                  htmlFor="username"
                >Username</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="username"
                  type="text"
                  
                  onChange={(e) => setNewUsername(e.target.value)}
                  
                />
                
                {usernameAvailable ? (<p className="text-success text-sm">Username is available</p>) : (<p className="text-error text-sm">Username is not available</p>)}
              </div>

              <div className="flex flex-col gap-xs relative pt-4 mt-sm">
                <label
                  className="absolute top-0 left-3 text-label-md  text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"
                  htmlFor="email"
                >Email Address</label>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="email"
                  type="email"
                
                />
              </div>

              <div className="flex flex-col gap-xs relative pt-4 mt-sm mb-md">
                <label
                  className="absolute top-0 left-3 text-label-md  text-on-surface-variant bg-surface-container-lowest px-1 -mt-2"
                  htmlFor="bio"
                >Bio</label>
                <textarea
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  id="bio"
                  rows={4}
                  {...register("bio")}
                />
                  
              </div>

              <div className="flex w-full justify-end gap-sm">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-md py-sm rounded-full border-2 border-primary text-primary  text-label-md hover:bg-primary-fixed transition-colors hover-lift flex items-center gap-xs bg-surface-container-lowest"
                >
                  <span className="material-symbols-outlined text-[18px]" data-icon="edit"
                  >cancel</span>
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="  px-md bg-primary text-on-primary  text-label-md py-sm rounded-full hover:bg-primary-container hover-lift transition-all shadow-sm flex items-center justify-center gap-xs"
                  type="button"
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    data-icon="check_circle"
                  >check_circle</span>
                  Save Changes
                </button>
              </div>
            </form>
          </section>)}

        <section className="lg:col-span-7 flex flex-col gap-md">
          <div className="flex justify-between items-end mb-sm">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              My Collections
            </h2>
            <button
              className="text-primary  text-label-md hover:underline flex items-center gap-xs"
            >
              View All
              <span
                className="material-symbols-outlined text-[16px]"
                data-icon="arrow_forward"
              >arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter">

            <a
              className="group block bg-surface-container-lowest rounded-xl p-xs paper-shadow hover-lift"
              href="#"
            >
              <div
                className="relative h-48 w-full rounded-lg overflow-hidden mb-sm"
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  data-alt="A close-up, top-down view of freshly baked rustic Italian bread, steaming slightly, next to a bowl of rich tomato sauce and fresh basil on a distressed wooden table. Warm, natural lighting highlighting the crust textures. Minimalist, high-end food photography style."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkM-W3WC3a0HU3RcO4m6Z62m8rGUw6RUL72hV1GOstclO_eDceVzyTgUOmpJit8629TK-2JgII4iZfgGQDn1AdtptGktDS_2eMCfIogLMccLmrjy81poxvQXuDZQPYw8BK-8WmUn0zuy_VRPKQn3ouQndyTGr7S8rwZrFY-KMpwjuYcziP__82uBaB3Iaj_6H_FyLiZBfrrDSCHCMyUhr5hwHb4dAG6CX9wOMXSiTkClgmHLXhhDrad-qSfscDpADA8dbONTVb2b8"
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-inverse-surface/60 to-transparent"
                ></div>
                <span
                  className="absolute bottom-sm left-sm text-on-primary font-label-sm text-label-sm bg-inverse-surface/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20"
                >12 Recipes</span>
              </div>
              <div className="px-xs pb-xs">
                <h3
                  className="font-headline-sm text-headline-sm text-on-surface leading-tight mb-xs"
                >
                  Rustic Italian
                </h3>
                <p
                  className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs"
                >
                  <span
                    className="material-symbols-outlined text-[14px]"
                    data-icon="public"
                  >public</span>
                  Public Collection
                </p>
              </div>
            </a>

            <a
              className="group block bg-surface-container-lowest rounded-xl p-xs paper-shadow hover-lift"
              href="#"
            >
              <div
                className="relative h-48 w-full rounded-lg overflow-hidden mb-sm"
              >
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  data-alt="A beautifully scored sourdough boule cooling on a wire rack next to a dusting of flour and a linen towel. The lighting is soft and diffused, creating a serene, earthy, and warm minimalist atmosphere."
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_C3iaoGw0BJy1KimNn8QWDXmxEWy9BYR8xfs1JesB0yTlQEaA-shztu2zuTzDGFvoQX3s3ez2LY7dzqQw4fRK-xEUTTW0L9-OyO0BPHiLDobuo5IFuM5AvnUHki08WSxvFp6aRnDHUg7Rq4pVouM2Dz8AyViFJsuh6N8hD0fBgAOEk0tugJFHOfFVpSzzB4JMRqn8BZVQn47vF9O4IyMf4uEmYrvelS6ALQO_buSNFdubJlGrZeFqnOW-FED79TONQ3APg42gMvo"
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-inverse-surface/60 to-transparent"
                ></div>
                <span
                  className="absolute bottom-sm left-sm text-on-primary font-label-sm text-label-sm bg-inverse-surface/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/20"
                >8 Recipes</span>
              </div>
              <div className="px-xs pb-xs">
                <h3
                  className="font-headline-sm text-headline-sm text-on-surface leading-tight mb-xs"
                >
                  Sourdough Journey
                </h3>
                <p
                  className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-xs"
                >
                  <span
                    className="material-symbols-outlined text-[14px]"
                    data-icon="lock"
                    data-weight="fill"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >lock</span>
                  Private
                </p>
              </div>
            </a>

            <button
              className="h-full min-h-62.5 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-sm text-on-surface-variant hover:text-primary hover:border-primary hover:bg-surface-container-low transition-all hover-lift"
            >
              <div
                className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-xs"
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  data-icon="add"
                >add</span>
              </div>
              <span className=" text-label-md font-semibold"
              >Create New Collection</span>
            </button>
          </div>
        </section>
      </div>

    </>
  )
}

export default page