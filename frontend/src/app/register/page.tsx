"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerTeacher, resendOtp } from "@/services/authService";
import toast, { Toaster } from "react-hot-toast";
import { UserPlus, Mail, Phone, User } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        personalEmail: "",
        phoneNumber: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await registerTeacher(formData);

            toast.success("Mã OTP đã được gửi!", { duration: 4000 });
            router.push(`/verify?email=${encodeURIComponent(formData.personalEmail)}`);

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data || "Đăng ký thất bại. Vui lòng thử lại.";
            if (typeof msg === 'string' && msg.includes("PENDING_VERIFICATION")) {
                toast((t) => (
                    <div className="flex flex-col gap-2">
                        <span className="font-semibold text-gray-800">
                            Email này đang chờ xác thực!
                        </span>
                        <button
                            onClick={async () => {
                                toast.dismiss(t.id);
                                await handleResendOld(formData.personalEmail);
                            }}
                            className="bg-blue-600 text-white text-xs py-1 px-3 rounded hover:bg-blue-700"
                        >
                            Gửi lại mã OTP & Xác thực ngay
                        </button>
                    </div>
                ), { duration: 6000, icon: '⚠️' });
            } else {
                toast.error("Email used!!");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOld = async (email: string) => {
        try {
            await resendOtp(email);
            toast.success("Đã gửi lại OTP!");
            router.push(`/verify?email=${encodeURIComponent(email)}`);
        } catch (e) {
            toast.error("Không thể gửi lại mã.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />

            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <UserPlus size={32} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Đăng ký Giáo viên
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Tạo tài khoản để quản lý trung tâm của bạn
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        {/* Họ và Tên (2 cột) */}
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label htmlFor="firstName" className="sr-only">Họ</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                        <User size={18} />
                                    </div>
                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Họ (Ví dụ: Tran)"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="w-1/2">
                                <label htmlFor="lastName" className="sr-only">Tên</label>
                                <div className="relative">
                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        required
                                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-4 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Tên (Ví dụ: Ba)"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="personalEmail" className="sr-only">Email cá nhân</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="personalEmail"
                                    name="personalEmail"
                                    type="email"
                                    required
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Email cá nhân (Gmail...)"
                                    value={formData.personalEmail}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phoneNumber" className="sr-only">Số điện thoại</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <Phone size={18} />
                                </div>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    required
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    placeholder="Số điện thoại"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative flex w-full justify-center rounded-lg border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${loading ? "cursor-not-allowed opacity-70" : ""
                                }`}
                        >
                            {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Đã có tài khoản? </span>
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Đăng nhập tại đây
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}