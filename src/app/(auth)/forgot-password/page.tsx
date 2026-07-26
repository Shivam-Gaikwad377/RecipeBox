"use client";
import axios from "axios";
import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ApiResponse from "@/types/ApiResponse";
import Image from "next/image";
import Gradient from "../../../../public/Gradient.png";
const Page = () => {
    const [email, setEmail] = useState("");
    const router = useRouter();

    const onSubmit = async () => {
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }
        try {
            const response: ApiResponse = await axios.post(
                "/api/auth/forgot-password",
                { identifier: email }
            );
            if (response.data.success) {
                toast.success(
                    "Password reset email sent successfully. Please check your email for the OTP."
                );
                router.replace("/reset-password?email=" + email);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(err.message);
                // safe to access err.message, err.stack, err.name
            } else {
                console.error("Unknown error:", err);
            }
        }
    };

    return (
        <>
            <div
                className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased bg-ambient"
            >

                <main
                    className="grow flex items-center justify-center px-margin-mobile md:px-margin-desktop py-xl relative"
                >

                    <div
                        className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-30 blur-[100px]"
                    >
                        <div
                            className="w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter"
                        ></div>
                        <div
                            className="w-96 h-96 bg-secondary-container rounded-full mix-blend-multiply filter translate-x-20 -translate-y-20"
                        ></div>
                    </div>
                    <div
                        className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(30,27,24,0.04)] q-[90%] md:w-[40%]  p-md md:p-lg relative z-10"
                    >
                        <div className="flex flex-col items-center text-center mb-lg">
                            <div
                                className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-full mb-md text-primary"
                            >
                                <span
                                    className="material-symbols-outlined text-[32px]"
                                    style={{ fontVariationSettings: '"FILL" 1' }}
                                >key</span>
                            </div>
                            <h1 className="font-headline-md text-headline-md text-on-surface mb-xs">
                                Forgot Password?
                            </h1>
                            <p className="font-body-md text-body-md text-on-surface-variant">
                                No worries! Enter your email address below and we'll send you
                                instructions to reset your password.
                            </p>
                        </div>
                        <form className="flex flex-col gap-md" onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit();
                        }}>
                            <div className="flex flex-col gap-xs">
                                <label
                                    className="block font-label-md text-label-md text-on-surface mb-xs"
                                    htmlFor="email"
                                >Email Address</label>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    placeholder="chef@recipebox.com"
                                    required={true}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)} 
                                />
                            </div>
                            <button
                                className="w-full bg-primary text-on-primary font-label-md text-label-md py-sm rounded-full hover:bg-primary-container hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md mt-sm flex justify-center items-center gap-2"
                                type="submit"
                            >
                                Reset Password
                                <span className="material-symbols-outlined text-[18px]"
                                >arrow_forward</span>
                            </button>
                        </form>
                        <div className="mt-lg text-center">
                            <a
                                className="font-label-md text-label-md text-primary hover:text-primary-container hover:underline transition-colors flex items-center justify-center gap-xs"
                                href="#"
                            >
                                <span className="material-symbols-outlined text-[16px]"
                                >arrow_back</span>
                                Back to Login
                            </a>
                        </div>
                    </div>
                </main>

            </div>
            <footer
                className="bg-surface w-full bottom-0 flex flex-col md:flex-row justify-between items-center px-margin-desktop py-md gap-md mt-auto border-t border-outline-variant"
            >
                <div
                    className="font-headline-sm text-headline-sm text-primary "
                >
                    RecipeBox
                </div>

                <div
                    className="font-label-sm text-label-sm text-on-tertiary-fixed-variant  text-center md:text-right"
                >
                    © {new Date().getFullYear()} RecipeBox. Crafted for culinary enthusiasts.
                </div>
            </footer>
        </>
    );
};

export default Page;
