"use client";

import { useState, useEffect } from "react";
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

    // redirect away if already logged in
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
            } catch (_) { }
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const loginResponse = await loginUser(email, password);
            localStorage.setItem("loginResponse", JSON.stringify({ ...loginResponse, loginTime: Date.now() }));

            const user = loginResponse.user;
            const roleName = typeof user?.role === "string" ? user.role.toString() : user?.role?.name;

            toast.success(`Hello ${user.firstName} ${user.lastName}!`);

            localStorage.setItem("user", JSON.stringify(user));

            setTimeout(() => {
                if (user.role.toString() === "TEACHER") {
                    router.push("/teacher/dashboard");
                }
                else if (user.role.toString() === "STUDENT") {
                    router.push("/student/dashboard");
                } else if (user.role.toString() === "ADMIN") {
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
                        <p className="font-bold">Your account is temporarily locked / unverified.</p>
                        <p className="text-sm">A new OTP has been sent to your email address.</p>
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
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[var(--color-soft-white)] to-[var(--color-main)]/30 px-4">
            <Toaster position="top-center" />

            <LockedAccountModal
                isOpen={showLockedModal}
                onClose={() => setShowLockedModal(false)}
            />

            <div className="w-full max-w-md rounded-2xl bg-[var(--color-secondary)]/40 p-8 shadow-xl transition-all hover:shadow-2xl">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-main)] text-white">
                        <Lock size={32} />
                    </div>
                    <h2 className="header-1">Sign In to ECM</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Input Email */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Email</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text)]">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-3 pl-10 text-[var(--color-text)] outline-none focus:border-[var(--color-alert)] focus:ring-2 focus:ring-blue-200 transition"
                                placeholder="name@ecm.edu.vn"
                            />
                        </div>
                    </div>

                    {/* Input Password */}
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[var(--color-text)]">Password</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--color-text)]">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-3 pl-10 text-[var(--color-text)] outline-none focus:border-[var(--color-alert)] focus:ring-2 focus:ring-blue-200 transition"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Button Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full rounded-lg bg-[var(--color-main)] border-2 border-[var(--color-main)] px-5 py-3 text-center text-base font-medium text-white hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] hover:border-2 hover:border-[var(--color-main)] focus:ring-4 focus:ring-[var(--color-secondary)] transition ${loading ? "cursor-not-allowed opacity-70" : ""
                            }`}
                    >
                        {loading ? "Handling..." : "Continue"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Don't have an account ?{" "}
                    <a href={`/register`} className="font-semibold text-[var(--color-main)] underline hover:text-[var(--color-alert)]">
                        Go to register
                    </a>
                </p>
            </div>
        </div>
    );
}