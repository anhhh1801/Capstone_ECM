"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ConfirmModal";
import {
    getAllUsers,
    toggleUserLock,
    getUserStats,
} from "@/services/adminService";
import { AlertTriangle, ChartColumnDecreasingIcon, Lock, LockOpen } from "lucide-react";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: { name: string };
    enabled: boolean;
    locked: boolean;
}

interface UserStats {
    totalCenters: number;
    totalCourses: number;
    totalStudents: number;
}

interface StoredUser {
    id: number;
    role?: string | { name?: string };
}

const UserManagement = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [lockConfirmUser, setLockConfirmUser] = useState<User | null>(null);
    const [currentAdminId, setCurrentAdminId] = useState(0);
    const [errorModal, setErrorModal] = useState<{ title: string; message: string } | null>(null);

    const getRoleName = (role?: StoredUser["role"]) => {
        if (!role) {
            return "";
        }

        return typeof role === "string" ? role : role.name || "";
    };

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        const userStr = localStorage.getItem("user");

        if (!userStr) {
            router.replace("/login");
            return;
        }

        try {
            const storedUser: StoredUser = JSON.parse(userStr);
            const roleName = getRoleName(storedUser.role);

            if (roleName !== "ADMIN") {
                router.replace("/AccessDenied");
                return;
            }

            setCurrentAdminId(storedUser.id || 0);
            setIsAuthorized(true);
            loadUsers();
        } catch (error) {
            console.error("Invalid user session", error);
            localStorage.removeItem("user");
            localStorage.removeItem("loginResponse");
            router.replace("/login");
        }
    }, [router]);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
            setErrorModal({
                title: "Unable to Load Users",
                message: "The admin user list could not be loaded. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLock = (user: User) => {
        setLockConfirmUser(user);
    };

    const confirmToggleLock = async () => {
        if (!lockConfirmUser || !currentAdminId) return;

        try {
            await toggleUserLock(currentAdminId, lockConfirmUser.id);

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === lockConfirmUser.id
                        ? { ...u, locked: !u.locked }
                        : u
                )
            );

            setLockConfirmUser(null);
        } catch (error) {
            console.error("Failed to change lock status", error);
            setErrorModal({
                title: "Update Failed",
                message: "The user lock status could not be changed. Please try again.",
            });
        }
    };

    const handleViewStats = async (user: User) => {
        try {
            setSelectedUser(user);
            setStats(null);
            const data = await getUserStats(currentAdminId, user.id);
            setStats(data);
        } catch (error) {
            console.error("Could not fetch stats", error);
            setSelectedUser(null);
            setErrorModal({
                title: "Unable to Load Statistics",
                message: "The selected user's statistics could not be retrieved right now.",
            });
        }
    };

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--color-soft-white)] p-6 text-[var(--color-text)]">
                <div className="text-sm font-medium">Checking admin access...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[var(--color-soft-white)] min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-[var(--color-text)]">
                Admin User Management
            </h1>

            {/* USER TABLE */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-[var(--color-secondary)] text-[var(--color-text)] font-bold uppercase">
                            <th className="px-5 py-3 border-b-2 text-left text-xs">
                                Name
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs">
                                Email
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs">
                                Role
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs">
                                Status
                            </th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-100">
                                <td className="px-5 py-5 border-b text-sm font-medium">
                                    {user.firstName} {user.lastName}
                                </td>

                                <td className="px-5 py-5 border-b text-sm">
                                    {user.email}
                                </td>

                                <td className="px-5 py-5 border-b text-sm">
                                    <span
                                        className={`px-2 inline-flex text-xs font-semibold rounded-full 
                    ${user.role.name === "ADMIN"
                                                ? "bg-purple-100 text-purple-800"
                                                : user.role.name === "TEACHER"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-green-100 text-green-800"
                                            }`}
                                    >
                                        {user.role.name}
                                    </span>
                                </td>

                                <td className="px-5 py-5 border-b text-sm">
                                    {user.locked ? (
                                        <span className="text-red-600 font-bold">
                                            Locked
                                        </span>
                                    ) : (
                                        <span className="text-green-600 font-bold">
                                            Active
                                        </span>
                                    )}
                                </td>

                                <td className="px-5 py-5 border-b text-sm space-x-2">
                                    <button
                                        onClick={() => handleToggleLock(user)}
                                        className={`group relative p-2 rounded text-[var(--color-soft-white)] transition-all duration-200
        ${user.locked
                                                ? "bg-[var(--color-negative)] hover:bg-[var(--color-positive)]"
                                                : "bg-[var(--color-positive)] hover:bg-[var(--color-negative)]"
                                            }`}
                                    >
                                        {/* Current State Icon */}
                                        <span className="transition-opacity duration-200 group-hover:opacity-0">
                                            {user.locked ? (
                                                <Lock size={26} />
                                            ) : (
                                                <LockOpen size={26} />
                                            )}
                                        </span>

                                        {/* Hover Icon */}
                                        <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                            {user.locked ? (
                                                <LockOpen size={26} />
                                            ) : (
                                                <Lock size={26} />
                                            )}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => handleViewStats(user)}
                                        className="p-2 bg-[var(--color-main)] text-white rounded text-xs hover:bg-blue-600"
                                        title="View user statistics"
                                    >
                                        <ChartColumnDecreasingIcon size={26} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* STATS MODAL */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-[var(--color-text)]">
                    <div
                        className="bg-white p-6 rounded-lg shadow-xl w-96 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedUser(null)}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
                        >
                            &times;
                        </button>

                        <h3 className="text-xl font-bold mb-4">
                            Stats for {selectedUser.firstName}
                        </h3>

                        {stats ? (
                            <div className="space-y-4">
                                <div className="flex justify-between border-b pb-2">
                                    <span>Centers Managed:</span>
                                    <span className="font-bold">
                                        {stats.totalCenters}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Courses Taught:</span>
                                    <span className="font-bold">
                                        {stats.totalCourses}
                                    </span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Total Students:</span>
                                    <span className="font-bold">
                                        {stats.totalStudents}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">
                                Loading data...
                            </p>
                        )}

                        <div className="mt-6 text-right">
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!lockConfirmUser}
                title={lockConfirmUser ? `Confirm ${lockConfirmUser.locked ? "Unlock" : "Lock"}` : "Confirm Action"}
                message={lockConfirmUser
                    ? `Are you sure you want to ${lockConfirmUser.locked ? "unlock" : "lock"} ${lockConfirmUser.firstName} ${lockConfirmUser.lastName}?`
                    : ""
                }
                confirmText={lockConfirmUser?.locked ? "Unlock" : "Lock"}
                cancelText="Cancel"
                onConfirm={confirmToggleLock}
                onClose={() => setLockConfirmUser(null)}
            />

            {errorModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-4">
                    <div className="w-full max-w-md rounded-xl border border-red-200 bg-white shadow-xl">
                        <div className="flex items-center gap-3 border-b border-red-100 px-5 py-4">
                            <div className="rounded-full bg-red-100 p-2 text-red-600">
                                <AlertTriangle size={20} />
                            </div>
                            <h4 className="text-lg font-bold text-[var(--color-text)]">{errorModal.title}</h4>
                        </div>

                        <div className="px-5 py-4">
                            <p className="text-sm leading-relaxed text-[var(--color-text)]">{errorModal.message}</p>
                        </div>

                        <div className="flex justify-end px-5 pb-5">
                            <button
                                type="button"
                                onClick={() => setErrorModal(null)}
                                className="rounded-lg border border-red-500 bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-red-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;