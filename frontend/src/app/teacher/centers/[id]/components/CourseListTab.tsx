import Link from "next/link";
import { Plus, Trash2, Mail, BookOpen, Settings, Info } from "lucide-react";
import { Course } from "@/services/courseService";
import InviteTeacherModal from "./InviteTeacherModal";
import { useMemo, useState } from "react";
import DeleteCourseOtpModal from "./DeleteCourseOtpModal";
interface Props {
    courses: Course[];
    centerId: number;
    isManager: boolean;
    onUpdate: () => void;
}

export default function CourseListTab({ courses, centerId, isManager, onUpdate }: Props) {

    const [inviteCourseId, setInviteCourseId] = useState<number | null>(null);
    const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("ALL");
    const [selectedGrade, setSelectedGrade] = useState("ALL");

    const subjectOptions = useMemo(() => {
        const unique = new Map<string, string>();
        courses.forEach((course) => {
            if (course.subject?.id != null) {
                unique.set(String(course.subject.id), course.subject.name);
            }
        });
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
    }, [courses]);

    const gradeOptions = useMemo(() => {
        const unique = new Map<string, string>();
        courses.forEach((course) => {
            if (course.grade?.id != null) {
                unique.set(String(course.grade.id), course.grade.name);
            }
        });
        return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
    }, [courses]);

    const filteredCourses = useMemo(() => {
        const q = searchText.trim().toLowerCase();

        return courses.filter((course) => {
            const teacherFullName = `${course.teacher?.lastName || ""} ${course.teacher?.firstName || ""}`.trim().toLowerCase();
            const courseName = (course.name || "").toLowerCase();
            const matchesSearch =
                q.length === 0 ||
                courseName.includes(q) ||
                teacherFullName.includes(q);

            const matchesSubject =
                selectedSubject === "ALL" ||
                String(course.subject?.id || "") === selectedSubject;

            const matchesGrade =
                selectedGrade === "ALL" ||
                String(course.grade?.id || "") === selectedGrade;

            return matchesSearch && matchesSubject && matchesGrade;
        });
    }, [courses, searchText, selectedSubject, selectedGrade]);

    const deletingCourse = courses.find((course) => course.id === deletingCourseId);

    return (
        <div className="space-y-4">

            <DeleteCourseOtpModal
                isOpen={deletingCourseId !== null}
                courseId={deletingCourseId}
                courseName={deletingCourse?.name}
                onClose={() => setDeletingCourseId(null)}
                onDeleted={onUpdate}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search course or teacher"
                    className="md:col-span-2 w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
                />

                <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
                >
                    <option value="ALL">All Subjects</option>
                    {subjectOptions.map((subject) => (
                        <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                </select>

                <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full p-3 border-2 border-[var(--color-main)] rounded-lg outline-none bg-white"
                >
                    <option value="ALL">All Grades</option>
                    {gradeOptions.map((grade) => (
                        <option key={grade.id} value={grade.id}>{grade.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {filteredCourses.length === 0 ? (
                    <div className="col-span-full p-10 text-center text-gray-500 bg-white rounded-xl border">
                        {courses.length === 0
                            ? (isManager
                                ? "No courses created yet."
                                : "You haven't been assigned any courses.")
                            : "No courses match your search/filter."}
                    </div>
                ) : (
                    filteredCourses.map(course => (

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