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

interface Props {
    courseId: number;
    readOnly?: boolean;
}

export default function CourseEnrollment({ courseId }: Props) {

    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        loadEnrolled();
    }, [courseId]);

    const loadEnrolled = async () => {
        try {
            const data = await getStudentsInCourse(courseId);
            setEnrolledStudents(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        try {
            const data = await searchStudents(keyword);

            const existingIds = enrolledStudents.map(s => s.id);
            const filtered = data.filter((s: any) => !existingIds.includes(s.id));

            setSearchResults(filtered);

        } catch {
            toast.error("Search failed");
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
        if (!confirm("Remove this student from the class?")) return;

        try {
            await removeStudentFromCourse(courseId, studentId);

            toast.success("Student removed");

            setEnrolledStudents(
                enrolledStudents.filter(s => s.id !== studentId)
            );

        } catch {
            toast.error("Error removing student");
        }
    };

    return (
        <div className="bg-[var(--color-soft-white)] rounded-xl border border-[var(--color-main)] shadow-sm mt-6 overflow-hidden">

            {/* HEADER */}

            <div className="bg-[var(--color-main)] text-white px-6 py-4 flex items-center gap-2 font-semibold">
                <UserIcon size={18} />
                Students ({enrolledStudents.length})
            </div>

            <div className="p-6">

                {/* SEARCH */}

                <div className="mb-6">

                    <form onSubmit={handleSearch} className="flex gap-2">

                        <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-[var(--color-main)] rounded
                            focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                        />

                        <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 text-sm
                            border border-[var(--color-main)]
                            text-[var(--color-main)]
                            rounded font-medium
                            hover:bg-[var(--color-main)] hover:text-white transition"
                        >
                            <Search size={16} />
                            Search
                        </button>

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
                                        className="p-2 border border-[var(--color-main)]
                                        text-[var(--color-main)] rounded
                                        hover:bg-[var(--color-main)] hover:text-white transition"
                                    >
                                        <UserPlus size={16} />
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

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

                                <button
                                    onClick={() => handleRemove(student.id)}
                                    className="p-2 border-2 border-[var(--color-alert)]
                                    bg-[var(--color-alert)] text-white rounded
                                    hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] transition"
                                >
                                    <Trash2 size={16} />
                                </button>

                            </div>

                        ))

                    )}

                </div>

            </div>
        </div>
    );
}