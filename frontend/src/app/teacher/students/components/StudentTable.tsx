"use client";

import { Mail, Phone, Building2, Unlink, Trash2, Edit2Icon } from "lucide-react";

interface Student {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    connectedCenters?: { id: number; name: string }[];
}

interface Props {
    students: Student[];
    loading: boolean;
    onAssign?: (studentId: number) => void;
    onDelete: (studentId: number) => void;
    deleteLabel?: string;
    onEdit: (student: any) => void;
    showAffiliatedCenters?: boolean;
}

export default function StudentTable({
    students,
    loading,
    onAssign,
    onDelete,
    deleteLabel = "Delete",
    onEdit,
    showAffiliatedCenters = true,
}: Props) {

    if (loading) {
        return (
            <div className="p-10 text-center text-[var(--color-text)]">
                Loading students...
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="p-10 text-center border border-dashed rounded-xl bg-[var(--color-soft-white)] text-gray-500">
                No students found.
            </div>
        );
    }

    return (
        <div className="bg-[var(--color-soft-white)] rounded-xl border border-[var(--color-main)] shadow-sm overflow-hidden">

            <table className="w-full text-left text-sm">

                {/* HEADER */}
                <thead className="bg-[var(--color-main)] text-white uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Student</th>
                        <th className="px-6 py-4">Contact Info</th>
                        {showAffiliatedCenters && (
                            <th className="px-6 py-4">Affiliated Centers</th>
                        )}
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                    {students.map((student) => (

                        <tr
                            key={student.id}
                            className="hover:bg-blue-50 transition"
                        >

                            {/* STUDENT INFO */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)]/20 text-[var(--color-main)] flex items-center justify-center font-bold">
                                        {student.lastName.charAt(0)}
                                    </div>

                                    <div>
                                        <p className="font-bold text-[var(--color-text)]">
                                            {student.lastName} {student.firstName}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            ID: {student.id}
                                        </p>
                                    </div>

                                </div>
                            </td>

                            {/* CONTACT */}
                            <td className="px-6 py-4">
                                <div className="space-y-1 text-[var(--color-text)]">

                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail size={14} className="text-[var(--color-main)]" />
                                        {student.email}
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone size={14} className="text-[var(--color-main)]" />
                                        {student.phoneNumber || "---"}
                                    </div>

                                </div>
                            </td>

                            {/* CENTERS */}
                            {showAffiliatedCenters && (
                                <td className="px-6 py-4">

                                    <div className="flex flex-wrap gap-2">

                                        {student.connectedCenters && student.connectedCenters.length > 0 ? (

                                            student.connectedCenters.map((c) => (

                                                <span
                                                    key={c.id}
                                                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-[var(--color-secondary)]/10 text-[var(--color-main)] border border-[var(--color-secondary)]/30"
                                                >
                                                    <Building2 size={12} />
                                                    {c.name}
                                                </span>

                                            ))

                                        ) : (

                                            <span className="text-xs text-gray-400 italic">
                                                Unassigned
                                            </span>

                                        )}

                                    </div>

                                </td>
                            )}

                            {/* ACTIONS */}
                            <td className="px-6 py-4 text-right">

                                <div className="flex justify-end items-center gap-2">

                                    {onAssign && (
                                        <button
                                            onClick={() => onAssign(student.id)}
                                            className="text-[var(--color-main)] border border-[var(--color-main)] px-2 py-1 rounded text-xs font-medium hover:bg-[var(--color-main)] hover:text-white transition"
                                        >
                                            + Assign
                                        </button>
                                    )}

                                    <button
                                        onClick={() => onEdit(student)}
                                        className="p-2 border-2 bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] rounded hover:bg-white hover:text-[var(--color-secondary)] transition"
                                    >
                                        <Edit2Icon size={18} />
                                    </button>

                                    <button
                                        onClick={() => onDelete(student.id)}
                                        className="p-2 border-2 border-[var(--color-alert)] bg-[var(--color-alert)] text-white rounded hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] transition"
                                        title={deleteLabel}
                                    >
                                        {deleteLabel === "Remove"
                                            ? <Unlink size={18} />
                                            : <Trash2 size={18} />}
                                    </button>

                                </div>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}