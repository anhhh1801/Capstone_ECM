"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { User } from "@/services/authService";
import api from "@/utils/axiosConfig";
import { Course } from "@/services/courseService";
import { removeStudentFromCenter } from "@/services/userService";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

// COMPONENTS
import CenterHeader from "./components/CenterHeader";
import CenterTabs from "./components/CenterTabs";
import CourseListTab from "./components/CourseListTab";
import TeacherListTab from "./components/TeacherListTab";
import StudentTable from "../../students/components/StudentTable";
import StudentModal from "../../students/components/StudentModal";
import AssignStudentModal from "./components/AssignStudentModal";

export default function CenterDetailPage() {
    const params = useParams();
    const centerId = Number(params.id);

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [centerInfo, setCenterInfo] = useState<any>(null);
    const [isManager, setIsManager] = useState(false);
    const [activeTab, setActiveTab] = useState<"courses" | "students" | "teachers">("courses");
    const [loading, setLoading] = useState(true);

    const [courses, setCourses] = useState<Course[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [centerStudents, setCenterStudents] = useState<User[]>([]);

    // Modal State
    const [isStudentModalOpen, setStudentModalOpen] = useState(false);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null);

    // 1. FETCH DATA
    const fetchData = async () => {
        if (!centerId) return;
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const user = JSON.parse(userStr);
        setCurrentUser(user);

        try {
            setLoading(true);
            const resCenter = await api.get(`/centers/${centerId}`);
            setCenterInfo(resCenter.data);
            const managerCheck = resCenter.data.manager.id === user.id;
            setIsManager(managerCheck);

            const resCourses = await api.get(`/courses?centerId=${centerId}`);
            let fetchedCourses = resCourses.data;
            if (!managerCheck) {
                fetchedCourses = fetchedCourses.filter((c: Course) => c.teacher.id === user.id);
            }
            setCourses(fetchedCourses);

            const resStudents = await api.get(`/centers/${centerId}/students`);
            setCenterStudents(resStudents.data);

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
        if (!confirm("Gỡ học sinh khỏi trung tâm này?")) return;
        try {
            await removeStudentFromCenter(centerId, studentId);
            toast.success("Đã gỡ học sinh!");
            fetchData();
        } catch (e) { toast.error("Lỗi khi gỡ"); }
    };

    if (loading) return <div className="p-10 text-center">Đang tải...</div>;

    return (
        <div className="space-y-6">
            <CenterHeader center={centerInfo} isManager={isManager} />

            <CenterTabs activeTab={activeTab} setActiveTab={setActiveTab as any} isManager={isManager} />

            <div className="min-h-[300px]">
                {activeTab === "courses" && (
                    <CourseListTab
                        courses={courses}
                        centerId={centerId}
                        isManager={isManager}
                        onUpdate={fetchData}
                    />
                )}

                {activeTab === "teachers" && (
                    <TeacherListTab teachers={teachers} isManager={isManager} />
                )}

                {activeTab === "students" && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-700">Danh sách Học viên ({centerStudents.length})</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setAssignModalOpen(true)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100">
                                    + Tìm có sẵn
                                </button>
                                <button
                                    onClick={() => { setEditingStudent(null); setStudentModalOpen(true); }}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2"
                                >
                                    <UserPlus size={16} /> Tạo mới
                                </button>
                            </div>
                        </div>

                        <StudentTable
                            students={centerStudents}
                            loading={false}
                            onDelete={handleRemoveStudent}
                            deleteLabel="Gỡ"
                            onEdit={(student) => { setEditingStudent(student); setStudentModalOpen(true); }}
                        />
                    </div>
                )}
            </div>

            {/* MODALS */}
            <StudentModal
                isOpen={isStudentModalOpen}
                onClose={() => setStudentModalOpen(false)}
                onSuccess={fetchData}
                studentToEdit={editingStudent}
                preSelectedCenterId={centerId}
            />

            <AssignStudentModal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                centerId={centerId}
                onSuccess={fetchData}
            />
        </div>
    );
}