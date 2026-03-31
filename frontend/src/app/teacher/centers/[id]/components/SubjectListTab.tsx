"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Edit2Icon, Trash2, PlusIcon, BookA, Search } from "lucide-react";
import toast from "react-hot-toast";
import {
    CenterSubject,
    deleteCenterSubject,
    getCenterSubjects,
} from "@/services/centerService";
import SubjectModal from "./SubjectModal";
import ConfirmModal from "@/components/ConfirmModal";

interface Props {
    centerId: number;
    isManager: boolean;
}

export default function SubjectListTab({ centerId, isManager }: Props) {
    const [subjects, setSubjects] = useState<CenterSubject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState("");

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingSubject, setEditingSubject] = useState<CenterSubject | null>(null);
    const [deletingSubject, setDeletingSubject] = useState<CenterSubject | null>(null);

    const filteredSubjects = useMemo(() => {
        const query = searchName.trim().toLowerCase();
        return subjects.filter((subject) => !query || subject.name.toLowerCase().includes(query));
    }, [subjects, searchName]);

    const fetch = useCallback(async () => {
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
    }, [centerId]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    const handleCreate = () => {
        setEditingSubject(null);
        setModalOpen(true);
    };

    const handleEdit = (subject: CenterSubject) => {
        setEditingSubject(subject);
        setModalOpen(true);
    };

    const handleDelete = async (subject: CenterSubject) => {
        try {
            await deleteCenterSubject(centerId, subject.id);
            toast.success("Subject deleted.");
            setDeletingSubject(null);
            fetch();
        } catch (error: any) {
            const responseData = error?.response?.data;
            const message =
                responseData?.error ||
                responseData?.message ||
                (typeof responseData === "string" ? responseData : null) ||
                "Could not delete subject.";
            toast.error(message);
        }
    };

    if (loading) {
        return <div className="p-10 text-center text-[var(--color-text)]">Loading subjects...</div>;
    }

    return (
        <div className="space-y-4">
            <SubjectModal
                centerId={centerId}
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={() => {
                    setModalOpen(false);
                    fetch();
                }}
                subject={editingSubject}
            />

            <ConfirmModal
                isOpen={!!deletingSubject}
                title="Delete Subject"
                message={`Delete subject "${deletingSubject?.name || ""}"?`}
                confirmText="Delete"
                onClose={() => setDeletingSubject(null)}
                onConfirm={() => (deletingSubject ? handleDelete(deletingSubject) : undefined)}
            />

            <div className="flex items-center justify-between">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                        <BookA size={18} /> Subjects
                </h3>

                {isManager && (
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-[var(--color-main)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-secondary)] transition"
                    >
                       <PlusIcon size={18} /> Add Subject
                    </button>
                )}
            </div>

            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Search subject by name"
                    className="w-full pl-9 pr-3 py-2 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
                />
            </div>

            {subjects.length === 0 ? (
                <div className="p-10 text-center text-gray-500">No subjects created yet.</div>
            ) : filteredSubjects.length === 0 ? (
                <div className="p-10 text-center text-gray-500 bg-white rounded-xl border">
                    No subjects match your search.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {filteredSubjects.map(subject => (

                            <div
                                key={subject.id}
                                className="bg-[var(--color-soft-white)] border border-[var(--color-main)] shadow-sm hover:shadow-md transition flex flex-col justify-between"
                            >

                                {/* ACTION BAR */}
                                {isManager && (
                                    <div className="flex justify-end items-center gap-2 bg-[var(--color-main)] p-2 border-b border-[var(--color-main)]">

                                        <button
                                            onClick={() => handleEdit(subject)}
                                            className="p-2 border-2 bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] rounded hover:bg-white hover:text-[var(--color-secondary)] transition"
                                        >
                                            <Edit2Icon size={18} />
                                        </button>

                                        <button
                                            onClick={() => setDeletingSubject(subject)}
                                            className="p-2 border-2 border-[var(--color-alert)] bg-[var(--color-alert)] text-white rounded hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                    </div>
                                )}

                                {/* SUBJECT CONTENT */}
                                <div className="p-4 flex flex-col flex-1">

                                    <h4 className="font-bold text-[var(--color-text)]">
                                        {subject.name}
                                    </h4>

                                    <div className="text-sm text-[var(--color-text)] mt-2">
                                        <span className="font-medium">Description:</span>{" "}
                                        {subject.description || "-"}
                                    </div>

                                </div>

                            </div>

                        ))}
                </div>
            )}
        </div>
    );
}
