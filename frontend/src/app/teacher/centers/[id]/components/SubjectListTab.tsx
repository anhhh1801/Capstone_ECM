"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2Icon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import {
    CenterSubject,
    createCenterSubject,
    deleteCenterSubject,
    getCenterSubjects,
    updateCenterSubject,
} from "@/services/centerService";

interface Props {
    centerId: number;
    isManager: boolean;
}

export default function SubjectListTab({ centerId, isManager }: Props) {
    const [subjects, setSubjects] = useState<CenterSubject[]>([]);
    const [loading, setLoading] = useState(true);

    const fetch = async () => {
        try {
            setLoading(true);
            const res = await getCenterSubjects(centerId);
            setSubjects(res);
        } catch (error) {
            console.error(error);
            toast.error("Cannot load subjects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, [centerId]);

    const handleCreate = async () => {
        const name = prompt("New subject name:");
        if (!name || !name.trim()) return;

        const description = prompt("Description (optional):") || "";

        try {
            await createCenterSubject(centerId, { name: name.trim(), description });
            toast.success("Subject added successfully.");
            fetch();
        } catch (error) {
            console.error(error);
            toast.error("Could not add subject.");
        }
    };

    const handleEdit = async (subject: CenterSubject) => {
        const name = prompt("Subject name:", subject.name);
        if (!name || !name.trim()) return;

        const description = prompt("Description (optional):", subject.description || "") || "";

        try {
            await updateCenterSubject(centerId, subject.id, { name: name.trim(), description });
            toast.success("Subject updated successfully.");
            fetch();
        } catch (error) {
            console.error(error);
            toast.error("Could not update subject.");
        }
    };

    const handleDelete = async (subject: CenterSubject) => {
        if (!confirm(`Delete subject "${subject.name}"?`)) return;

        try {
            await deleteCenterSubject(centerId, subject.id);
            toast.success("Subject deleted.");
            fetch();
        } catch (error) {
            console.error(error);
            toast.error("Could not delete subject.");
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-[var(--color-text)]">Loading subjects...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                    <Plus size={18} className="text-[var(--color-main)]" />
                    Subjects
                </h3>

                {isManager && (
                    <button
                        onClick={handleCreate}
                        className="bg-[var(--color-main)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-secondary)] transition"
                    >
                        Add Subject
                    </button>
                )}
            </div>

            {subjects.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No subjects created yet.</div>
            ) : (
                <div className="bg-[var(--color-soft-white)] rounded-xl border border-[var(--color-main)] shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[var(--color-main)] text-white uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Description</th>
                                {isManager && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {subjects.map(subject => (
                                <tr key={subject.id} className="hover:bg-blue-50 transition">
                                    <td className="px-6 py-4 font-semibold text-[var(--color-text)]">{subject.name}</td>
                                    <td className="px-6 py-4 text-[var(--color-text)]">{subject.description || "-"}</td>
                                    {isManager && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(subject)}
                                                    className="p-2 bg-[var(--color-secondary)] text-white rounded-lg hover:bg-[var(--color-main)] transition"
                                                >
                                                    <Edit2Icon size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(subject)}
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
