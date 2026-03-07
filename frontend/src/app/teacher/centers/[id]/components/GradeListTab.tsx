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

    const handleCreate = async () => {
        const valueStr = prompt("Số khối (ví dụ 10):");
        if (!valueStr) return;
        const value = Number(valueStr);
        if (Number.isNaN(value)) {
            toast.error("Số khối không hợp lệ.");
            return;
        }

        const name = prompt("Tên hiển thị (tùy chọn):", `Khối ${value}`) || `Khối ${value}`;
        const description = prompt("Mô tả (tùy chọn):") || "";

        try {
            await createCenterGrade(centerId, { name: name.trim(), value, description });
            toast.success("Thêm khối lớp thành công.");
            fetch();
        } catch (error) {
            console.error(error);
            toast.error("Không thể thêm khối lớp.");
        }
    };

    const handleEdit = async (grade: CenterGrade) => {
        const valueStr = prompt("Số khối (ví dụ 10):", grade.value?.toString() ?? "");
        if (!valueStr) return;
        const value = Number(valueStr);
        if (Number.isNaN(value)) {
            toast.error("Số khối không hợp lệ.");
            return;
        }

        const name = prompt("Tên hiển thị:", grade.name) || grade.name;
        const description = prompt("Mô tả (tùy chọn):", grade.description || "") || "";

        try {
            await updateCenterGrade(centerId, grade.id, { name: name.trim(), value, description });
            toast.success("Cập nhật khối lớp thành công.");
            fetch();
        } catch (error) {
            console.error(error);
            toast.error("Không thể cập nhật khối lớp.");
        }
    };

    const handleDelete = async (grade: CenterGrade) => {
        if (!confirm(`Xóa khối lớp "${grade.name}"?`)) return;

        try {
            await deleteCenterGrade(centerId, grade.id);
            toast.success("Đã xóa khối lớp.");
            fetch();
        } catch (error) {
            console.error(error);
            toast.error("Không thể xóa khối lớp.");
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-[var(--color-text)]">Loading grades...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                    <Plus size={18} className="text-[var(--color-main)]" />
                    Grades
                </h3>

                {isManager && (
                    <button
                        onClick={handleCreate}
                        className="bg-[var(--color-main)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-secondary)] transition"
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
                                <th className="px-6 py-4">Khối</th>
                                <th className="px-6 py-4">Tên</th>
                                <th className="px-6 py-4">Mô tả</th>
                                {isManager && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {grades.map(grade => (
                                <tr key={grade.id} className="hover:bg-blue-50 transition">
                                    <td className="px-6 py-4 font-semibold text-[var(--color-text)]">{grade.value ?? "-"}</td>
                                    <td className="px-6 py-4 text-[var(--color-text)]">{grade.name}</td>
                                    <td className="px-6 py-4 text-[var(--color-text)]">{grade.description || "-"}</td>
                                    {isManager && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(grade)}
                                                    className="p-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-main)] transition"
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
