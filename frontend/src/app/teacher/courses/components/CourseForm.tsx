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
    initialData?: CourseFormData;
    onSubmit: (data: CourseFormData) => void;
    loading: boolean;
    centers: Center[];
    isCenterLocked?: boolean;
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
        name: "", subject: "", grade: 10,
        description: "", startDate: "",
        endDate: "", centerId: undefined
    };

    const [formData, setFormData] = useState<CourseFormData>(defaultData);

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
        <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-[var(--color-soft-white)] p-8 rounded-xl shadow-sm"
        >

            {/* CENTER SELECT */}
            <div className="p-4 rounded-lg bg-white">
                <label className="block text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
                    <Building2 size={16} className="text-[var(--color-main)]" />
                    Trung tâm tổ chức <span className="text-[var(--color-negative)]">*</span>
                </label>

                <div className="relative">
                    <select
                        required
                        disabled={isCenterLocked}
                        value={formData.centerId || ""}
                        onChange={e => setFormData({ ...formData, centerId: Number(e.target.value) })}
                        className={`w-full p-3 border-2 rounded-lg outline-none appearance-none transition
                            ${isCenterLocked
                                ? "bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
                                : "bg-white border-[var(--color-main)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-secondary)]"
                            }`}
                    >
                        <option value="">-- Chọn trung tâm --</option>
                        {centers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {!isCenterLocked && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-main)]">
                            ▼
                        </div>
                    )}
                </div>

                <p className="text-xs mt-2 text-[var(--color-text)]/70">
                    {isCenterLocked
                        ? "* Khóa học này được gán cố định cho trung tâm hiện tại."
                        : "* Vui lòng chọn trung tâm bạn muốn tạo khóa học này."
                    }
                </p>
            </div>

            {/* COURSE NAME */}
            <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    Tên khóa học
                </label>
                <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none bg-white"
                    placeholder="Ví dụ: Luyện thi Toán 10 - Cấp tốc"
                />
            </div>

            {/* SUBJECT + GRADE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-[var(--color-text)] mb-2">
                        Môn học
                    </label>

                    <div className="relative">
                        <select
                            required
                            value={formData.subject}
                            onChange={e =>
                                setFormData({ ...formData, subject: e.target.value })
                            }
                            className="w-full p-3 pr-10 border-2 border-[var(--color-main)] rounded-lg outline-none appearance-none transition
                       bg-white text-[var(--color-text)]
                       focus:ring-2 focus:ring-[var(--color-secondary)]"
                        >
                            <option value="">-- Chọn môn --</option>
                            <option value="Toán">Toán</option>
                            <option value="Lý">Vật Lý</option>
                            <option value="Hóa">Hóa Học</option>
                            <option value="Anh">Tiếng Anh</option>
                            <option value="Văn">Ngữ Văn</option>
                        </select>

                        {/* Custom Arrow */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-main)]">
                            ▼
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                        Khối lớp <span className="text-[var(--color-negative)]">*</span>
                    </label>
                    <div className="relative">
                        <BookOpen size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-main)]" />
                        <input
                            required
                            type="number"
                            min={1}
                            max={12}
                            value={formData.grade}
                            onChange={e => setFormData({ ...formData, grade: Number(e.target.value) })}
                            className="w-full p-3 pl-10 border-2 border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* DATES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["startDate", "endDate"].map((field, i) => (
                    <div key={field}>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            {i === 0 ? <span>Ngày bắt đầu <span className="text-[var(--color-negative)]">*</span></span> : <span>Ngày kết thúc <span className="text-[var(--color-negative)]">*</span></span>}
                        </label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-main)]" />
                            <input
                                required
                                type="date"
                                value={(formData as any)[field]}
                                onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                                className="w-full p-3 pl-10 border-2 border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none bg-white"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* DESCRIPTION */}
            <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    Mô tả chi tiết
                </label>
                <textarea
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none bg-white"
                    placeholder="Nội dung chương trình, mục tiêu đầu ra..."
                />
            </div>

            {/* SUBMIT */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading || centers.length === 0}
                    className="w-full bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white py-3 rounded-lg font-bold hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading ? "Đang xử lý..." : <><Save size={20} /> {btnLabel}</>}
                </button>

                {centers.length === 0 && (
                    <p className="text-center text-[var(--color-negative)] text-sm mt-2">
                        Bạn chưa có trung tâm nào để tạo khóa học.
                    </p>
                )}
            </div>
        </form>
    );
}