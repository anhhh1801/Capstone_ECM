"use client";
import React, { useEffect, useState } from "react";
import {
    getAllUsers,
    toggleUserLock,
    getUserStats,
} from "@/services/adminService";
import { ChartColumnDecreasingIcon, Lock, LockIcon, LockOpen } from "lucide-react";

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

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [lockConfirmUser, setLockConfirmUser] = useState<User | null>(null);

    const userStr =
        typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    const CURRENT_ADMIN_ID = user ? user.id : 0;

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLock = (user: User) => {
        setLockConfirmUser(user);
    };

    const confirmToggleLock = async () => {
        if (!lockConfirmUser) return;

        try {
            await toggleUserLock(CURRENT_ADMIN_ID, lockConfirmUser.id);

            setUsers((prev) =>
                prev.map((u) =>
                    u.id === lockConfirmUser.id
                        ? { ...u, locked: !u.locked }
                        : u
                )
            );

            setLockConfirmUser(null);
        } catch (error) {
            alert("Failed to change lock status");
        }
    };

    const handleViewStats = async (user: User) => {
        try {
            setSelectedUser(user);
            setStats(null);
            const data = await getUserStats(CURRENT_ADMIN_ID, user.id);
            setStats(data);
        } catch (error) {
            console.error("Could not fetch stats");
        }
    };

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

            {/* LOCK CONFIRM MODAL */}
            {lockConfirmUser && (
                <div
                    className="fixed inset-0 bg-[var(--color-main)]/20 flex items-center justify-center z-50"
                    onClick={() => setLockConfirmUser(null)}
                >
                    <div
                        className="bg-white rounded-xl p-6 w-80 shadow-xl text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">
                            Confirm {lockConfirmUser.locked ? "Unlock" : "Lock"}
                        </h3>

                        <p className="mb-6 text-[var(--color-text)]">
                            Are you sure you want to{" "}
                            <span className="font-bold">
                                {lockConfirmUser.locked ? "UNLOCK" : "LOCK"}
                            </span>{" "}
                            user:
                            <br />
                            <span className="font-semibold">
                                {lockConfirmUser.firstName}{" "}
                                {lockConfirmUser.lastName}
                            </span>
                            ?
                        </p>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setLockConfirmUser(null)}
                                className="px-4 py-1 font-bold rounded-lg border-2 border-[var(--color-main)] text-[var(--color-soft-white)] bg-[var(--color-main)] hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmToggleLock}
                                className="px-4 py-1 font-bold rounded-lg border-2 border-[var(--color-alert)] text-[var(--color-alert)] bg-[var(--color-soft-white)] hover:bg-[var(--color-alert)] hover:text-[var(--color-soft-white)] transition"
                            >
                                {lockConfirmUser.locked ? "Unlock" : "Lock"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;