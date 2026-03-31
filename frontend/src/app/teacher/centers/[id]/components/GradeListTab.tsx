"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Edit2Icon, Trash2, BookPlus, Search } from "lucide-react";
import toast from "react-hot-toast";
import {
    CenterGrade,
    deleteCenterGrade,
    getCenterGrades,
} from "@/services/centerService";
import GradeModal from "./GradeModal";
import ConfirmModal from "@/components/ConfirmModal";

interface Props {
    centerId: number;
    isManager: boolean;
}

export default function GradeListTab({ centerId, isManager }: Props) {
    const [grades, setGrades] = useState<CenterGrade[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState("");

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getCenterGrades(centerId);
            setGrades(res);
        } catch (error) {
            console.error(error);
            toast.error("Cannot load grades.");
        } finally {
            setLoading(false);
        }
    }, [centerId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<CenterGrade | null>(null);
    const [deletingGrade, setDeletingGrade] = useState<CenterGrade | null>(null);

    const filteredGrades = useMemo(() => {
        const query = searchName.trim().toLowerCase();
        return grades.filter((grade) => !query || grade.name.toLowerCase().includes(query));
    }, [grades, searchName]);

    const handleDelete = async (grade: CenterGrade) => {
        try {
            await deleteCenterGrade(centerId, grade.id);
            toast.success("Grade deleted.");
            setDeletingGrade(null);
            fetch();
        } catch (error: any) {
            const responseData = error?.response?.data;
            const message =
                responseData?.error ||
                responseData?.message ||
                (typeof responseData === "string" ? responseData : null) ||
                "Could not delete grade.";
            toast.error(message);
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-[var(--color-text)]">Loading grades...</div>;
    }

    return (
        <div className="space-y-4">

            <GradeModal
                centerId={centerId}
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={fetch}
                grade={editingGrade}
            />

            <ConfirmModal
                isOpen={!!deletingGrade}
                title="Delete Grade"
                message={`Delete grade "${deletingGrade?.name || ""}"?`}
                confirmText="Delete"
                onClose={() => setDeletingGrade(null)}
                onConfirm={() => (deletingGrade ? handleDelete(deletingGrade) : undefined)}
            />

            {/* HEADER */}
            <div className="flex items-center justify-between">

                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                    <BookPlus size={18} /> Grades

                </h3>

                {isManager && (
                    <button
                        onClick={() => {
                            setEditingGrade(null);
                            setModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-[var(--color-main)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-secondary)] transition"
                    >
                        <Plus size={16} />
                        Add Grade
                    </button>
                )}

            </div>

            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Search grade by name"
                    className="w-full pl-9 pr-3 py-2 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
                />
            </div>

            {/* EMPTY STATE */}
            {grades.length === 0 ? (
                <div className="p-10 text-center text-gray-500 border rounded-lg">
                    No grades created yet.
                </div>
            ) : filteredGrades.length === 0 ? (
                <div className="p-10 text-center text-gray-500 border rounded-lg bg-white">
                    No grades match your search.
                </div>
            ) : (

                <div className="bg-[var(--color-soft-white)] rounded-xl border border-[var(--color-main)] shadow-sm overflow-hidden">

                    <table className="w-full text-left text-sm">

                        {/* TABLE HEADER */}
                        <thead className="bg-[var(--color-main)] text-white uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Age Range</th>
                                <th className="px-6 py-4">Description</th>
                                {isManager && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>

                        {/* TABLE BODY */}
                        <tbody className="divide-y divide-gray-100">

                            {filteredGrades.map((grade) => (

                                <tr key={grade.id} className="hover:bg-blue-50 transition">

                                    <td className="px-6 py-4 font-semibold text-[var(--color-text)]">
                                        {grade.name}
                                    </td>

                                    <td className="px-6 py-4 text-[var(--color-text)]">
                                        {grade.fromAge != null && grade.toAge != null
                                            ? `${grade.fromAge} – ${grade.toAge}`
                                            : "-"}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {grade.description || "-"}
                                    </td>

                                    {isManager && (
                                        <td className="px-6 py-4 text-right">

                                            <div className="flex justify-end items-center gap-2">

                                                {/* EDIT */}
                                                <button
                                                    onClick={() => {
                                                        setEditingGrade(grade);
                                                        setModalOpen(true);
                                                    }}
                                                    className="p-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-main)] transition"
                                                >
                                                    <Edit2Icon size={18} />
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    onClick={() => setDeletingGrade(grade)}
                                                    className="p-2 bg-[var(--color-alert)] text-white rounded-lg hover:bg-red-700 transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                            </div>

                                        </td>
                                    )}

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}
