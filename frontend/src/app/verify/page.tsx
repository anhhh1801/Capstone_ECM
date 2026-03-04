"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyOtp, resendOtp } from "@/services/authService";
import { CheckCircle, Loader2, Mail, ArrowRight, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const email = searchParams.get("email");

    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
    const [timer, setTimer] = useState(30);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Focus first input
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const code = otp.join("");

        if (code.length !== 6) {
            toast.error("Please enter all 6 digits.");
            return;
        }

        if (!email) {
            toast.error("Missing email information.");
            return;
        }

        setStatus("loading");

        try {
            await verifyOtp(email, code);
            setStatus("success");
            toast.success("Verification successful!");

            setTimeout(() => router.push("/login"), 2000);
        } catch (error: any) {
            setStatus("idle");
            const msg =
                error.response?.data || "Invalid verification code.";
            toast.error(msg);
        }
    };

    const handleResend = async () => {
        if (timer > 0 || !email) return;

        try {
            await resendOtp(email);
            toast.success("A new OTP has been sent!");
            setTimer(30);
            setOtp(new Array(6).fill(""));
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            toast.error(
                error.response?.data || "Unable to resend OTP."
            );
        }
    };
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();

        const pastedData = e.clipboardData.getData("text").trim();

        if (!/^\d+$/.test(pastedData)) return; // only numbers

        const pastedArray = pastedData.slice(0, 6).split("");

        const newOtp = [...otp];

        pastedArray.forEach((char, index) => {
            newOtp[index] = char;
        });

        setOtp(newOtp);

        // focus last filled input
        const lastIndex = pastedArray.length - 1;
        inputRefs.current[lastIndex]?.focus();
    };

    // Success Screen
    if (status === "success") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center animate-in zoom-in duration-300">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">
                        Verification Successful!
                    </h2>
                    <p className="text-gray-500 mt-2">
                        Your account has been activated.
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                        Redirecting to login page...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[var(--color-soft-white)] to-[var(--color-main)]/30 px-4">
            <div className="w-full max-w-md rounded-2xl bg-[var(--color-secondary)]/40 p-8 shadow-xl transition-all hover:shadow-2xl">
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-main)] text-white">
                        <Mail size={32} />
                    </div>
                    <h2 className="header-1">Account Verification</h2>

                    <p className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                        A <span className="font-bold text-[var(--color-alert)]">6-digit OTP</span> code has been sent to:
                        <br />
                        <span className="font-bold text-lg text-[var(--color-main)]">
                            {email || "Email not provided"}
                        </span>
                    </p>
                </div>

                <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputRefs.current[index] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) =>
                                handleChange(index, e.target.value)
                            }
                            onKeyDown={(e) =>
                                handleKeyDown(index, e)
                            }
                            onPaste={handlePaste}
                            placeholder="-"
                            aria-label={`OTP digit ${index + 1}`}
                            className="w-12 h-14 text-center text-2xl font-bold text-[var(--color-text)] border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] rounded-lg focus:border-[var(--color-alert)] focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                    ))}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={
                        status === "loading" || otp.some((d) => !d)
                    }
                    className="w-full bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white py-3 rounded-xl font-semibold hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] hover:border-[var(--color-main)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {status === "loading" ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5" />
                            Verifying...
                        </>
                    ) : (
                        <>
                            Confirm
                        </>
                    )}
                </button>

                <div className="mt-6 text-center">
                    <p className="text-[var(--color-text)]">
                        Didn’t receive the code?{" "}
                        {timer > 0 ? (
                            <span className="text-[var(--color-alert)] font-medium">
                                Resend in {timer}s
                            </span>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="text-[var(--color-main)] font-bold hover:underline inline-flex items-center gap-1"
                            >
                                <RefreshCcw className="h-3 w-3" />
                                Resend Code
                            </button>
                        )}
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <Link
                        href="/login"
                        className="text-sm text-[var(--color-alert)] hover:underline"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center">
                    Loading...
                </div>
            }
        >
            <VerifyContent />
        </Suspense>
    );
}