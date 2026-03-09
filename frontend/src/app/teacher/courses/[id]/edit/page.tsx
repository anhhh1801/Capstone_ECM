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
    const [course, setCourse] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: "",
        subjectId: undefined as number | undefined,
        gradeId: undefined as number | undefined,
        description: "",
        startDate: "",
        endDate: ""
    });

    const [centerId, setCenterId] = useState<number | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await getCourseById(courseId);
                setCourse(data);

                setFormData({
                    name: data.name,
                    subjectId: data.subject?.id,
                    gradeId: data.grade?.id,
                    description: data.description,
                    startDate: data.startDate,
                    endDate: data.endDate
                });

                setCenterId(data.center.id);

            } catch {
                toast.error("Course not found!");
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
            toast.success("Updated successfully!");

            if (centerId) {
                router.push(`/teacher/centers/${centerId}`);
            }

        } catch {
            toast.error("Error saving!");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-10 text-center text-[var(--color-text)]">
                Loading course data...
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">

            {/* BACK BUTTON */}

            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[var(--color-text)] hover:text-[var(--color-main)] transition text-sm"
            >
                <ArrowLeft size={18} />
                Cancel
            </button>

            {/* CARD */}

            <div className="bg-[var(--color-soft-white)] border border-[var(--color-main)] rounded-xl shadow-sm p-8">

                <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6 border-b-2">
                    Edit Course
                </h1>

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* COURSE NAME */}

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            Course Name
                        </label>

                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-[var(--color-main)] rounded-lg text-sm
                            focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                        />
                    </div>

                    {/* SUBJECT + GRADE */}

                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                Subject
                            </label>

                            <input
                                disabled
                                value={course?.subject?.name ?? ""}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                Grade
                            </label>

                            <input
                                disabled
                                value={
                                    course?.grade
                                        ? `${course.grade.name}${course.grade.fromAge != null && course.grade.toAge != null
                                            ? ` (age ${course.grade.fromAge}-${course.grade.toAge})`
                                            : ""
                                        }`
                                        : ""
                                }
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-sm"
                            />
                        </div>

                    </div>

                    {/* DATES */}

                    <div className="grid grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                Start Date
                            </label>

                            <input
                                required
                                type="date"
                                value={formData.startDate}
                                onChange={e =>
                                    setFormData({ ...formData, startDate: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[var(--color-main)] rounded-lg text-sm
                                focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                                End Date
                            </label>

                            <input
                                required
                                type="date"
                                value={formData.endDate}
                                onChange={e =>
                                    setFormData({ ...formData, endDate: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-[var(--color-main)] rounded-lg text-sm
                                focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                            />
                        </div>

                    </div>

                    {/* DESCRIPTION */}

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                            Description
                        </label>

                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={e =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-[var(--color-main)] rounded-lg text-sm
                            focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                        />
                    </div>

                    {/* SAVE BUTTON */}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex justify-center items-center gap-2
                        bg-[var(--color-main)] border-2 border-[var(--color-main)]
                        text-white py-3 rounded-lg font-semibold
                        hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)]
                        transition disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                </form>

            </div>
        </div>
    );
}