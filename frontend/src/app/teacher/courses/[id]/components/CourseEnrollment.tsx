"use client";

import { useState, useEffect } from "react";
import {
    getStudentsInCourse,
    addStudentToCourse,
    removeStudentFromCourse,
    searchStudents
} from "@/services/courseService";

import { Trash2, UserPlus, Search, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

interface Props {
    courseId: number;
    readOnly?: boolean;
}

export default function CourseEnrollment({ courseId, readOnly = false }: Props) {

    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [keyword, setKeyword] = useState("");
    const [removingStudentId, setRemovingStudentId] = useState<number | null>(null);

    useEffect(() => {
        loadEnrolled();
    }, [courseId]);

    useEffect(() => {
        // 1. If the input is empty, clear the results and stop.
        if (!keyword.trim()) {
            setSearchResults([]);
            return;
        }

        // 2. Set up a debounce timer
        const delayDebounceFn = setTimeout(async () => {
            try {
                const data = await searchStudents(keyword);

                const existingIds = enrolledStudents.map((s: any) => s.id);
                const filtered = data.filter((s: any) => !existingIds.includes(s.id));

                setSearchResults(filtered);
            } catch {
                toast.error("Search failed");
            }
        }, 300);

        // 3. Cleanup function to cancel the previous timer if the user keeps typing
        return () => clearTimeout(delayDebounceFn);

    }, [keyword, enrolledStudents]);

    const loadEnrolled = async () => {
        try {
            const data = await getStudentsInCourse(courseId);
            setEnrolledStudents(data);
        } catch (error) {
            console.error(error);
        }
    };


    const handleAdd = async (student: any) => {
        try {
            await addStudentToCourse(courseId, student.id);

            toast.success(`Added ${student.firstName}`);

            setEnrolledStudents([...enrolledStudents, student]);

            setSearchResults(
                searchResults.filter(s => s.id !== student.id)
            );

        } catch (error: any) {
            toast.error(error.response?.data || "Error adding student");
        }
    };

    const handleRemove = async (studentId: number) => {
        try {
            await removeStudentFromCourse(courseId, studentId);

            toast.success("Student removed");
            setRemovingStudentId(null);

            setEnrolledStudents(
                enrolledStudents.filter(s => s.id !== studentId)
            );

        } catch {
            toast.error("Error removing student");
        }
    };

    const removingStudent = enrolledStudents.find((s) => s.id === removingStudentId);

    return (
        <div className="bg-[var(--color-soft-white)] rounded-xl border border-[var(--color-main)] shadow-sm mt-6 overflow-hidden">

            <ConfirmModal
                isOpen={!readOnly && removingStudentId !== null}
                title="Remove Student"
                message={`Remove "${removingStudent?.lastName || ""} ${removingStudent?.firstName || ""}" from this class?`}
                confirmText="Remove"
                onClose={() => setRemovingStudentId(null)}
                onConfirm={() => (removingStudentId !== null ? handleRemove(removingStudentId) : undefined)}
            />

            {/* HEADER */}

            <div className="bg-[var(--color-main)] text-white px-6 py-4 flex items-center gap-2 font-semibold">
                <UserIcon size={18} />
                Students ({enrolledStudents.length})
            </div>

            <div className="p-6">

                {/* SEARCH */}

                {!readOnly && (
                <div className="mb-6">

                    <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-[var(--color-main)] rounded focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                        />
                    </form>

                    {/* SEARCH RESULTS */}

                    {searchResults.length > 0 && (
                        <div className="mt-3 border border-[var(--color-main)] rounded overflow-hidden">
                            {searchResults.map(student => (
                                <div
                                    key={student.id}
                                    className="flex justify-between items-center px-4 py-3 border-b last:border-b-0 hover:bg-[var(--color-secondary)]/10 transition"
                                >
                                    <div>
                                        <p className="font-semibold text-[var(--color-text)]">
                                            {student.lastName} {student.firstName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {student.email}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleAdd(student)}
                                        className="p-2 border border-[var(--color-main)] text-[var(--color-main)] rounded hover:bg-[var(--color-main)] hover:text-white transition"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
                )}

                {/* STUDENT LIST */}

                <div className="space-y-2">

                    {enrolledStudents.length === 0 ? (

                        <div className="text-center text-gray-500 py-6 border border-dashed rounded-lg">
                            No students in this course yet
                        </div>

                    ) : (

                        enrolledStudents.map(student => (

                            <div
                                key={student.id}
                                className="flex justify-between items-center p-3 border border-[var(--color-main)] rounded-lg hover:bg-[var(--color-secondary)]/10 transition"
                            >

                                <div className="flex items-center gap-3">

                                    <div className="w-9 h-9 rounded-full bg-[var(--color-secondary)]/20 text-[var(--color-main)] flex items-center justify-center font-bold text-sm">
                                        {student.lastName.charAt(0)}
                                    </div>

                                    <div>

                                        <p className="font-semibold text-[var(--color-text)]">
                                            {student.lastName} {student.firstName}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {student.email}
                                        </p>

                                    </div>

                                </div>

                                {!readOnly && (
                                    <button
                                        onClick={() => setRemovingStudentId(student.id)}
                                        className="p-2 border-2 border-[var(--color-alert)]
                                        bg-[var(--color-alert)] text-white rounded
                                        hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}

                            </div>

                        ))

                    )}

                </div>

            </div>
        </div>
    );
}