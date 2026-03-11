import Link from "next/link";
import { Plus, Trash2, Mail, BookOpen, Settings, Info } from "lucide-react";
import { Course, deleteCourse } from "@/services/courseService";
import toast from "react-hot-toast";
import InviteTeacherModal from "./InviteTeacherModal";
import { useState } from "react";
import ConfirmModal from "@/components/ConfirmModal";
interface Props {
    courses: Course[];
    centerId: number;
    isManager: boolean;
    onUpdate: () => void;
}

export default function CourseListTab({ courses, centerId, isManager, onUpdate }: Props) {

    const [inviteCourseId, setInviteCourseId] = useState<number | null>(null);
    const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);

    const handleDelete = async (courseId: number) => {
        try {
            await deleteCourse(courseId);
            toast.success("Course deleted!");
            setDeletingCourseId(null);
            onUpdate();
        } catch {
            toast.error("Error deleting course");
        }
    };

    const deletingCourse = courses.find((course) => course.id === deletingCourseId);

    return (
        <div className="space-y-4">

            <ConfirmModal
                isOpen={deletingCourseId !== null}
                title="Delete Course"
                message={`Delete course "${deletingCourse?.name || "this course"}"?`}
                confirmText="Delete"
                onClose={() => setDeletingCourseId(null)}
                onConfirm={() => (deletingCourseId !== null ? handleDelete(deletingCourseId) : undefined)}
            />

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                    <BookOpen size={18} className="text-[var(--color-main)]" />
                    {isManager ? "Center Courses" : "Courses You Teach"}
                </h3>

                {isManager && (
                    <Link
                        href={`/teacher/courses/create?centerId=${centerId}`}
                        className="flex items-center gap-2 bg-[var(--color-main)] border-2 border-[var(--color-main)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] transition"
                    >
                        <Plus size={16} />
                        Create Course
                    </Link>
                )}
            </div>

            {/* CARD LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {courses.length === 0 ? (
                    <div className="col-span-full p-10 text-center text-gray-500 bg-white rounded-xl border">
                        {isManager
                            ? "No courses created yet."
                            : "You haven't been assigned any courses."}
                    </div>
                ) : (
                    courses.map(course => (

                        <div
                            key={course.id}
                            className="bg-[var(--color-soft-white)] border border-[var(--color-main)] shadow-sm hover:shadow-md transition flex flex-col justify-between"
                        >

                            {/* ACTIONS */}
                            <div className="flex justify-end items-center gap-2 bg-[var(--color-main)] p-2 border-b border-[var(--color-main)]">

                                <Link
                                    href={`/teacher/courses/${course.id}`}
                                    className="p-2 border-2 bg-[var(--color-secondary)] text-white border-[var(--color-secondary)] rounded hover:bg-white hover:text-[var(--color-secondary)] transition"
                                >
                                    <Info size={18} />
                                </Link>

                                {isManager && (
                                    <>
                                        <Link
                                            href={`/teacher/courses/${course.id}/edit`}
                                            className="p-2 border-2 bg-[var(--color-text)] text-white border-[var(--color-text)] rounded hover:bg-white hover:text-[var(--color-text)] transition"
                                        >
                                            <Settings size={18} />
                                        </Link>

                                        <button
                                            onClick={() => setDeletingCourseId(course.id)}
                                            className="p-2 border-2 border-[var(--color-alert)] bg-[var(--color-alert)] text-white rounded hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] transition"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </>
                                )}

                            </div>
                            {/* COURSE TITLE */}
                            <div className="p-2 flex flex-col flex-1">
                                <h4 className="font-bold text-[var(--color-text)]">
                                    {course.name}
                                </h4>

                                {/* SUBJECT */}
                                <div className="text-sm text-[var(--color-text)] mb-2">
                                    <span className="font-medium">Subject:</span>{" "}
                                    {course.subject?.name || "-"}
                                </div>

                                {/* GRADE */}
                                <div className="mb-3">
                                    {course.grade ? (
                                        <span className="px-2 py-1 rounded text-xs bg-[var(--color-secondary)]/10 text-[var(--color-main)] border border-[var(--color-secondary)]/30">
                                            {course.grade.name}
                                            {course.grade.fromAge != null &&
                                                course.grade.toAge != null && (
                                                    <span className="ml-1">
                                                        (age {course.grade.fromAge}-{course.grade.toAge})
                                                    </span>
                                                )}
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 rounded text-xs bg-[var(--color-secondary)]/10 text-[var(--color-main)] border border-[var(--color-secondary)]/30">-</span>
                                    )}
                                </div>

                                {/* TEACHER */}
                                {isManager && (
                                    <div className="text-sm mb-2">
                                        
                                        {course.teacher ? (
                                            <div className="text-[var(--color-text)]">
                                                <span className="font-medium">Teacher:</span>{" "} {course.teacher.lastName} {course.teacher.firstName}
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 italic">
                                                Not assigned
                                            </div>
                                        )}

                                        {course.invitationStatus === "PENDING" && (
                                            <div className="text-xs text-[var(--color-alert)] italic">
                                                Pending invitation
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setInviteCourseId(course.id)}
                                            className="text-xs text-[var(--color-main)] hover:underline flex items-center gap-1 mt-1"
                                        >
                                            <Mail size={12} />
                                            Change Teacher
                                        </button>

                                    </div>
                                )}
                            </div>



                        </div>

                    ))
                )}

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