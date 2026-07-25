"use client"
import React from 'react'
import { useState } from "react"
import Image from 'next/image';
import leftImage from "../../../../public/a_beautiful_high_quality_photograph_of_fresh_ingredients_on_a_wooden_kitchen.png"
import { signUpSchema } from "@/schemas/signup.schema";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpSchemaInput, SignUpSchemaOutput } from "@/schemas/signup.schema";
import ApiResponse from '@/types/ApiResponse';
import { EyeOff, Eye } from "lucide-react"

const Page = () => {
    const form = useForm<SignUpSchemaInput>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            username: "",
            email: "",
            password: "",
        },
    });

    const { register, handleSubmit, formState: { errors } } = form;
    const [showPassword, setShowPassword] = useState(false);
    const onSubmit = async (data: SignUpSchemaInput) => {
        let response;
        try {
            response = await axios.post<ApiResponse>("/api/auth/signup", data);

        } catch (error) {

            console.error("Error creating user:", error);
        }
    };

    return (
        <div className="bg-background text-on-background antialiased flex flex-col min-h-screen">
            <main className="grow flex flex-col md:flex-row h-screen md:h-auto min-h-screen">
                <div className="hidden md:flex md:w-1/2 relative bg-surface-container-high overflow-hidden">
                    <Image
                        src={leftImage}
                        alt="Fresh ingredients on a wooden kitchen counter"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-on-background/60 to-transparent flex flex-col justify-end p-margin-desktop z-10">
                        <blockquote className="font-headline-md text-headline-md text-on-primary mb-sm">
                            "Join the community of home cooks."
                        </blockquote>
                        <p className="font-body-md text-body-md text-surface-container-low">
                            Discover, share, and perfect your favorite recipes with passionate foodies worldwide.
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-1/2 flex items-center justify-center p-margin-mobile md:p-margin-desktop bg-surface">
                    <div className="w-full">
                        <div className="text-center mb-xl">
                            <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-sm">
                                Create an Account
                            </h1>
                            <p className="font-body-lg text-body-lg text-on-surface-variant">
                                Start your culinary journey today.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
                            {/* Full Name */}
                            <div className="relative">
                                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs" htmlFor="fullName">
                                    Full Name
                                </label>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    id="fullName"
                                    placeholder='Jane Doe'
                                    type="text"
                                    {...register("name")}
                                />
                                {errors.name && <p className="text-error text-sm mt-1">{errors.name.message}</p>}
                            </div>

                            {/* Username */}
                            <div className="relative">
                                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs" htmlFor="username">
                                    Username
                                </label>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    id="username"
                                    placeholder="Jane-Doe"
                                    type="text"
                                    {...register("username")}
                                />
                                {errors.username && <p className="text-error text-sm mt-1">{errors.username.message}</p>}
                            </div>

                            {/* Email */}
                            <div className="relative">
                                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs" htmlFor="email">
                                    Email Address
                                </label>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    id="email"
                                    placeholder="jane@example.com"
                                    type="email"
                                    {...register("email")}
                                />
                                {errors.email && <p className="text-error text-sm mt-1">{errors.email.message}</p>}
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs" htmlFor="password">
                                    Password
                                </label>
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    id="password"
                                    placeholder="••••••••"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3  -translate-y-1/5 top-1/2 text-on-surface-variant hover:text-on-surface transition-all"
                                >
                                    {showPassword ? <Eye /> : <EyeOff />}
                                </button>
                                {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
                            </div>

                            <button
                                className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 rounded-full hover:bg-primary-container hover:-translate-y-0.5 transition-all shadow-sm active:scale-95 mt-lg"
                                type="submit"
                            >
                                Create Account
                            </button>
                        </form>

                        <div className="mt-xl flex flex-col gap-md text-center">
                            <div>
                                <p className="font-body-md text-body-md text-on-surface-variant">
                                    Already have an account?{" "}
                                    <a className="text-primary font-label-md text-label-md hover:underline transition-all" href="#">
                                        Log in
                                    </a>
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </main>
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
        </div>
    );
};

export default Page;