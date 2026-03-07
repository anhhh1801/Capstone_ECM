import Link from "next/link";
import { Plus, Trash2, Mail, BookOpen, Settings, Info } from "lucide-react";
import { Course, deleteCourse } from "@/services/courseService";
import toast from "react-hot-toast";
import InviteTeacherModal from "./InviteTeacherModal";
import { useState } from "react";
interface Props {
    courses: Course[];
    centerId: number;
    isManager: boolean;
    onUpdate: () => void;
}

export default function CourseListTab({ courses, centerId, isManager, onUpdate }: Props) {

    const [inviteCourseId, setInviteCourseId] = useState<number | null>(null);

    const handleDelete = async (courseId: number) => {
        if (!confirm("Delete this course?")) return;
        try {
            await deleteCourse(courseId);
            toast.success("Course deleted!");
            onUpdate();
        } catch {
            toast.error("Error deleting course");
        }
    };

    return (
        <div className="space-y-4">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                    <BookOpen size={18} className="text-[var(--color-main)]" />
                    {isManager ? "Center Courses" : "Courses You Teach"}
                </h3>

                {isManager && (
                    <Link
                        href={`/teacher/courses/create?centerId=${centerId}`}
                        className="flex items-center gap-2 bg-[var(--color-main)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-secondary)] transition"
                    >
                        <Plus size={16} />
                        Create Course
                    </Link>
                )}
            </div>

            {/* TABLE */}
            <div className="bg-[var(--color-soft-white)] rounded-xl border border-[var(--color-main)] shadow-sm overflow-hidden">

                <table className="w-full text-left text-sm">

                    {/* HEADER */}
                    <thead className="bg-[var(--color-main)] text-white uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4">Course</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Grade</th>
                            {isManager && <th className="px-6 py-4">Teacher</th>}
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">

                        {courses.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-10 text-center text-gray-500">
                                    {isManager
                                        ? "No courses created yet."
                                        : "You haven't been assigned any courses."}
                                </td>
                            </tr>
                        ) : (
                            courses.map(course => (

                                <tr
                                    key={course.id}
                                    className="hover:bg-blue-50 transition"
                                >

                                    {/* COURSE */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[var(--color-text)]">
                                                {course.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ID: {course.id}
                                            </span>
                                        </div>
                                    </td>

                                    {/* SUBJECT */}
                                    <td className="px-6 py-4 text-[var(--color-text)]">
                                        {course.subject}
                                    </td>

                                    {/* GRADE */}
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded text-xs bg-[var(--color-secondary)]/10 text-[var(--color-main)] border border-[var(--color-secondary)]/30">
                                            Grade {course.grade}
                                        </span>
                                    </td>

                                    {/* TEACHER */}
                                    {isManager && (
                                        <td className="px-6 py-4">

                                            <div className="flex flex-col text-sm">

                                                {course.teacher ? (
                                                    <span className="font-medium text-[var(--color-text)]">
                                                        {course.teacher.lastName} {course.teacher.firstName}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic">
                                                        Not assigned
                                                    </span>
                                                )}

                                                {course.invitationStatus === "PENDING" && (
                                                    <span className="text-xs text-[var(--color-alert)] italic">
                                                        Pending invitation
                                                    </span>
                                                )}

                                                <button
                                                    onClick={() => setInviteCourseId(course.id)}
                                                    className="text-xs text-[var(--color-main)] hover:underline flex items-center gap-1 mt-1"
                                                >
                                                    <Mail size={12} />
                                                    Change Teacher
                                                </button>
                                            </div>

                                        </td>
                                    )}

                                    {/* ACTIONS */}
                                    <td className="px-6 py-4 text-right">

                                        <div className="flex justify-end items-center gap-2">

                                            <Link
                                                href={`/teacher/courses/${course.id}`}
                                                className="p-1 border-2 bg-[var(--color-secondary)] hover:bg-[var(--color-main)] text-[var(--color-soft-white)] hover:bg-[var(--color-soft-white)] hover:text-[var(--color-secondary)] hover:border-2 border-[var(--color-secondary)] rounded transition"
                                            >
                                                <Info size={24} />
                                            </Link>

                                            {isManager && (
                                                <>
                                                    <Link
                                                        href={`/teacher/courses/${course.id}/edit`}
                                                        className="p-1 border-2 bg-[var(--color-text)] hover:bg-[var(--color-main)] text-[var(--color-soft-white)] hover:bg-[var(--color-soft-white)] hover:text-[var(--color-text)] hover:border-2 border-[var(--color-text)] rounded transition"
                                                    >
                                                        <Settings size={24} />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(course.id)}
                                                        className="p-2 bg-[var(--color-alert)] hover:bg-[var(--color-main)] text-[var(--color-soft-white)] hover:bg-red-700 rounded transition"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </>
                                            )}

                                        </div>

                                    </td>

                                </tr>

                            ))
                        )}

                    </tbody>
                </table>
            </div>

            {/* CHANGE TEACHER MODAL */}
            {isManager && (
                <InviteTeacherModal
                    courseId={inviteCourseId}
                    centerId={centerId}
                    isOpen={inviteCourseId !== null}
                    onClose={() => setInviteCourseId(null)}
                    onSuccess={onUpdate}
                />
            )}

        </div>

    );
}