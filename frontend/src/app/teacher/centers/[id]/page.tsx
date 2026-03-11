"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User } from "@/services/authService";
import api from "@/utils/axiosConfig";
import { Course } from "@/services/courseService";
import { removeStudentFromCenter } from "@/services/userService";
import toast from "react-hot-toast";
import { UserPlus, Users, Mail, Phone, BookOpen, Unlink } from "lucide-react";
import Link from "next/link";

import CenterHeader from "./components/CenterHeader";
import CenterTabs from "./components/CenterTabs";
import CourseListTab from "./components/CourseListTab";
import TeacherListTab from "./components/TeacherListTab";
import SubjectListTab from "./components/SubjectListTab";
import GradeListTab from "./components/GradeListTab";
import AssignStudentModal from "./components/AssignStudentModal";
import ClassroomTab from "./components/ClassroomTab";

type StudentCenterCard = User & {
    courses: { id: number; name: string }[];
};

export default function CenterDetailPage() {
    const params = useParams();
    const centerId = Number(params.id);

    const [centerInfo, setCenterInfo] = useState<any>(null);
    const [isManager, setIsManager] = useState(false);
    const [activeTab, setActiveTab] = useState<"courses" | "students" | "teachers" | "subjects" | "grades" | "classrooms">("courses");
    const [loading, setLoading] = useState(true);

    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [centerStudents, setCenterStudents] = useState<StudentCenterCard[]>([]);

    const [isAssignModalOpen, setAssignModalOpen] = useState(false);

    const fetchData = async () => {
        if (!centerId) return;

        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);

        try {
            setLoading(true);

            const resCenter = await api.get(`/centers/${centerId}`);
            setCenterInfo(resCenter.data);

            const managerCheck = resCenter.data.manager.id === user.id;
            setIsManager(managerCheck);

            const resCourses = await api.get(`/courses?centerId=${centerId}`);
            let fetchedCourses = resCourses.data;

            if (!managerCheck) {
                fetchedCourses = fetchedCourses.filter(
                    (c: Course) => c.teacher.id === user.id
                );
            }

            setCourses(fetchedCourses);

            const resStudents = await api.get(`/centers/${centerId}/students`);
            const students = resStudents.data ?? [];

            // Build student -> courses map for this center by querying each course's members.
            const courseMembers = await Promise.all(
                fetchedCourses.map(async (course: Course) => {
                    try {
                        const res = await api.get(`/courses/${course.id}/students`);
                        return {
                            courseId: course.id,
                            courseName: course.name,
                            students: res.data as Array<{ id: number }>,
                        };
                    } catch {
                        return {
                            courseId: course.id,
                            courseName: course.name,
                            students: [] as Array<{ id: number }>,
                        };
                    }
                })
            );

            const studentCoursesMap = new Map<number, { id: number; name: string }[]>();
            for (const cm of courseMembers) {
                for (const st of cm.students) {
                    const list = studentCoursesMap.get(st.id) ?? [];
                    list.push({ id: cm.courseId, name: cm.courseName });
                    studentCoursesMap.set(st.id, list);
                }
            }

            const cardStudents: StudentCenterCard[] = students.map((s: User) => ({
                ...s,
                courses: studentCoursesMap.get(s.id) ?? [],
            }));

            setCenterStudents(cardStudents);

            if (managerCheck) {
                const resTeachers = await api.get(`/centers/${centerId}/teachers`);
                setTeachers(resTeachers.data);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [centerId]);

    const handleRemoveStudent = async (studentId: number) => {
        if (!confirm("Remove student from this center?")) return;

        try {
            await removeStudentFromCenter(centerId, studentId);
            toast.success("Student removed!");
            fetchData();
        } catch {
            toast.error("Error removing student");
        }
    };

    if (loading)
        return (
            <div className="p-10 text-center text-[var(--color-text)]">
                Loading center data...
            </div>
        );

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <CenterHeader center={centerInfo} isManager={isManager} />

            {/* TABS */}
            <div className="bg-[var(--color-soft-white)] p-4 rounded-xl">
                <CenterTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isManager={isManager}
                />
            </div>

            {/* CONTENT */}
            <div className="bg-[var(--color-soft-white)] p-6 rounded-xl border border-[var(--color-main)] min-h-[350px]">

                {activeTab === "courses" && (
                    <CourseListTab
                        courses={courses}
                        centerId={centerId}
                        isManager={isManager}
                        onUpdate={fetchData}
                    />
                )}

                {activeTab === "subjects" && (
                    <SubjectListTab centerId={centerId} isManager={isManager} />
                )}

                {activeTab === "grades" && (
                    <GradeListTab centerId={centerId} isManager={isManager} />
                )}

                {activeTab === "classrooms" && (
                    <ClassroomTab centerId={centerId} isManager={isManager} />
                )}

                {activeTab === "teachers" && (
                    <TeacherListTab
                        teachers={teachers}
                        isManager={isManager}
                    />
                )}

                {activeTab === "students" && (
                    <div>

                        {/* STUDENT HEADER */}
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-[var(--color-text)] flex items-center gap-2">
                                <Users size={18} className="text-[var(--color-main)]" />
                                Student List ({centerStudents.length})
                            </h3>

                            <div className="flex gap-2">

                                <button
                                    onClick={() => setAssignModalOpen(true)}
                                    className="flex items-center gap-2 whitespace-nowrap border-2 border-[var(--color-main)] text-[var(--color-main)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-main)] hover:text-white transition"
                                >
                                    <UserPlus size={16} />
                                    Assign Existing Student
                                </button>

                            </div>
                        </div>

                        {/* STUDENT CARD LIST */}
                        <div className="grid grid-cols-4 lg:grid-cols-4 gap-4">
                            {centerStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className="rounded-xl border border-[var(--color-main)]/30 bg-white p-4"
                                >
                                    <div className="flex items-start justify-between gap-3 border-b-2 border-[var(--color-main)] pb-1">
                                        <div>
                                            <h4 className="font-bold text-[var(--color-text)]">
                                                {student.lastName} {student.firstName}
                                            </h4>
                                            <p className="text-xs text-gray-500">ID: {student.id}</p>
                                        </div>

                                        <button
                                            onClick={() => handleRemoveStudent(student.id)}
                                            className="p-2 border-2 border-[var(--color-alert)] bg-[var(--color-alert)] text-white rounded hover:bg-[var(--color-soft-white)] hover:text-[var(--color-alert)] transition"
                                            title="Remove from center"
                                        >
                                            <Unlink size={16} />
                                        </button>
                                    </div>

                                    <div className="mt-3 space-y-2 text-sm text-[var(--color-text)]">
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-[var(--color-main)]" />
                                            <span>{student.email}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-[var(--color-main)]" />
                                            <span>{student.phoneNumber || "---"}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-sm font-semibold text-[var(--color-text)] mb-2 flex items-center gap-2">
                                            <BookOpen size={14} className="text-[var(--color-main)]" />
                                            Courses
                                        </p>

                                        {student.courses.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {student.courses.map((course) => (
                                                    <Link
                                                        key={course.id}
                                                        href={`/teacher/courses/${course.id}`}
                                                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium border border-[var(--color-secondary)]/30 bg-[var(--color-secondary)]/10 text-[var(--color-main)] hover:bg-[var(--color-main)] hover:text-white transition"
                                                    >
                                                        {course.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs italic text-gray-400">No courses</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                )}
            </div>

            {/* MODALS */}
            <AssignStudentModal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                centerId={centerId}
                onSuccess={fetchData}
            />

        </div>
    );
}