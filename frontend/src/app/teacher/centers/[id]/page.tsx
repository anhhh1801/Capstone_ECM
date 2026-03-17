"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User } from "@/services/authService";
import api from "@/utils/axiosConfig";
import { Course } from "@/services/courseService";

import CenterHeader from "./components/CenterHeader";
import CenterTabs from "./components/CenterTabs";
import CourseListTab from "./components/CourseListTab";
import TeacherListTab from "./components/TeacherListTab";
import SubjectListTab from "./components/SubjectListTab";
import GradeListTab from "./components/GradeListTab";
import ClassroomTab from "./components/ClassroomTab";
import ClassSlotTab from "./components/ClassSlotTab";
import StudentTab from "./components/StudentTab";

type StudentCenterCard = User & {
    courses: { id: number; name: string }[];
};

export default function CenterDetailPage() {
    const params = useParams();
    const centerId = Number(params.id);

    const [centerInfo, setCenterInfo] = useState<any>(null);
    const [isManager, setIsManager] = useState(false);
    const [activeTab, setActiveTab] = useState<"courses" | "students" | "teachers" | "subjects" | "grades" | "classrooms" | "class-slots">("courses");
    const [loading, setLoading] = useState(true);

    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [centerStudents, setCenterStudents] = useState<StudentCenterCard[]>([]);

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

                {activeTab === "class-slots" && (
                    <ClassSlotTab centerId={centerId} isManager={isManager} />
                )}

                {activeTab === "teachers" && (
                    <TeacherListTab
                        centerId={centerId}
                        teachers={teachers}
                        isManager={isManager}
                        onUpdate={fetchData}
                    />
                )}

                {activeTab === "students" && (
                    <StudentTab
                        centerId={centerId}
                        students={centerStudents}
                        isManager={isManager}
                        onUpdate={fetchData}
                    />
                )}
            </div>

        </div>
    );
}