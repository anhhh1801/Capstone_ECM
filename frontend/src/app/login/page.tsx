"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/services/authService";
import toast, { Toaster } from "react-hot-toast";
import { User, Lock, Mail } from "lucide-react";
import LockedAccountModal from '@/components/LockedAccountModal';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [showLockedModal, setShowLockedModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = await loginUser(email, password);

            toast.success(`Hello ${user.firstName} ${user.lastName}!`);

            localStorage.setItem("user", JSON.stringify(user));

            setTimeout(() => {
                if (user.role.name === "TEACHER") {
                    router.push("/teacher/dashboard");
                }
                else if (user.role.name === "STUDENT") {
                    router.push("/student/dashboard");
                } else if (user.role.name === "ADMIN") {
                    router.push("/admin/users");
                }
                else {
                    router.push("/");
                }
            }, 1000);

        } catch (error: any) {
            console.error("Login Error:", error);
            const msg = error.response?.data || "Login Failed! Please check again.";

            if (typeof msg === 'string' && msg.includes("ACCOUNT_DEACTIVATED")) {
                toast((t) => (
                    <div>
                        <p className="font-bold">Tài khoản đang tạm khóa/chưa xác thực.</p>
                        <p className="text-sm">Hệ thống đã gửi OTP mới vào email cá nhân của bạn.</p>
                    </div>
                ), { duration: 5000, icon: '🔄' });

                setTimeout(() => {
                    router.push(`/verify?email=${encodeURIComponent(email)}`);
                }, 2000);
            }

            else if (typeof msg === 'string' && msg.includes("locked")) {
                setShowLockedModal(true);
            }
            else if (typeof msg === 'string' && msg.includes("PENDING_VERIFICATION")) {
                router.push(`/verify?email=${encodeURIComponent(email)}`);
            } else {
                setErrorMessage(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <Toaster position="top-center" />

            <LockedAccountModal
                isOpen={showLockedModal}
                onClose={() => setShowLockedModal(false)}
            />

            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl transition-all hover:shadow-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800">Đăng Nhập</h2>
                    <p className="text-gray-500 mt-2">Chào mừng quay trở lại ECM</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Input Email */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                placeholder="name@ecm.edu.vn"
                            />
                        </div>
                    </div>

                    {/* Input Password */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Button Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded-lg bg-indigo-600 px-5 py-3 text-center text-base font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition ${loading ? "cursor-not-allowed opacity-70" : ""
                            }`}
                    >
                        {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Chưa có tài khoản?{" "}
                    <a href={`/register`} className="font-semibold text-indigo-600 hover:underline">
                        Đăng kí ngay
                    </a>
                </p>
            </div>
        </div>
    );
}