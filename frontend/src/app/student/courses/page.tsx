"use client";

import { useEffect, useState } from "react";
import { getStudentCourses, Course } from "@/services/courseService";
import { BookOpen, ExternalLink, Filter } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { getCourseStatusClasses, getCourseStatusLabel } from "@/utils/courseStatus";

export default function CourseListPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCenterId, setSelectedCenterId] = useState<string>("ALL");

    const currentCourses = courses.filter(
        (course) => course.status === "UPCOMING" || course.status === "IN_PROGRESS"
    );

    const centerOptions = Array.from(
        new Map(
            currentCourses
                .filter((course) => typeof course.center?.id === "number")
                .map((course) => [course.center.id as number, course.center])
        ).values()
    ).sort((left, right) => left.name.localeCompare(right.name));

    const visibleCourses = selectedCenterId === "ALL"
        ? currentCourses
        : currentCourses.filter((course) => course.center?.id === Number(selectedCenterId));

    const fetchCourses = async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const data = await getStudentCourses(user.id);
            setCourses(data);
        } catch (error) {
            toast.error("Unable to load course list");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
                    <BookOpen className="text-[var(--color-main)]" />
                    Current Courses
                </h1>

            </div>

            <div className="flex items-center gap-2 text-[var(--color-text)]">
                <BookOpen size={18} className="text-[var(--color-main)]" />
                <h2 className="text-lg font-semibold">
                    Upcoming And In-Progress Courses
                </h2>
            </div>

            <div className="relative max-w-xs">
                <Filter
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-main)]"
                    size={18}
                />
                <select
                    value={selectedCenterId}
                    onChange={(event) => setSelectedCenterId(event.target.value)}
                    className="w-full appearance-none rounded-xl border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] py-3 pl-10 pr-8 text-sm text-[var(--color-text)] outline-none transition focus:ring-2 focus:ring-[var(--color-secondary)]"
                >
                    <option value="ALL">All Centers</option>
                    {centerOptions.map((center) => (
                        <option key={center.id} value={center.id}>
                            {center.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="rounded-xl border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-8 text-center text-[var(--color-text)] shadow-sm">
                    Loading data...
                </div>
            ) : visibleCourses.length === 0 ? (
                <div className="rounded-xl border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-12 text-center text-[var(--color-text)] shadow-sm flex flex-col items-center">
                    <BookOpen size={48} className="text-[var(--color-main)] mb-4" />
                    <p>
                        {selectedCenterId === "ALL"
                            ? "You do not have any upcoming or in-progress courses."
                            : "No upcoming or in-progress courses found for this center."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {visibleCourses.map((course) => (
                        <div
                            key={course.id}
                            className="rounded-2xl border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <h3 className="text-lg font-bold text-[var(--color-text)] break-words">
                                        {course.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-[var(--color-text)]/70">
                                        Grade {course.grade?.name || "-"}
                                    </p>
                                </div>

                                <span
                                    className={`inline-flex shrink-0 items-center rounded-full border-2 px-3 py-1 text-xs font-medium ${getCourseStatusClasses(course.status)}`}
                                >
                                    {getCourseStatusLabel(course.status)}
                                </span>
                            </div>

                            <div className="mt-5 space-y-3 text-sm text-[var(--color-text)]">
                                <div className="flex items-start justify-between gap-4 rounded-xl bg-white/70 px-4 py-3">
                                    <span className="font-semibold text-[var(--color-text)]/70">Subject</span>
                                    <span className="text-right font-medium">{course.subject?.name || "-"}</span>
                                </div>

                                <div className="flex items-start justify-between gap-4 rounded-xl bg-white/70 px-4 py-3">
                                    <span className="font-semibold text-[var(--color-text)]/70">Center</span>
                                    <span className="text-right font-medium">{course.center?.name || "-"}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Link
                                    href={`/student/courses/${course.id}`}
                                    className="inline-flex items-center gap-2 rounded-lg border-2 border-[var(--color-secondary)] bg-[var(--color-secondary)] px-4 py-2 font-semibold text-white transition hover:bg-[var(--color-soft-white)] hover:text-[var(--color-secondary)]"
                                >
                                    <ExternalLink size={18} />
                                    Open Course
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}