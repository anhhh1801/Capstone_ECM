"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getCourseById, updateCourse } from "@/services/courseService";
import toast from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = Number(params.id);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        subject: "",
        grade: 0,
        description: "",
        startDate: "",
        endDate: ""
    });
    const [centerId, setCenterId] = useState<number | null>(null); // Để biết đường quay về

    // Load dữ liệu cũ lên form
    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getCourseById(courseId);
                setFormData({
                    name: data.name,
                    subject: data.subject,
                    grade: data.grade,
                    description: data.description,
                    startDate: data.startDate,
                    endDate: data.endDate
                });
                setCenterId(data.center.id);
            } catch (error) {
                toast.error("Không tìm thấy khóa học!");
                router.back();
            } finally {
                setLoading(false);
            }
        };
        if (courseId) fetchDetail();
    }, [courseId, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateCourse(courseId, formData);
            toast.success("Cập nhật thành công!");
            // Quay lại trang chi tiết trung tâm
            if (centerId) router.push(`/teacher/centers/${centerId}`);
        } catch (error) {
            toast.error("Lỗi khi lưu!");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <p className="p-10 text-center">Đang tải dữ liệu...</p>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600">
                <ArrowLeft size={18} /> Hủy bỏ
            </button>

            <div className="bg-white p-8 rounded-xl shadow-sm border">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Chỉnh sửa khóa học</h1>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Tên khóa */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
                        <input
                            type="text" required
                            className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Môn & Lớp */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                            <input type="text" className="w-full p-2.5 border rounded-lg bg-gray-100 cursor-not-allowed" value={formData.subject} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Khối lớp</label>
                            <input
                                type="number" required min={1} max={12}
                                className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.grade}
                                onChange={e => setFormData({ ...formData, grade: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    {/* Ngày tháng */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                            <input
                                type="date" required
                                className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.startDate}
                                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                            <input
                                type="date" required
                                className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.endDate}
                                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                            rows={4}
                            className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit" disabled={saving}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2"
                    >
                        {saving ? "Đang lưu..." : <><Save size={20} /> Lưu thay đổi</>}
                    </button>
                </form>
            </div>
        </div>
    );
}