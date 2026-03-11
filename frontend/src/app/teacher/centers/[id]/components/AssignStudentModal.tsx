"use client";

import { useState } from "react";
import { X, Search, UserPlus } from "lucide-react";
import api from "@/utils/axiosConfig";
import toast from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    centerId: number;
    onSuccess: () => void;
}

export default function AssignStudentModal({
    isOpen,
    onClose,
    centerId,
    onSuccess
}: Props) {

    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    if (!isOpen) return null;

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setSearching(true);

        try {

            // Example API (replace with real one)
            // const res = await api.get(`/users/search?q=${searchTerm}&role=STUDENT`);
            // setResults(res.data);

            // Mock data
            setResults([
                {
                    id: 99,
                    firstName: "Test",
                    lastName: "User",
                    email: searchTerm,
                    phoneNumber: "0999"
                }
            ]);

        } catch (e) {
            toast.error("Student not found.");
        } finally {
            setSearching(false);
        }
    };

    const handleAssign = async (studentId: number) => {
        try {

            await api.post(`/centers/${centerId}/assign-student?studentId=${studentId}`);

            toast.success("Student added to center!");

            onSuccess();
            onClose();

        } catch (error) {
            toast.error("This student may already belong to the center.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center border-b pb-3">

                    <h2 className="text-lg font-bold text-[var(--color-text)] flex items-center gap-2">
                        <Search size={18} />
                        Find Student
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* Search */}
                <div className="flex gap-2">

                    <input
                        type="text"
                        placeholder="Enter exact Email or Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white focus:ring-2 focus:ring-[var(--color-secondary)]"
                    />

                    <button
                        onClick={handleSearch}
                        className="bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white px-4 rounded-lg hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition flex items-center justify-center"
                    >
                        <Search size={18} />
                    </button>

                </div>

                {/* Results */}
                <div className="space-y-3">

                    {results.map((u) => (

                        <div
                            key={u.id}
                            className="flex justify-between items-center p-3 rounded-lg border-2 border-[var(--color-main)]/30 bg-[var(--color-soft-white)]"
                        >

                            <div className="text-sm">

                                <p className="font-bold text-[var(--color-text)]">
                                    {u.lastName} {u.firstName}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {u.email}
                                </p>

                            </div>

                            <button
                                onClick={() => handleAssign(u.id)}
                                className="flex items-center gap-1 bg-[var(--color-secondary)] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[var(--color-main)] transition"
                            >
                                <UserPlus size={16} />
                                Add
                            </button>

                        </div>

                    ))}

                    {results.length === 0 && !searching && (
                        <p className="text-center text-gray-400 text-sm py-4">
                            Enter email or phone to search students.
                        </p>
                    )}

                    {searching && (
                        <p className="text-center text-sm text-gray-400">
                            Searching...
                        </p>
                    )}

                </div>

            </div>

        </div>
    );
}