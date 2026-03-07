"use client";

import { useState, useEffect } from "react";
import { Save, Building2, BookOpen, Calendar, Plus } from "lucide-react";
import { Center, CenterSubject, CenterGrade, getCenterSubjects, getCenterGrades, createCenterSubject, createCenterGrade } from "@/services/centerService";
import toast from "react-hot-toast";

export interface CourseFormData {
    name: string;
    subjectId?: number;
    gradeId?: number;
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
    btnLabel = "Save Course"
}: Props) {

    const defaultData: CourseFormData = {
        name: "",
        subjectId: undefined,
        gradeId: undefined,
        description: "",
        startDate: "",
        endDate: "",
        centerId: undefined
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
            toast.error("Unable to load subjects or grades.");
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
                    Center <span className="text-[var(--color-negative)]">*</span>
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
                        <option value="">-- Select a center --</option>
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
                        ? "* This course is fixed to the selected center."
                        : "* Please select a center for this course."
                    }
                </p>
            </div>

            {/* COURSE NAME */}
            <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                    Course name
                </label>
                <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none bg-white"
                    placeholder="Example: Fast-track Math 10 Preparation"
                />
            </div>

            {/* SUBJECT + GRADE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <label className="block text-sm font-bold text-[var(--color-text)]">
                            Subject
                        </label>
                        <button
                            type="button"
                            onClick={async () => {
                                if (!formData.centerId) {
                                    toast.error("Please select a center first.");
                                    return;
                                }

                                const name = prompt("New subject name:");
                                if (!name || !name.trim()) return;
                                const description = prompt("Description (optional):") || "";

                                try {
                                    const newly = await createCenterSubject(formData.centerId, { name, description });
                                    setSubjects(prev => [newly, ...prev]);
                                    setFormData(prev => ({ ...prev, subjectId: newly.id }));
                                    toast.success("Subject added successfully.");
                                } catch (error) {
                                    console.error(error);
                                    toast.error("Could not add subject.");
                                }
                            }}
                            className="flex items-center gap-1 text-xs text-[var(--color-main)] hover:underline"
                        >
                            <Plus size={14} />
                            Add new
                        </button>
                    </div>

                    <div className="relative">
                        <select
                            value={formData.subjectId ?? ""}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    subjectId: e.target.value ? Number(e.target.value) : undefined,
                                })
                            }
                            className="w-full p-3 pr-10 border-2 border-[var(--color-main)] rounded-lg outline-none appearance-none transition
                       bg-white text-[var(--color-text)]
                       focus:ring-2 focus:ring-[var(--color-secondary)]"
                        >
                            <option value="">-- Select a subject --</option>
                            {subjects.map(subject => (
                                <option key={subject.id} value={subject.id}>
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
                            Grade
                        </label>
                        <button
                            type="button"
                            onClick={async () => {
                                if (!formData.centerId) {
                                    toast.error("Please select a center first.");
                                    return;
                                }

                                const fromAgeStr = prompt("From age (optional):");
                                if (fromAgeStr === null) return;
                                const toAgeStr = prompt("To age (optional):");
                                if (toAgeStr === null) return;

                                const fromAge = fromAgeStr.trim() === "" ? undefined : Number(fromAgeStr);
                                const toAge = toAgeStr.trim() === "" ? undefined : Number(toAgeStr);

                                if (fromAgeStr.trim() !== "" && Number.isNaN(fromAge)) {
                                    toast.error("From age must be a number.");
                                    return;
                                }
                                if (toAgeStr.trim() !== "" && Number.isNaN(toAge)) {
                                    toast.error("To age must be a number.");
                                    return;
                                }

                                const nameInput = prompt("Grade display name (optional):", "") || "";
                                const description = prompt("Description (optional):") || "";
                                const name = nameInput.trim() || (fromAge != null && toAge != null ? `Grade ${fromAge}-${toAge}` : "Grade");

                                try {
                                    const newly = await createCenterGrade(formData.centerId, {
                                        name,
                                        fromAge,
                                        toAge,
                                        description,
                                    });
                                    setGrades(prev => [newly, ...prev]);
                                    setFormData(prev => ({ ...prev, gradeId: newly.id }));
                                    toast.success("Grade added successfully.");
                                } catch (error) {
                                    console.error(error);
                                    toast.error("Could not add grade.");
                                }
                            }}
                            className="flex items-center gap-1 text-xs text-[var(--color-main)] hover:underline"
                        >
                            <Plus size={14} />
                            Add new
                        </button>
                    </div>

                    <div className="relative">
                        <select
                            value={formData.gradeId ?? ""}
                            onChange={e => setFormData({
                                ...formData,
                                gradeId: e.target.value ? Number(e.target.value) : undefined,
                            })}
                            className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none appearance-none transition bg-white text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-secondary)]"
                        >
                            <option value="">-- Select a grade --</option>
                            {grades.length === 0 && (
                                <option value="" disabled>
                                    No grades yet (please add one)
                                </option>
                            )}
                            {grades.map(grade => (
                                <option key={grade.id} value={grade.id}>
                                    {grade.name}
                                    {grade.fromAge != null && grade.toAge != null
                                        ? ` (age ${grade.fromAge}-${grade.toAge})`
                                        : ""}
                                </option>
                            ))}
                        </select>

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
                            {i === 0 ? <span>Start date <span className="text-[var(--color-negative)]">*</span></span> : <span>End date <span className="text-[var(--color-negative)]">*</span></span>}
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
                    Description
                </label>
                <textarea
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none bg-white"
                    placeholder="Course details, goals, and outcomes..."
                />
            </div>

            {/* SUBMIT */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading || centers.length === 0}
                    className="w-full bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white py-3 rounded-lg font-bold hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {loading ? "Processing..." : <><Save size={20} /> {btnLabel}</>}
                </button>

                {centers.length === 0 && (
                    <p className="text-center text-[var(--color-negative)] text-sm mt-2">
                        You don't have any centers to create a course.
                    </p>
                )}
            </div>
        </form>
    );
}