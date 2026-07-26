"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import ApiResponse from "@/types/ApiResponse";
import Gradient from "../../../../public/Gradient.png";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
const VerifyForm = () => {

    const [timer, setTimer] = useState(60); // 60 seconds (1 minute)
    const canResend = timer === 0;
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";
    const [otp, setOtp] = useState<string[]>(Array(6).fill("")); // Initialize an array of 6 empty strings
    const inputRef = useRef<(HTMLInputElement | null)[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleOtpChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (index < 5 && digit) inputRef.current[index + 1]?.focus();
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
        try {
            const response: ApiResponse = await axios.post("/api/auth/verify-email", {
                email,
                verificationToken: enteredOtp,
            });
            if (!response.data.success) {
                const message = response.data.message ?? "Invalid verification code. Please try again.";
                setError(message);
                toast.error(message);
                return;
            }
            toast.success("Email verified successfully! Redirecting to login...");
            router.replace("/login");
        } catch (err: any) {
            const message = err.response?.data?.message || "Invalid verification code. Please try again.";
            setError(message);
            toast.error(message);
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
    useEffect(() => {
        if (timer === 0) return;
        const id = setInterval(() => setTimer((t) => Math.max(t - 1, 0)), 1000);
        return () => clearInterval(id);
    }, [timer]);
    const handleResend = async () => {
        try {
            const response = await axios.post("/api/auth/resend-verification-code", { email });
            if (response.data.success) {
                setTimer(60);
                setError(null);
                toast.success("Verification code resent successfully.");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Failed to resend verification code. Please try again.");
            } else {
                setError("Failed to resend verification code. Please try again.")
            }
        }
    };

    return (
        <>
            <div
                className="grow flex items-center justify-center relative w-full px-margin-mobile md:px-margin-desktop py-xl"
            >

                <div
                    className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
                    data-alt="A macro, top-down view of scattered flour and rustic whole wheat grains on a smooth, white marble countertop. Warm, diffused morning light streams in from the side, creating soft, long shadows. The color palette is minimal, focusing on creamy whites, soft beiges, and the subtle textures of the raw ingredients. The aesthetic is modern, tactile, and highly culinary."
                    style={{
                        backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDteQnpwy4Ara8zkNP-M5MpUclIfKBpGo-kNSwZScVMjHadEfo8768Xm5N7_tHLOZdmYMfi3kzmEOxHHOaOqLeE-PhCK14MdgLj-v3wtE-_nWPfJYsT5Gl6tH-mr6CRYYJJmDM6nGcOo_A4hqgymeWSvHBitqyYKKvF5Ted31HwRkjXpuejdMw_jnrxJiv7gyoFTj07RAd3K0uPb7MfpvBMSuHPowSAkknNfMUns4lRIUXj-nMd4ajDW7X2l8s10-5KScgKhmEqSqg")`
                    }}
                ></div>

                <div className="absolute inset-0 z-0 bg-background/80 backdrop-blur-xl"></div>

                <div
                    className="relative z-10 w-[90%] md:w-[40%]  bg-surface-container-lowest rounded-xl ambient-shadow p-lg md:p-xl flex flex-col items-center text-center transform transition-all duration-500 hover:-translate-y-1"
                >
                    <div
                        className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-md text-primary"
                    >
                        <span className="material-symbols-outlined text-[32px]"
                        >shield_person</span>
                    </div>
                    <h1 className="font-headline-md text-headline-md text-on-surface mb-sm">
                        Verify Your Email
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
                        Please enter the 6-digit code we sent to your email to confirm your
                        account.
                    </p>

                    <form className="w-full flex flex-col items-center" id="verificationForm">
                        <div className="flex gap-2 md:gap-sm justify-center mb-xl w-full">
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
                                    className="verif-input w-10 h-12 md:w-12 md:h-14 bg-surface rounded-lg border border-outline-variant text-center font-headline-sm text-headline-sm text-on-surface focus:border-primary focus:outline-none transition-all"
                                />
                            ))}

                        </div>
                        <button
                            className="w-full bg-primary text-on-primary font-label-md text-label-md py-4 px-6 rounded-full hover:bg-primary-container hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] mb-md flex items-center justify-center gap-2"
                            type="button"
                            onClick={handleSubmit}
                        >
                            Verify Account
                            <span
                                className="material-symbols-outlined text-[18px]"
                                data-icon="arrow_forward"
                            >arrow_forward</span>
                        </button>
                    </form>
                    <div className="mt-sm font-label-sm text-label-sm text-on-surface-variant">
                        Didn't receive the code?
                        <button
                            disabled={canResend}
                            onClick={handleResend}
                            className="text-primary font-label-md text-label-md hover:underline hover:text-primary-container transition-colors ml-xs"
                        >
                            Resend
                        </button>
                    </div>
                </div>
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
}

const Page = () => {

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyForm />
        </Suspense>
    )
};

export default Page;
