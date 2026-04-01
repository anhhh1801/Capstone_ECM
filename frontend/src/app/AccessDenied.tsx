"use client";

import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { getRoleName } from "@/utils/auth";

export default function UnauthorizedPage() {
    const router = useRouter();

    const handleGoBack = () => {
        const userRaw = localStorage.getItem("user");
        if (userRaw) {
            const user = JSON.parse(userRaw);
            const roleName = getRoleName(user.role);
            // Route them back to their proper dashboard
            if (roleName === "STUDENT") router.replace("/student/courses");
            else if (roleName === "TEACHER" || roleName === "MANAGER") router.replace("/teacher/dashboard");
            else if (roleName === "ADMIN") router.replace("/admin/users");
            else router.replace("/login");
        } else {
            router.replace("/login");
        }
    };

    return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-gray-50">
            <ShieldAlert size={80} className="text-red-500 mb-6" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-500 mb-8 text-center max-w-md">
                You do not have the necessary permissions to view this page or perform this action.
            </p>
            <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-[var(--color-main)] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
            >
                Return to Dashboard
            </button>
        </div>
    );
}