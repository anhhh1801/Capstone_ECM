"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, MapPin, Edit, Calendar, Book, User, GraduationCap
} from "lucide-react";
import { getCourseById } from "@/services/courseService";
import toast from "react-hot-toast";

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = Number(params.id);
    const router = useRouter();

    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getCourseById(courseId);
                setCourse(data);
            } catch (error) {
                toast.error("Không thể tải thông tin khóa học");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchDetail();
    }, [courseId]);

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>;
    if (!course) return <div className="p-10 text-center text-red-500">Khóa học không tồn tại</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Nút Quay lại */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm transition"
            >
                <ArrowLeft size={18} /> Quay lại danh sách
            </button>

            {/* HEADER: Tên khóa & Trạng thái */}
            <div className="bg-white p-8 rounded-xl shadow-sm border relative overflow-hidden">
                {/* Trang trí background mờ */}
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-50 rounded-full opacity-50 blur-2xl"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-gray-800">{course.name}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${course.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                {course.status || "ACTIVE"}
                            </span>
                        </div>
                        <p className="text-gray-500 flex items-center gap-2 mt-2">
                            <MapPin size={18} className="text-blue-500" />
                            {course.center?.name || "Chưa cập nhật trung tâm"}
                        </p>
                    </div>

                    {/* Nút Sửa */}
                    <Link
                        href={`/teacher/courses/${courseId}/edit`}
                        className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-100 font-medium transition"
                    >
                        <Edit size={18} /> Chỉnh sửa
                    </Link>
                </div>
            </div>

            {/* THÔNG TIN CHI TIẾT (GRID LAYOUT) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Cột Trái: Thông tin chính */}
                <div className="md:col-span-2 space-y-6">
                    {/* Mô tả */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Mô tả khóa học</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                            {course.description || "Chưa có mô tả chi tiết cho khóa học này."}
                        </p>
                    </div>
                </div>

                {/* Cột Phải: Thông tin phụ */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Thông tin lớp học</h3>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Book size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Môn học</p>
                                    <p className="font-medium text-gray-800">{course.subject}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Khối lớp</p>
                                    <p className="font-medium text-gray-800">Lớp {course.grade}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Giáo viên phụ trách</p>
                                    <p className="font-medium text-gray-800">
                                        {course.teacher?.lastName} {course.teacher?.firstName}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Thời gian</p>
                                    <p className="font-medium text-gray-800 text-sm">
                                        {course.startDate} <span className="text-gray-400 mx-1">→</span> {course.endDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}