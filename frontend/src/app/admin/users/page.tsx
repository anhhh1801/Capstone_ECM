"use client";
import React, { useEffect, useState } from 'react';
import { getAllUsers, toggleUserLock, getUserStats } from '@/services/adminService';

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

    // MOCK ADMIN ID (In real app, get this from localStorage or Context)
    const userStr = localStorage.getItem("user");
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

    const handleToggleLock = async (user: User) => {
        if (!window.confirm(`Are you sure you want to ${user.locked ? 'UNLOCK' : 'LOCK'} this user?`)) return;

        try {
            await toggleUserLock(CURRENT_ADMIN_ID, user.id);
            setUsers(users.map(u => u.id === user.id ? { ...u, locked: !u.locked } : u));
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
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Admin User Management</h1>

            {/* USER TABLE */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="bg-blue-600 text-white">
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-100">
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                    <div className="flex items-center">
                                        <div className="ml-3">
                                            <p className="text-gray-900 whitespace-no-wrap font-medium">
                                                {user.firstName} {user.lastName}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                    <p className="text-gray-900 whitespace-no-wrap">{user.email}</p>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.role.name === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            user.role.name === 'TEACHER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role.name}
                                    </span>
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                    {user.locked ? (
                                        <span className="text-red-600 font-bold flex items-center">
                                            🔒 Locked
                                        </span>
                                    ) : (
                                        <span className="text-green-600 font-bold">
                                            Active
                                        </span>
                                    )}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 text-sm space-x-2">
                                    <button
                                        onClick={() => handleToggleLock(user)}
                                        className={`px-3 py-1 rounded text-white text-xs ${user.locked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                                    >
                                        {user.locked ? 'Unlock' : 'Lock'}
                                    </button>

                                    <button
                                        onClick={() => handleViewStats(user)}
                                        className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                                    >
                                        View Stats
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* STATS MODAL (Simple Popup) */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96 relative">
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
                                    <span className="font-bold">{stats.totalCenters}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Courses Taught:</span>
                                    <span className="font-bold">{stats.totalCourses}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span>Total Students:</span>
                                    <span className="font-bold">{stats.totalStudents}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">Loading data...</p>
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
        </div>
    );
};

export default UserManagement;