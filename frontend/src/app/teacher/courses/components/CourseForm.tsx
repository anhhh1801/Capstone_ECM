"use client";

import { useState, useEffect } from "react";
import { Save, Building2, BookOpen, Calendar, Plus } from "lucide-react";
import { Center, CenterSubject, CenterGrade, getCenterSubjects, getCenterGrades, createCenterSubject, createCenterGrade } from "@/services/centerService";
import toast from "react-hot-toast";

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
    const [subjects, setSubjects] = useState<CenterSubject[]>([]);
    const [grades, setGrades] = useState<CenterGrade[]>([]);

    const fetchCenterOptions = async (centerId?: number) => {
        if (!centerId) {
            setSubjects([]);
            setGrades([]);
            return;
        }

        try {
            const [subjectData, gradeData] = await Promise.all([
                getCenterSubjects(centerId),
                getCenterGrades(centerId),
            ]);
            setSubjects(subjectData);
            setGrades(gradeData);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách môn hoặc khối lớp.");
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    useEffect(() => {
        fetchCenterOptions(formData.centerId);
    }, [formData.centerId]);

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
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <label className="block text-sm font-bold text-[var(--color-text)]">
                            Môn học
                        </label>
                        <button
                            type="button"
                            onClick={async () => {
                                if (!formData.centerId) {
                                    toast.error("Vui lòng chọn trung tâm trước.");
                                    return;
                                }

                                const name = prompt("Tên môn học mới:");
                                if (!name || !name.trim()) return;
                                const description = prompt("Mô tả (tùy chọn):") || "";

                                try {
                                    const newly = await createCenterSubject(formData.centerId, { name, description });
                                    setSubjects(prev => [newly, ...prev]);
                                    setFormData(prev => ({ ...prev, subject: newly.name }));
                                    toast.success("Đã thêm môn học mới.");
                                } catch (error) {
                                    console.error(error);
                                    toast.error("Không thể thêm môn học.");
                                }
                            }}
                            className="flex items-center gap-1 text-xs text-[var(--color-main)] hover:underline"
                        >
                            <Plus size={14} />
                            Thêm mới
                        </button>
                    </div>

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
                            {subjects.map(subject => (
                                <option key={subject.id} value={subject.name}>
                                    {subject.name}
                                </option>
                            ))}
                        </select>

                        {/* Custom Arrow */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-main)]">
                            ▼
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <label className="block text-sm font-medium text-[var(--color-text)]">
                            Khối lớp <span className="text-[var(--color-negative)]">*</span>
                        </label>
                        <button
                            type="button"
                            onClick={async () => {
                                if (!formData.centerId) {
                                    toast.error("Vui lòng chọn trung tâm trước.");
                                    return;
                                }

                                const valueStr = prompt("Nhập số khối (ví dụ: 10):");
                                if (!valueStr) return;
                                const value = Number(valueStr);
                                if (Number.isNaN(value)) {
                                    toast.error("Khối lớp phải là số.");
                                    return;
                                }

                                const name = prompt("Tên hiển thị cho khối (tùy chọn):", `Khối ${value}`) || `Khối ${value}`;
                                const description = prompt("Mô tả (tùy chọn):") || "";

                                try {
                                    const newly = await createCenterGrade(formData.centerId, { name, value, description });
                                    setGrades(prev => [newly, ...prev]);
                                    setFormData(prev => ({ ...prev, grade: newly.value ?? prev.grade }));
                                    toast.success("Đã thêm khối lớp mới.");
                                } catch (error) {
                                    console.error(error);
                                    toast.error("Không thể thêm khối lớp.");
                                }
                            }}
                            className="flex items-center gap-1 text-xs text-[var(--color-main)] hover:underline"
                        >
                            <Plus size={14} />
                            Thêm mới
                        </button>
                    </div>

                    <div className="relative">
                        {grades.length > 0 ? (
                            <select
                                required
                                value={formData.grade}
                                onChange={e => setFormData({ ...formData, grade: Number(e.target.value) })}
                                className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none appearance-none transition bg-white text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-secondary)]"
                            >
                                <option value={0}>-- Chọn khối --</option>
                                {grades.map(grade => (
                                    <option key={grade.id} value={grade.value ?? 0}>
                                        {grade.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                required
                                type="number"
                                min={1}
                                max={12}
                                value={formData.grade}
                                onChange={e => setFormData({ ...formData, grade: Number(e.target.value) })}
                                className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none bg-white"
                            />
                        )}

                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-main)]">
                            ▼
                        </div>
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