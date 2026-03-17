"use client";

import { useState, useEffect } from "react";
import { getStudentsInCourse } from "@/services/courseService";
import { User as UserIcon, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
    courseId: number;
    readOnly?: boolean;
}

const ITEMS_PER_PAGE = 10;

export default function StudentList({ courseId, readOnly }: Props) {
    const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
    const [keyword, setKeyword] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        loadEnrolled();
    }, [courseId]);

    // Reset to page 1 whenever the user types a new search keyword
    useEffect(() => {
        setCurrentPage(1);
    }, [keyword]);

    const loadEnrolled = async () => {
        try {
            setIsLoading(true);
            const data = await getStudentsInCourse(courseId);
            setEnrolledStudents(data);
        } catch (error) {
            console.error("Failed to load students:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 1. Filter all students first
    const filteredStudents = enrolledStudents.filter((student) => {
        if (!keyword.trim()) return true;

        const searchLower = keyword.toLowerCase();
        const studentName = `${student.lastName} ${student.firstName}`.toLowerCase();
        const studentEmail = (student.email || "").toLowerCase();

        return studentName.includes(searchLower) || studentEmail.includes(searchLower);
    });

    // 2. Calculate pagination variables
    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // 3. Slice the array to get only the students for the current page
    const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

    return (
        <div className="bg-[var(--color-soft-white)] rounded-xl border border-[var(--color-main)] shadow-sm mt-6 overflow-hidden">
            {/* HEADER */}
            <div className="bg-[var(--color-main)] text-white px-6 py-4 flex items-center gap-2 font-semibold">
                <UserIcon size={18} />
                Students ({enrolledStudents.length})
            </div>

            <div className="p-6">
                {/* SEARCH BAR */}
                <div className="mb-6 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={16} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search enrolled students by name or email..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm border border-[var(--color-main)] rounded focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                    />
                </div>

                {/* DATA TABLE */}
                <div className="overflow-x-auto border border-[var(--color-main)] rounded-lg">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-[var(--color-secondary)]/10 text-[var(--color-text)] border-b border-[var(--color-main)]">
                                <th className="p-4 font-semibold w-16 text-center">No.</th>
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="text-center text-gray-500 py-8">Loading students...</td>
                                </tr>
                            ) : paginatedStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center text-gray-500 py-8 border-dashed">
                                        {keyword ? "No students match your search." : "No students in this course yet."}
                                    </td>
                                </tr>
                            ) : (
                                paginatedStudents.map((student, index) => (
                                    <tr
                                        key={student.id}
                                        className="border-b last:border-0 border-gray-200 hover:bg-[var(--color-secondary)]/5 transition"
                                    >
                                        <td className="p-4 text-center text-gray-500">
                                            {/* Calculate global ranking number (e.g., 11, 12, 13 on page 2) */}
                                            {startIndex + index + 1}
                                        </td>
                                        <td className="p-4 font-medium text-[var(--color-text)]">
                                            {student.lastName} {student.firstName}
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            {student.email}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-gray-500">
                            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> results
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-[var(--color-main)] text-[var(--color-main)] rounded hover:bg-[var(--color-main)] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} /> Prev
                            </button>
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-[var(--color-main)] text-[var(--color-main)] rounded hover:bg-[var(--color-main)] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}