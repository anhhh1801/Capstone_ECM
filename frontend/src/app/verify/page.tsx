"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyOtp, resendOtp } from "@/services/authService";
import { CheckCircle, Loader2, Mail, ArrowRight, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast"; // Assuming you use toast, or remove if not

function VerifyContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Get email from URL (e.g. /verify?email=abc@gmail.com)
    const email = searchParams.get("email");

    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
    const [timer, setTimer] = useState(30); // 30s countdown for resend
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown Logic
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Focus first input on load
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    // Handle Input Change
    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return; // Only allow numbers

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1); // Take last char
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle Backspace
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    // SUBMIT OTP
    const handleVerify = async () => {
        const code = otp.join("");
        if (code.length !== 6) {
            toast.error("Vui lòng nhập đủ 6 số!");
            return;
        }

        if (!email) {
            toast.error("Thiếu thông tin email!");
            return;
        }

        setStatus("loading");
        try {
            await verifyOtp(email, code);
            setStatus("success");
            toast.success("Xác thực thành công!");

            // Redirect to login after 2s
            setTimeout(() => router.push("/login"), 2000);
        } catch (error: any) {
            setStatus("idle");
            const msg = error.response?.data || "Mã xác thực không đúng.";
            toast.error(msg);
        }
    };

    // RESEND OTP
    const handleResend = async () => {
        if (timer > 0) return;
        if (!email) return;

        try {
            await resendOtp(email);
            toast.success("Đã gửi lại mã OTP mới!");
            setTimer(30); // Reset timer
            setOtp(new Array(6).fill("")); // Clear inputs
            inputRefs.current[0]?.focus(); // Focus start
        } catch (error: any) {
            toast.error(error.response?.data || "Không thể gửi lại mã.");
        }
    };

    // --- RENDER SUCCESS STATE ---
    if (status === "success") {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center animate-in zoom-in duration-300">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Xác thực thành công!</h2>
                    <p className="text-gray-500 mt-2">Tài khoản của bạn đã được kích hoạt.</p>
                    <p className="text-sm text-gray-400 mt-1">Đang chuyển hướng đến trang đăng nhập...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Xác thực tài khoản</h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        Mã OTP gồm 6 số đã được gửi đến: <br />
                        <span className="font-semibold text-gray-800">{email || "Email không xác định"}</span>
                    </p>
                </div>

                <div className="flex justify-between gap-2 mb-8">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                    ))}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={status === "loading" || otp.some(d => !d)}
                    className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {status === "loading" ? (
                        <>
                            <Loader2 className="animate-spin h-5 w-5" /> Đang xác thực...
                        </>
                    ) : (
                        <>
                            Xác nhận <ArrowRight className="h-5 w-5" />
                        </>
                    )}
                </button>

                <div className="mt-6 text-center text-sm">
                    <p className="text-gray-500">
                        Chưa nhận được mã?{" "}
                        {timer > 0 ? (
                            <span className="text-gray-400 font-medium">
                                Gửi lại sau {timer}s
                            </span>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                            >
                                <RefreshCcw className="h-3 w-3" /> Gửi lại mã
                            </button>
                        )}
                    </p>
                </div>

                <div className="mt-4 text-center">
                    <Link href="/login" className="text-sm text-gray-400 hover:text-gray-600">
                        Quay lại đăng nhập
                    </Link>
                </div>

            </div>
        </div>
    );
}

// Wrapper for Suspense (Next.js requirement)
export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}