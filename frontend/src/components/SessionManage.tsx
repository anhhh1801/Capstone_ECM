"use client";

import { useEffect, useState } from "react";
import { logoutUser } from "@/services/authService";
import { useRouter } from "next/navigation";

const SESSION_TIME = 24 * 60 * 60 * 1000;

export default function SessionManager() {
    const [showModal, setShowModal] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {

            if (window.location.pathname === "/login") return;

            const userStr = localStorage.getItem("loginResponse");
            if (!userStr) return;

            const user = JSON.parse(userStr);

            if (Date.now() - user.loginTime > SESSION_TIME) {
                setShowModal(true);
            }

        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!showModal) return;

        setCountdown(5);

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setShowModal(false);
                    logoutUser();
                    router.push("/login");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [showModal, router]);

    const handleLogout = () => {
        setShowModal(false);
        logoutUser();
        router.push("/login");
    };

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl p-6 w-[350px] text-center">
                <h2 className="text-xl font-bold mb-3">Session Expired</h2>
                <p className="text-gray-600 mb-6">
                    Log out in <span className="font-bold text-[var(--color-alert)]">{countdown}s</span>.
                </p>

                <button
                    onClick={handleLogout}
                    className="border-2 border-[var(--color-alert)] text-[var(--color-alert)] px-4 py-2 rounded-lg hover:bg-[var(--color-alert)] hover:text-white"
                >
                    Logout Now
                </button>
            </div>
        </div>
    );
}