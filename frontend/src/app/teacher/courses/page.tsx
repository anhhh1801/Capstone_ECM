"use client";

import { useEffect, useState } from "react";
import { getTeacherCourses, Course } from "@/services/courseService";
import { getMyCenters } from "@/services/centerService";
import { Plus, Search, BookOpen, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { CourseStatus, getCourseStatusClasses, getCourseStatusLabel } from "@/utils/courseStatus";

export default function CourseListPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<CourseStatus>("IN_PROGRESS");
    const [canCreateCourse, setCanCreateCourse] = useState(false);

    const statusOptions: CourseStatus[] = ["UPCOMING", "IN_PROGRESS", "ENDED"];

    const visibleCourses = courses.filter((course) => course.status === statusFilter);

    const fetchCourses = async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            const [data, managedCenters] = await Promise.all([
                getTeacherCourses(user.id),
                getMyCenters(user.id),
            ]);
            setCourses(data);
            setCanCreateCourse(managedCenters.length > 0);
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
                    Manage Courses
                </h1>

                {canCreateCourse && (
                    <Link
                        href={`/teacher/courses/create`}
                        className="flex items-center gap-2 bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition"
                    >
                        <Plus size={20} />
                        Create new course
                    </Link>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-main)]"
                    size={20}
                />
                <input
                    type="text"
                    placeholder="Search courses..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[var(--color-main)] bg-[var(--color-soft-white)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] transition"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => {
                    const isActive = statusFilter === status;

                    return (
                        <button
                            key={status}
                            type="button"
                            onClick={() => setStatusFilter(status)}
                            className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                                isActive
                                    ? "border-[var(--color-main)] bg-[var(--color-main)] text-white"
                                    : "border-[var(--color-main)] bg-[var(--color-soft-white)] text-[var(--color-main)] hover:bg-[var(--color-main)] hover:text-white"
                            }`}
                        >
                            {getCourseStatusLabel(status)}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-2 text-[var(--color-text)]">
                <BookOpen size={18} className="text-[var(--color-main)]" />
                <h2 className="text-lg font-semibold">
                    {getCourseStatusLabel(statusFilter)} Courses
                </h2>
            </div>

            {/* Table Container */}
            <div className="bg-[var(--color-soft-white)] rounded-xl shadow-sm border-2 border-[var(--color-main)] overflow-hidden">

                {loading ? (
                    <div className="p-8 text-center text-[var(--color-text)]">
                        Loading data...
                    </div>
                ) : visibleCourses.length === 0 ? (
                    <div className="p-12 text-center text-[var(--color-text)] flex flex-col items-center">
                        <BookOpen size={48} className="text-[var(--color-main)] mb-4" />
                        <p>{courses.length === 0 ? "You don't have any courses yet." : `No ${getCourseStatusLabel(statusFilter).toLowerCase()} courses to show.`}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-[var(--color-text)]">
                            <thead className="bg-[var(--color-main)] text-white uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Course name</th>
                                    <th className="px-6 py-4">Subject</th>
                                    <th className="px-6 py-4">Center</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-[var(--color-main)]/20">
                                {visibleCourses.map((course) => (
                                    <tr
                                        key={course.id}
                                        className="hover:bg-[var(--color-main)]/5 transition"
                                    >
                                        <td className="px-6 py-4 font-semibold">
                                            <div className="break-words">
                                                {course.name}
                                            </div>
                                            <span className="block text-xs text-[var(--color-text)]/70 mt-1">
                                                Grade {course.grade?.name || "-"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            {course.subject?.name || "-"}
                                        </td>

                                        <td className="px-6 py-4 break-words">
                                            {course.center?.name}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border-2 ${getCourseStatusClasses(course.status)}`}
                                            >
                                                {getCourseStatusLabel(course.status)}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/teacher/courses/${course.id}`}
                                                className="inline-flex items-center gap-1 bg-[var(--color-secondary)] text-white p-2 rounded-lg hover:bg-[var(--color-soft-white)] hover:text-[var(--color-secondary)] border-2 transition"
                                            >
                                                <ExternalLink size={22} />
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