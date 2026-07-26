"use client";

import React, { Suspense, useEffect } from "react";
import { useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

import ApiResponse from "@/types/ApiResponse";

import { Eye, EyeOff } from "lucide-react";
const ResetPassword = () => {
    const [timer, setTimer] = useState(60); // 60 seconds (1 minute)
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const [otp, setOtp] = useState<string[]>(Array(6).fill("")); // Initialize an array of 6 empty strings
    const inputRef = useRef<(HTMLInputElement | null)[]>([]);
    const [resend, setResend] = useState(false);
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Ensure only the last digit is kept
        setOtp(newOtp);

        if (index < 5 && value) {
            (inputRef.current as (HTMLInputElement | null)[] | null)?.[
                index + 1
            ]?.focus(); // Move to the next input if it exists
        }
    };

    const handleKeyDown = (
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (event.key === "Backspace" && !otp[index] && index > 0) {
            (inputRef.current as (HTMLInputElement | null)[] | null)?.[
                index - 1
            ]?.focus(); // Move to the previous input if it exists
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const enteredOtp = otp.join("");
        if (enteredOtp.length < 6) {
            toast.error("Please enter the complete 6-digit OTP code.");
            return;
        }
        setIsSubmitting(true);
        try {
            const response: ApiResponse = await axios.post(
                "/api/auth/reset-password",
                {
                    email,
                    verificationToken: enteredOtp,
                    newPassword,
                }
            );
            toast.success(response.data.message || "Password reset successfully");
            router.replace("/login");
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                "Invalid verification code. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };
    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData?.getData("text")?.slice(0, 6);
        if (!pasted || !/^\d+$/.test(pasted)) return;

        const newOtp = [...otp];
        pasted.split("").forEach((char, i) => (newOtp[i] = char));
        setOtp(newOtp);

        // focus last filled field
        (inputRef.current as (HTMLInputElement | null)[] | null)?.[
            Math.min(pasted.length - 1, 5)
        ]?.focus();
    };
    const handleResend = async () => {
        try {
            const response: ApiResponse = await axios.post(
                "/api/auth/forgot-password",
                {
                    email,
                }
            );
            if (response.data.success) {
                toast.success(
                    response.data.message ||
                    "Verification code resent successfully. Please check your email."
                );
            }
        } catch (err: any) {
            toast.error(
                err.response?.data?.message ||
                "Failed to resend verification code. Please try again."
            );

            return;
        }
    };
    useEffect(() => {
        if (timer > 0) {
            const countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(countdown);
        } else {
            setResend(true);
        }
    }, [timer]);
    return (
        <div
            className="bg-background text-on-background font-body-md min-h-screen flex flex-col relative overflow-x-hidden"
        >

            <main
                className="grow flex items-center justify-center relative w-full px-margin-mobile md:px-margin-desktop py-xl"
            >

                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 scale-110"
                        data-alt="A softly out-of-focus background depicting a warm, inviting modern kitchen setting. Elements of fresh ingredients and rustic wooden textures are slightly visible through the blur. The lighting is bright and sunny, enhancing a warm minimalist aesthetic with soft cream and subtle orange tones. The overall feeling is culinary, clean, and inspiring, providing a perfect subtle backdrop for a clean interface without distracting the user."
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAYD5ov_KY4vz3WkL772eYicCoQXw8znLoy7Wz6RpdC3b-Ts_xSrlO1s-KrY_WNl89RTHp-9R_HHee2cLhxiwQUP65LdRqFrLr8z_lh1zXalDDXTOyqzj_sAYQoykdec8L6YclQIZK7jVQX5qUYFXVrB3o6UzwL9rcGIQyE8mNPET7n1pul9Ga4DWDEmlqGwG-HTMp_f9JAK6hX7EXqLiHDgo8KzduZt0Nju6PsLrZ3v1fr8LfwilekEdgZQKlROOpgE810fbRwRd0")' }}
                    ></div>

                    <div className="absolute inset-0 bg-background/60"></div>
                </div>

                <div
                    className="relative z-10  md:w-[40%] w-[90%] bg-surface-container-lowest rounded-xl p-lg flex flex-col items-center"
                    style={{ boxShadow: '0 4px 20px rgba(30, 27, 24, 0.04)' }}
                >

                    <div
                        className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-md text-primary"
                    >
                        <span
                            className="material-symbols-outlined"
                            data-icon="lock_reset"
                            data-weight="fill"
                            style={{ fontSize: "32px" }}
                        >lock_reset</span>
                    </div>

                    <h1
                        className="font-headline-md text-headline-md text-center text-on-surface mb-sm"
                    >
                        Reset Password
                    </h1>
                    <p
                        className="font-body-md text-body-md text-on-surface-variant text-center mb-lg"
                    >
                        Please enter your new password below.
                    </p>

                    <form className="w-full flex flex-col gap-md" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-sm">
                            <label className="font-label-md text-label-md text-on-surface">
                                OTP Code
                            </label>
                            <div
                                className="flex gap-unit justify-between"
                                id="otp-container"
                            >
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRef.current[index] = el;
                                        }} // Assign the input element to the ref array
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-12 h-14 text-center text-headline-sm font-bold border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-surface-container-lowest text-on-surface"
                                    />
                                ))}
                            </div>
                            <div className="flex flex-col items-center gap-xs  w-full">
                                <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                                    <span className="material-symbols-outlined text-[16px]">
                                        schedule
                                    </span>
                                    <span id="countdown" className="text-error">
                                        {Math.floor(timer / 60)}:
                                        {(timer % 60).toString().padStart(2, "0")}
                                    </span>
                                </span>
                                <button
                                    className="font-label-md disabled:opacity-50 disabled:cursor-not-allowed text-label-md transition-colors text-primary hover:underline cursor-pointer"
                                    id="resend-btn"
                                    type="button"
                                    disabled={!resend}
                                    onClick={handleResend}
                                >
                                    Resend Code
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-xs">
                            <label
                                className="font-label-md text-label-md text-on-surface-variant"
                                htmlFor="new-password"
                            >New Password</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    id="new-password"

                                    placeholder="••••••••"
                                    type={showPassword ? "text" : "password"}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3  -translate-y-1/2 top-1/2 text-on-surface-variant hover:text-on-surface transition-all"
                                >
                                    {showPassword ? <Eye /> : <EyeOff />}
                                </button>

                            </div>
                        </div>

                        <div className="flex flex-col gap-xs">
                            <label
                                className="font-label-md text-label-md text-on-surface-variant"
                                htmlFor="confirm-password"
                            >Confirm Password</label>
                            <div className="relative">
                                <input
                                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                                    id="confirm-password"

                                    placeholder="••••••••"
                                    type={showConfirmPassword ? "text" : "password"}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3  -translate-y-1/2 top-1/2 text-on-surface-variant hover:text-on-surface transition-all"
                                >
                                    {showConfirmPassword ? <Eye /> : <EyeOff />}
                                </button>

                            </div>
                            {newPassword && confirmPassword && newPassword !== confirmPassword && (
                                <p className="text-error text-sm mt-1">Passwords do not match.</p>
                            )}
                        </div>

                        <button
                            className="w-full mt-sm bg-primary text-on-primary font-label-md text-label-md rounded-full py-sm hover:scale-[1.02] transition-transform shadow-sm flex items-center justify-center"
                            type="submit"
                        >
                            Reset Password
                        </button>
                    </form>

                    <div className="mt-lg">
                        <p
                            className="font-label-md cursor-pointer text-label-md text-primary  transition-all flex items-center gap-xs"
                            onClick={() => router.replace("/forgot-password")}
                        >
                            <span
                                className="material-symbols-outlined text-sm"
                                data-icon="arrow_back"
                            >arrow_back</span>
                            Change email address
                        </p>
                    </div>
                </div>
            </main>

        </div>
    );
};

const Page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPassword />
        </Suspense>
    );
};

export default Page;
