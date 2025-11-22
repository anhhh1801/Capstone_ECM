"use client";

import { useEffect, useState } from "react";
import { getTeacherCourses, Course } from "@/services/courseService";
import { Plus, Search, BookOpen } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CourseListPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    // Hàm lấy dữ liệu
    const fetchCourses = async () => {
        try {
            // Lấy user từ LocalStorage để biết ID giáo viên
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // Gọi API
            const data = await getTeacherCourses(user.id);
            setCourses(data);
        } catch (error) {
            toast.error("Không thể tải danh sách khóa học");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Chạy 1 lần khi vào trang
    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header: Tiêu đề + Nút tạo mới */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BookOpen className="text-blue-600" />
                    Quản lý Khóa học
                </h1>
                <Link href={`/teacher/courses/create`} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm">
                    <Plus size={20} />
                    Tạo khóa học mới
                </Link>
            </div>

            {/* Thanh tìm kiếm (UI only for now) */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm khóa học..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
            </div>

            {/* Bảng danh sách */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : courses.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                        <BookOpen size={48} className="text-gray-300 mb-4" />
                        <p>Bạn chưa có khóa học nào.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Tên khóa học</th>
                                    <th className="px-6 py-4">Môn học</th>
                                    <th className="px-6 py-4">Trung tâm</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-blue-50 transition">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {course.name}
                                            <span className="block text-xs text-gray-500 mt-0.5">Lớp {course.grade}</span>
                                        </td>
                                        <td className="px-6 py-4">{course.subject}</td>
                                        <td className="px-6 py-4">{course.center?.name}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${course.status === 'ACTIVE'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {course.status === 'ACTIVE' ? 'Đang dạy' : course.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/teacher/courses/${course.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}