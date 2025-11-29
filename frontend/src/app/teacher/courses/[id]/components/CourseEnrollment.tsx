"use client";

import { useState, useEffect } from "react";
import { getStudentsInCourse, addStudentToCourse, removeStudentFromCourse, searchStudents } from "@/services/courseService";
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
    const [loading, setLoading] = useState(false);

    // Load existing students
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

    // Handle Search
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        try {
            const data = await searchStudents(keyword);
            // Filter out students already in the class
            const existingIds = enrolledStudents.map(s => s.id);
            const filtered = data.filter((s: any) => !existingIds.includes(s.id));
            setSearchResults(filtered);
        } catch (error) {
            toast.error("Lỗi tìm kiếm");
        }
    };

    // Add Student
    const handleAdd = async (student: any) => {
        try {
            await addStudentToCourse(courseId, student.id);
            toast.success(`Đã thêm ${student.firstName}`);
            setEnrolledStudents([...enrolledStudents, student]);
            setSearchResults(searchResults.filter(s => s.id !== student.id)); // Remove from search
        } catch (error: any) {
            toast.error(error.response?.data || "Lỗi thêm học sinh");
        }
    };

    // Remove Student
    const handleRemove = async (studentId: number) => {
        if (!confirm("Xóa học sinh này khỏi lớp?")) return;
        try {
            await removeStudentFromCourse(courseId, studentId);
            toast.success("Đã xóa học sinh");
            setEnrolledStudents(enrolledStudents.filter(s => s.id !== studentId));
        } catch (error) {
            toast.error("Lỗi xóa học sinh");
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserIcon className="text-blue-600" /> Danh sách học viên ({enrolledStudents.length})
            </h3>

            {/* --- SEARCH AREA --- */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <form onSubmit={handleSearch} className="flex gap-2 mb-3">
                    <input
                        type="text"
                        placeholder="Tìm học sinh bằng tên hoặc email..."
                        className="flex-1 p-2 border rounded-lg outline-none focus:border-blue-500"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                        <Search size={18} /> Tìm
                    </button>
                </form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="bg-white border rounded-lg shadow-sm max-h-40 overflow-y-auto">
                        {searchResults.map(student => (
                            <div key={student.id} className="p-2 border-b flex justify-between items-center hover:bg-gray-50">
                                <div>
                                    <p className="font-semibold">{student.lastName} {student.firstName}</p>
                                    <p className="text-xs text-gray-500">{student.email}</p>
                                </div>
                                <button
                                    onClick={() => handleAdd(student)}
                                    className="text-green-600 hover:bg-green-50 p-1 rounded"
                                >
                                    <UserPlus size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- ENROLLED LIST --- */}
            <div className="space-y-2">
                {enrolledStudents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Chưa có học sinh nào trong lớp này.</p>
                ) : (
                    enrolledStudents.map(student => (
                        <div key={student.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                    {student.lastName.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">{student.lastName} {student.firstName}</p>
                                    <p className="text-xs text-gray-500">{student.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemove(student.id)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition"
                                title="Xóa khỏi lớp"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}