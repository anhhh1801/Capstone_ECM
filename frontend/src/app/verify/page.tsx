"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { verifyAccount } from "@/services/authService";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

// Tách logic ra component con để dùng được Suspense (yêu cầu của Next.js)
function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const router = useRouter();

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Đang xác thực tài khoản...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Link không hợp lệ!");
            return;
        }

        // Gọi API xác thực
        const verify = async () => {
            try {
                const result = await verifyAccount(token);
                setStatus("success");
                setMessage("Xác thực thành công! Đang chuyển hướng...");

                // Sau 3 giây chuyển về trang Login
                setTimeout(() => {
                    router.push("/login");
                }, 3000);

            } catch (error: any) {
                setStatus("error");
                setMessage(error.response?.data || "Link xác thực đã hết hạn hoặc không đúng.");
            }
        };

        verify();
    }, [token, router]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">

                {/* TRẠNG THÁI LOADING */}
                {status === "loading" && (
                    <div className="flex flex-col items-center">
                        <Loader2 className="h-16 w-16 animate-spin text-blue-500 mb-4" />
                        <h2 className="text-xl font-bold text-gray-700">Đang xử lý...</h2>
                        <p className="text-gray-500 mt-2">{message}</p>
                    </div>
                )}

                {/* TRẠNG THÁI THÀNH CÔNG */}
                {status === "success" && (
                    <div className="flex flex-col items-center animate-in zoom-in duration-300">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <h2 className="text-xl font-bold text-green-600">Thành Công!</h2>
                        <p className="text-gray-600 mt-2 mb-6">Tài khoản của bạn đã được kích hoạt.</p>
                        <p className="text-sm text-gray-400">Vui lòng kiểm tra email để lấy mật khẩu đăng nhập.</p>
                        <div className="mt-4">
                            <Link href="/login" className="text-blue-600 font-medium hover:underline">
                                Đến trang đăng nhập ngay
                            </Link>
                        </div>
                    </div>
                )}

                {/* TRẠNG THÁI LỖI */}
                {status === "error" && (
                    <div className="flex flex-col items-center animate-in shake duration-300">
                        <XCircle className="h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-red-600">Xác thực thất bại</h2>
                        <p className="text-gray-600 mt-2 mb-6">{message}</p>
                        <Link
                            href="/register"
                            className="rounded-lg bg-gray-800 px-4 py-2 text-white hover:bg-gray-900 transition"
                        >
                            Đăng ký lại
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}

// Trang chính phải bọc Suspense để tránh lỗi build
export default function VerifyPage() {
    return (
        <Suspense fallback={<div className="text-center p-10">Loading page...</div>}>
            <VerifyContent />
        </Suspense>
    );
}