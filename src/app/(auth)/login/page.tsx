"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React from "react";
import { Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { loginSchema, LoginSchemaInput, LoginSchemaOutput } from "@/schemas/login.schema";
import Gradient from "../../../../public/Gradient.png";
import { toast } from "sonner";
import { Link } from "react-email";
import { Eye, EyeOff } from "lucide-react";

export default function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const form = useForm<LoginSchemaInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = form;

    const onSubmit = async (data: LoginSchemaOutput) => {
        try {
            const result = await signIn("credentials", {
                redirect: false,
                identifier: data.identifier,
                password: data.password,
            });
            if (result?.error) {
                toast.error(result.error, { position: "top-right" });
                setError(result.error);
            } else if (result?.ok) {
                toast.success("Login successful! Redirecting to dashboard...", {
                    position: "top-right",
                });
                router.replace("/dashboard");
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError("Invalid email or password" + error.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    return (
        < div
            className="bg-background text-on-background font-body-md min-h-screen flex flex-col antialiased bg-ambient"
        >


            <main
                className="grow flex items-center justify-center w-full px-margin-mobile py-xl"
            >
                <div
                    className=" w-[90%] md:w-[40%] bg-surface-container-lowest rounded-2xl shadow-md border border-outline-variant p-8 md:p-10"
                >

                    <div className="mb-xl text-center">
                        <div className="mb-lg">
                            <a
                                className="font-display-lg-mobile text-display-lg-mobile text-primary inline-block md:hidden"
                                href="#"
                            >RecipeBox</a>
                        </div>
                        <h1
                            className="font-display-lg text-display-lg text-on-surface mb-sm hidden md:block"
                        >
                            Log In
                        </h1>
                        <h1
                            className="font-display-lg-mobile text-display-lg-mobile text-on-surface mb-sm md:hidden"
                        >
                            Log In
                        </h1>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                            Enter your details to access your account.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label
                                className="block font-label-md text-label-md text-on-surface mb-xs"
                                htmlFor="email"
                            >Email or Username</label>
                            <input
                                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                id="email"

                                placeholder="chef@example.com"
                                type="text"
                                {...register("identifier")}
                            />
                            {errors.identifier && <p className="text-error text-sm mt-1">{errors.identifier.message}</p>}
                        </div>
                        <div>
                            <label
                                className="block font-label-md text-label-md text-on-surface mb-xs"
                                htmlFor="password"
                            >Password</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    id="password"

                                    placeholder="••••••••"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3  -translate-y-1/2 top-1/2 text-on-surface-variant hover:text-on-surface transition-all"
                                >
                                    {showPassword ? <Eye /> : <EyeOff />}
                                </button>
                                {errors.password && <p className="text-error text-sm mt-1">{errors.password.message}</p>}
                            </div>
                        </div>
                        <div className="flex items-center justify-end">

                            <div className="text-sm">
                                <a
                                    className="font-label-md text-label-md text-primary hover:underline transition-all"
                                    href="#"
                                >Forgot password?</a>
                            </div>
                        </div>
                        <div>
                            <button
                                disabled={isSubmitting}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm font-label-md text-label-md text-on-primary bg-primary hover:bg-primary-container hover:text-on-primary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                                type="submit"
                            >
                                Log In
                            </button>
                        </div>
                    </form>





                    <p
                        className="mt-8 text-center font-body-md text-body-md text-on-surface-variant"
                    >
                        Don't have an account?
                        <a
                            className="font-label-md text-label-md text-primary hover:underline transition-all"
                            href="#"
                        >Sign up</a>
                    </p>
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
    )
}
