"use client"
import React from 'react'
import { useState, useEffect } from "react"
import RecipeCard from "@/components/RecipeCard"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import axios from "axios"
import { UserDocument } from '@/models/user.model'
import ApiResponse from '@/types/ApiResponse'
import SecondaryBUtton from '@/components/SecondaryButton'
import PrimaryButton from '@/components/PrimaryButton'
import SecondaryButton from '@/components/SecondaryButton'
const page = () => {
    const [profileData, setProfileData] = useState<UserDocument | null>(null);
    const pathname = usePathname();
    const username = pathname.split("/").pop(); // Extract the username from the URL
    const { data: session } = useSession();
    const [followerCount, setFollowerCount] = useState<number>(0);
    const [followingCount, setFollowingCount] = useState<number>(0);
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState<boolean>(false);

    useEffect(() => {
        if (session?.user?.data?.username === username) {
            // Redirect to the user's own profile page or dashboard
            router.push("/profile");
        }

        const fetchProfileData = async () => {

            try {
                const response = await axios.get<ApiResponse>(`/api/profile/${username}`);
                setProfileData(response?.data?.data);
            } catch (error) {
                toast.error("Failed to fetch profile data");
                console.error("Error fetching profile data:", error);
            }
        }

            ;

        fetchProfileData();
    }, [username]);

    useEffect(() => {
        const fetchFollowerCount = async () => {
            if (!profileData?._id) return;
            try {
                const response = await axios.get<ApiResponse>(`/api/users/${profileData?._id}/followers`);
                setFollowerCount(response.data.data.count);
            } catch (error) {
                console.error(error, "Failed to fetch follower count.");
            }
        };

        const fetchFollowingCount = async () => {
            if (!profileData?._id) return;
            try {
                const response = await axios.get<ApiResponse>(`/api/users/${profileData?._id}/following`);
                setFollowingCount(response.data.data.count);
            } catch (error) {
                console.error(error, "Failed to fetch following count.");
            }
        };

        fetchFollowerCount();
        fetchFollowingCount();
    }, [profileData?._id]);
    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (!profileData?._id || !session?.user?._id) return;
            try {
                const response = await axios.get<ApiResponse>(`/api/users/${profileData?._id}/follow/${session?.user?._id}`);
                setIsFollowing(response.data.data.isFollowing);
            } catch (error) {
                console.error(error, "Failed to fetch follow status.");
            }
        }
        fetchFollowStatus();
    }, [profileData?._id, session?.user?._id]);
    const handleFollow = async () => {
        if (!session?.user?._id) {
            toast.error("You must be logged in to follow users.");
            return;
        }
        const response = await axios.post<ApiResponse>(`/api/users/${profileData?._id}/follow`);
        setIsFollowing(true);
    };
    return (
        <main
            className=" mx-auto px-margin-mobile pt-md md:px-margin-desktop  "
        >

            <section className="flex flex-col items-center text-center  mb-xl">
                <div
                    className="w-32 h-32 rounded-full overflow-hidden mb-md shadow-md border-4 border-surface-container-lowest"
                >
                    <img
                        className="w-full h-full object-cover"
                        data-alt="A highly detailed close-up portrait of an inviting, modern chef or food enthusiast in a warmly lit kitchen environment. The subject has a friendly expression, soft natural lighting highlights their features against a slightly blurred, bright minimalist background featuring soft cream and sage green tones. High-end food lifestyle photography aesthetic."
                        src={profileData?.avatar?.avatarUrl} />
                </div>
                <h1 className="font-headline-md text-headline-md text-on-background mb-xs">
                    {profileData?.name || "Eleanor Vance"}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                    @{profileData?.username || "eleanorcooks"}
                </p>
                <p
                    className="font-body-md text-body-md text-tertiary-container max-w-2xl mx-auto mb-lg"
                >
                    {profileData?.bio || "No Bio available."}
                </p>
                {isFollowing ? (
                    <SecondaryButton
                        label="Unfollow"
                        icon={undefined}
                        fontSize="large"
                        onClick={() => { }}
                    />
                ) : (
                    <PrimaryButton
                        label="Follow"
                        icon={undefined}
                        fontSize="large"
                        onClick={handleFollow}
                    />
                )}
                <div
                    className="flex justify-center gap-xl w-full max-w-lg border-t border-b border-surface-variant py-md"
                >
                    <div className="flex flex-col items-center">
                        <span className="font-headline-sm text-headline-sm text-on-background"
                        >{0}</span>
                        <span
                            className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-xs"
                        >Recipes</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-headline-sm text-headline-sm text-on-background"
                        >{followerCount}</span>
                        <span
                            className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-xs"
                        >Followers</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-headline-sm text-headline-sm text-on-background"
                        >{followingCount}</span>
                        <span
                            className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-xs"
                        >Following</span>
                    </div>
                </div>
            </section>

            <section className="mb-lg">
                <div className="flex gap-lg border-b border-surface-variant">
                    <button
                        className="font-label-md text-label-md text-primary border-b-2 border-primary pb-sm transition-colors"
                    >
                        Recipes
                    </button>
                    <button
                        className="font-label-md text-label-md text-on-surface-variant hover:text-primary pb-sm transition-colors"
                    >
                        Cookbooks
                    </button>
                    <button
                        className="font-label-md text-label-md text-on-surface-variant hover:text-primary pb-sm transition-colors"
                    >
                        Reviews
                    </button>
                </div>
            </section>

            <section
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter"
            >

                <article
                    className="bg-surface-container-lowest rounded-xl overflow-hidden card-shadow hover-lift cursor-pointer flex flex-col h-full"
                >
                    <div className="relative h-64 w-full">
                        <img
                            className="w-full h-full object-cover"
                            data-alt="A beautiful, overhead shot of an artisan sourdough bread loaf resting on a rustic wooden board. The bread has a perfectly scored crust, dusted lightly with flour. Soft, warm natural sunlight streams across the scene, highlighting the texture of the crust. The background is a clean, minimalist cream marble surface, embodying a modern epicurean aesthetic."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdAb7z1tWBnjSAbLEjpcvP6Mgb0pGEs4Jd6olz1Be8OQxXu4b9VIxjaESmmY4k75El47KeyYr7ZmeitJqUVCEBRHDGBRaaksIYEZT0FTi33PoNsNRqPNXvltLzIa58yQNYP4S0jjrnalLXtg0FNCDcatIIMrqEEbSpUMXDqrcV45-hufqIeAtQTG6NK3mFByz0qUBDG7Jl1VIY7kU7eZs_7H8VqNAlGG8E5seCRr2xGNzZsPP4zXiO2dRCxtUHQclggXmPelrXoZI"
                        />
                        <button
                            className="absolute top-sm right-sm w-10 h-10 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined">favorite</span>
                        </button>
                    </div>
                    <div className="p-md flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-sm">
                            <span
                                className="font-label-sm text-label-sm text-primary uppercase tracking-wider"
                            >Baking</span>
                            <div className="flex items-center gap-xs text-on-surface-variant">
                                <span
                                    className="material-symbols-outlined text-[16px]"
                                    style={{ fontVariationSettings: '"FILL" 1' }}
                                >star</span>
                                <span className="font-label-sm text-label-sm">4.9</span>
                            </div>
                        </div>
                        <h3
                            className="font-headline-sm text-headline-sm text-on-background mb-sm line-clamp-2"
                        >
                            Classic Country Sourdough Loaf
                        </h3>
                        <div
                            className="mt-auto flex items-center gap-md text-on-surface-variant font-label-sm text-label-sm"
                        >
                            <div className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[16px]"
                                >schedule</span>
                                <span>24h</span>
                            </div>
                            <div className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[16px]">speed</span>
                                <span>Advanced</span>
                            </div>
                        </div>
                    </div>
                </article>

                <article
                    className="bg-surface-container-lowest rounded-xl overflow-hidden card-shadow hover-lift cursor-pointer flex flex-col h-full"
                >
                    <div className="relative h-64 w-full">
                        <img
                            className="w-full h-full object-cover"
                            data-alt="A vibrant, close-up photograph of a rustic galette filled with seasonal berries, featuring a golden, flaky crust. The tart sits on a piece of crinkled parchment paper atop a clean, warm-toned stone surface. Gentle, diffused light emphasizes the glossy fruit and the artisanal texture of the pastry, capturing a sophisticated, minimalist culinary style."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoAi-CizBXJo28cB5z3U0FxZjGM3m3UGkGlKhgYlHn_TzJginSx67TXDztDxvQiYoYa7V4vWjzUVqsTtGjd-EjlxUy6Iz69yESRkPVB1Utee2ZJf8MhWs0n0DI6XtQZUZGf6Dx0As4cz9YWqGgvWOiRhqgyK_O-ftQRUugr81GMOxMHfXqwQo2VB3d-oT0VGNwJdOeRgiuIqhiHsX9uCnk6fwS2jdOfeK9YnmKBA1mGwnsGN3tXWWH9MdQoGluahJ18gTI9acl_L8"
                        />
                        <button
                            className="absolute top-sm right-sm w-10 h-10 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined">favorite</span>
                        </button>
                    </div>
                    <div className="p-md flex flex-col grow">
                        <div className="flex justify-between items-start mb-sm">
                            <span
                                className="font-label-sm text-label-sm text-secondary uppercase tracking-wider"
                            >Pastry</span>
                            <div className="flex items-center gap-xs text-on-surface-variant">
                                <span
                                    className="material-symbols-outlined text-[16px]"
                                    style={{ fontVariationSettings: '"FILL" 1' }}
                                >star</span>
                                <span className="font-label-sm text-label-sm">4.8</span>
                            </div>
                        </div>
                        <h3
                            className="font-headline-sm text-headline-sm text-on-background mb-sm line-clamp-2"
                        >
                            Rustic Mixed Berry Galette
                        </h3>
                        <div
                            className="mt-auto flex items-center gap-md text-on-surface-variant font-label-sm text-label-sm"
                        >
                            <div className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[16px]"
                                >schedule</span>
                                <span>1h 15m</span>
                            </div>
                            <div className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[16px]">speed</span>
                                <span>Medium</span>
                            </div>
                        </div>
                    </div>
                </article>

                <article
                    className="bg-surface-container-lowest rounded-xl overflow-hidden card-shadow hover-lift cursor-pointer flex flex-col h-full"
                >
                    <div className="relative h-64 w-full">
                        <img
                            className="w-full h-full object-cover"
                            data-alt="A high-end food photograph of delicate, pale green pistachio macarons stacked neatly on a pristine white ceramic plate. The background is a soft, out-of-focus cream color with a hint of warm sunlight casting gentle shadows. The composition is clean, airy, and minimalist, emphasizing the precise craftsmanship of the pastries."
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvSD8or9W5k7OLQcgxnVUBTyXv1JFSsIJ5ihk1x48A9tNorZKgo3LOTDJeY_Q4mnfbzw7HwFDDyzgS0iEHoiCO3Hec-hABQxdeVt85aB3HRcq67TEC4XcJPDOVeUJMCwQhE7mU4HvZ2x7Fyos_fPcNs7q8uWFkiyBm9_zCHR3EkUhMEgibv1x4S_d9czZLHg_0d8QDllxaPRjiIo9v__FerYGzCjoDDehI6VNeJtrXusOH5OqyHyuwodzPXcjyJpk8VmsvXIk05tc"
                        />
                        <button
                            className="absolute top-sm right-sm w-10 h-10 bg-surface-container-lowest/80 backdrop-blur-sm rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined">favorite</span>
                        </button>
                    </div>
                    <div className="p-md flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-sm">
                            <span
                                className="font-label-sm text-label-sm text-primary uppercase tracking-wider"
                            >Dessert</span>
                            <div className="flex items-center gap-xs text-on-surface-variant">
                                <span
                                    className="material-symbols-outlined text-[16px]"
                                    style={{ fontVariationSettings: '"FILL" 1' }}
                                >
                                    star
                                </span>
                                <span className="font-label-sm text-label-sm">5.0</span>
                            </div>
                        </div>
                        <h3
                            className="font-headline-sm text-headline-sm text-on-background mb-sm line-clamp-2"
                        >
                            Pistachio &amp; Rosewater Macarons
                        </h3>
                        <div
                            className="mt-auto flex items-center gap-md text-on-surface-variant font-label-sm text-label-sm"
                        >
                            <div className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[16px]"
                                >schedule</span>
                                <span>2h 30m</span>
                            </div>
                            <div className="flex items-center gap-xs">
                                <span className="material-symbols-outlined text-[16px]">speed</span>
                                <span>Advanced</span>
                            </div>
                        </div>
                    </div>
                </article>
            </section>
        </main>
    )
}

export default page