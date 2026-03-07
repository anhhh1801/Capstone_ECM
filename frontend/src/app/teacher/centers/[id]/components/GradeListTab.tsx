"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2Icon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
    CenterGrade,
    createCenterGrade,
    deleteCenterGrade,
    getCenterGrades,
    updateCenterGrade,
} from "@/services/centerService";
import GradeModal from "./GradeModal";

interface Props {
    centerId: number;
    isManager: boolean;
}

export default function GradeListTab({ centerId, isManager }: Props) {
    const [grades, setGrades] = useState<CenterGrade[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
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
    };

    useEffect(() => {
        fetch();
    }, [centerId]);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState<CenterGrade | null>(null);

    const handleDelete = async (grade: CenterGrade) => {
        if (!confirm(`Delete grade "${grade.name}"?`)) return;

        try {
            await deleteCenterGrade(centerId, grade.id);
            toast.success("Grade deleted.");
            fetch();
        } catch (error) {
            console.error(error);
            toast.error("Could not delete grade.");
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
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                    <Plus size={18} className="text-[var(--color-main)]" />
                    Grades
                </h3>

                {isManager && (
                    <button
                        onClick={() => {
                            setEditingGrade(null);
                            setModalOpen(true);
                        }}
                    >
                        Add Grade
                    </button>
                )}
            </div>

            {grades.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No grades created yet.</div>
            ) : (
                <div className="bg-[var(--color-soft-white)] rounded-xl border border-[var(--color-main)] shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--color-main)] text-white uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Age range</th>
                                <th className="px-6 py-4">Description</th>
                                {isManager && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {grades.map(grade => (
                                <tr key={grade.id} className="hover:bg-blue-50 transition">
                                    <td className="px-6 py-4 text-[var(--color-text)]">{grade.name}</td>
                                    <td className="px-6 py-4 text-[var(--color-text)]">
                                        {grade.fromAge != null && grade.toAge != null
                                            ? `${grade.fromAge}–${grade.toAge}`
                                            : "-"}
                                    </td>
                                    <td className="px-6 py-4 text-[var(--color-text)]">{grade.description || "-"}</td>
                                    {isManager && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingGrade(grade);
                                                        setModalOpen(true);
                                                    }}
                                                >
                                                    <Edit2Icon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(grade)}
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
