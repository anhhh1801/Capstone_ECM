"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyOtp, resendOtp } from "@/services/authService";
import { CheckCircle, Loader2, Mail, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

type ApiError = {
    response?: {
        data?: string;
    };
};

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // if user already logged in, skip verification
    useEffect(() => {
        const stored = localStorage.getItem("loginResponse");
        if (stored) {
            try {
                const { user } = JSON.parse(stored);
                const roleName = typeof user?.role === "string" ? user.role.toString() : user?.role?.name;
                if (roleName) {
                    if (roleName === "TEACHER") {
                        router.replace("/teacher/dashboard");
                    } else if (roleName === "STUDENT") {
                        router.replace("/student/dashboard");
                    } else if (roleName === "ADMIN") {
                        router.replace("/admin/users");
                    } else {
                        router.replace("/");
                    }
                }
            } catch { }
        }
    }, [router]);

    const email = searchParams.get("email");
    const recipient = searchParams.get("recipient");

    const verificationRecipient = (() => {
        if (recipient && recipient.trim()) {
            return recipient;
        }

        const username = email?.split("@")[0]?.trim();
        return username ? `${username}'s personal email` : "your personal email";
    })();

    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
    const [timer, setTimer] = useState(30);
    const [resending, setResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const redirectTimeoutRef = useRef<number | null>(null);

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

    useEffect(() => {
        if (status !== "success") {
            return;
        }

        toast.success("Verification successful!");
        redirectTimeoutRef.current = window.setTimeout(() => {
            router.replace("/login");
        }, 2000);

        return () => {
            if (redirectTimeoutRef.current !== null) {
                window.clearTimeout(redirectTimeoutRef.current);
                redirectTimeoutRef.current = null;
            }
        };
    }, [status, router]);

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
        } catch (error: unknown) {
            setStatus("idle");
            const msg =
                (error as ApiError).response?.data || "Invalid verification code.";
            toast.error(msg);
        }
    };

    const handleResend = async () => {
        if (timer > 0 || !email || resending) return;

        setResending(true);

        try {
            await resendOtp(email);
            toast.success("A new OTP has been sent!");
            setTimer(30);
            setOtp(new Array(6).fill(""));
            inputRefs.current[0]?.focus();
        } catch (error: unknown) {
            toast.error(
                (error as ApiError).response?.data || "Unable to resend OTP."
            );
        } finally {
            setResending(false);
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
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[var(--color-soft-white)] to-[var(--color-main)]/30 p-4 sm:p-8 lg:p-12">
                <div className="w-full max-w-md rounded-2xl bg-[var(--color-soft-white)]/40 p-6 shadow-xl text-center transition-all hover:shadow-2xl animate-in zoom-in duration-300 sm:p-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <h2 className="header-1">
                        Verification Successful!
                    </h2>
                    <p className="mt-2 text-sm text-[var(--color-text)]">
                        Your account has been activated.
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text)]/70">
                        Redirecting to login page...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[var(--color-soft-white)] to-[var(--color-main)]/30 p-4 sm:p-8 lg:p-12">
            <div className="w-full max-w-md rounded-2xl bg-[var(--color-soft-white)]/40 p-6 shadow-xl transition-all hover:shadow-2xl sm:p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-main)] text-white">
                        <Mail size={32} />
                    </div>
                    <h2 className="header-1">Account Verification</h2>

                    <p className="mb-1 block text-sm font-medium text-[var(--color-text)]">
                        A <span className="font-bold text-[var(--color-alert)]">6-digit OTP</span> code has been sent to
                        <br />
                        <span className="font-bold text-lg text-[var(--color-main)]">
                            {verificationRecipient}
                        </span>
                    </p>
                </div>

                <div className="mb-8 grid grid-cols-6 gap-2 sm:flex sm:justify-between">
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
                            className="h-12 w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] text-center text-xl font-bold text-[var(--color-text)] outline-none transition focus:border-[var(--color-alert)] focus:ring-2 focus:ring-[var(--color-secondary)] sm:h-14 sm:w-12 sm:text-2xl"
                        />
                    ))}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={
                        status === "loading" || otp.some((d) => !d)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-main)] px-5 py-3 font-medium text-white transition hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] disabled:cursor-not-allowed disabled:opacity-50"
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
                        {resending ? (
                            <span className="inline-flex items-center gap-1 font-medium text-[var(--color-main)]">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                Sending...
                            </span>
                        ) : timer > 0 ? (
                            <span className="text-[var(--color-alert)] font-medium">
                                Resend in {timer}s
                            </span>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="inline-flex items-center gap-1 font-bold text-[var(--color-main)] hover:underline"
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
                <div className="flex min-h-screen items-center justify-center p-4">
                    Loading...
                </div>
            }
        >
            <VerifyContent />
        </Suspense>
    );
}