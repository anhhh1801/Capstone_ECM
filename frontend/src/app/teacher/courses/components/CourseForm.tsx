"use client";

import { useState, useEffect } from "react";
import { Save, Building2, BookOpen, Calendar } from "lucide-react";
import { Center } from "@/services/centerService";

export interface CourseFormData {
    name: string;
    subject: string;
    grade: number;
    description: string;
    startDate: string;
    endDate: string;
    centerId?: number;
}

interface Props {
    initialData?: CourseFormData; // Dùng cho trang Edit
    onSubmit: (data: CourseFormData) => void;
    loading: boolean;
    centers: Center[]; // Danh sách center để đổ vào dropdown
    isCenterLocked?: boolean; // Logic khóa dropdown
    btnLabel?: string;
}

export default function CourseForm({
    initialData,
    onSubmit,
    loading,
    centers,
    isCenterLocked = false,
    btnLabel = "Lưu khóa học"
}: Props) {

    const defaultData: CourseFormData = {
        name: "", subject: "", grade: 10, description: "",
        startDate: "", endDate: "", centerId: undefined
    };

    const [formData, setFormData] = useState<CourseFormData>(defaultData);

    // Nạp dữ liệu cũ (nếu là Edit hoặc có CenterId truyền sẵn)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-sm border">

            {/* --- KHU VỰC CHỌN TRUNG TÂM (QUAN TRỌNG) --- */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <label className="block text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                    <Building2 size={16} /> Trung tâm tổ chức <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <select
                        required
                        disabled={isCenterLocked} // <-- Khóa nếu đã gán sẵn
                        className={`w-full p-3 pl-4 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${isCenterLocked
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300'
                            : 'bg-white text-gray-900'
                            }`}
                        value={formData.centerId || ""}
                        onChange={e => setFormData({ ...formData, centerId: Number(e.target.value) })}
                    >
                        <option value="">-- Chọn trung tâm --</option>
                        {centers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {/* Mũi tên dropdown chỉ hiện khi không bị khóa */}
                    {!isCenterLocked && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                    )}
                </div>
                {isCenterLocked ? (
                    <p className="text-xs text-gray-500 mt-2 italic">
                        * Khóa học này được gán cố định cho trung tâm hiện tại.
                    </p>
                ) : (
                    <p className="text-xs text-blue-600 mt-2">
                        * Vui lòng chọn trung tâm bạn muốn tạo khóa học này.
                    </p>
                )}
            </div>

            {/* --- CÁC TRƯỜNG THÔNG TIN KHÁC --- */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
                <input
                    required type="text"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Ví dụ: Luyện thi Toán 10 - Cấp tốc"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
                    <select
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={formData.subject}
                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    >
                        <option value="">-- Chọn môn --</option>
                        <option value="Toán">Toán</option>
                        <option value="Lý">Vật Lý</option>
                        <option value="Hóa">Hóa Học</option>
                        <option value="Anh">Tiếng Anh</option>
                        <option value="Văn">Ngữ Văn</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khối lớp</label>
                    <div className="relative">
                        <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            required type="number" min={1} max={12}
                            className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.grade}
                            onChange={e => setFormData({ ...formData, grade: Number(e.target.value) })}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            required type="date"
                            className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.startDate}
                            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            required type="date"
                            className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.endDate}
                            onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                <textarea
                    rows={4}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nội dung chương trình, mục tiêu đầu ra..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit" disabled={loading || centers.length === 0}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {loading ? "Đang xử lý..." : <><Save size={20} /> {btnLabel}</>}
                </button>
                {centers.length === 0 && (
                    <p className="text-center text-red-500 text-sm mt-2">Bạn chưa có trung tâm nào để tạo khóa học.</p>
                )}
            </div>
        </form>
    );
}