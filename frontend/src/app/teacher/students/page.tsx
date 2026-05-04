"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Users, Search, Filter, Plus, UserCog } from "lucide-react";
import { getMyCenters, Center } from "@/services/centerService";
import toast from "react-hot-toast";

// Import child components
import StudentTable from "./components/StudentTable";
import {
    deleteOrRolloutStudent,
    getTeacherStudents,
    rollbackStudent,
    resetStudentPassword,
    TeacherManagedStudent,
} from "@/services/userService";
import StudentModal from "./components/StudentModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function GlobalStudentsPage() {
    const studentsPerPage = 10;
    const [studentStatus, setStudentStatus] = useState<"active" | "rolled-out">("active");
    const [studentScope, setStudentScope] = useState<"own" | "other">("own");
    // 1. STATE QUẢN LÝ DỮ LIỆU
    const [allStudents, setAllStudents] = useState<TeacherManagedStudent[]>([]); // original data
    const [filteredStudents, setFilteredStudents] = useState<TeacherManagedStudent[]>([]); // filtered data
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);

    // 2. STATE UI & FILTER
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCenterId, setSelectedCenterId] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<TeacherManagedStudent | undefined>(undefined); // Lưu học sinh đang sửa
    const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);
    const [resettingStudent, setResettingStudent] = useState<TeacherManagedStudent | null>(null);
    const [rollingBackStudent, setRollingBackStudent] = useState<TeacherManagedStudent | null>(null);

    // 3. FETCH DATA
    const fetchData = async () => {
        try {
            setLoading(true);
            const userStr = localStorage.getItem("user");
            if (!userStr) return;
            const user = JSON.parse(userStr);

            // A. Lấy danh sách trung tâm
            const resCenters = await getMyCenters(user.id);
            setCenters(resCenters);

            const teacherStudents = await getTeacherStudents(user.id, studentStatus);

            setAllStudents(teacherStudents);
            setFilteredStudents(teacherStudents);

        } catch (e) {
            console.error(e);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [studentStatus]);

    // 4. XỬ LÝ FILTER (Tìm kiếm & Lọc theo Center)
    useEffect(() => {
        let result = allStudents;

        if (studentStatus === "active") {
            result = result.filter((student) =>
                studentScope === "own" ? student.canManage : !student.canManage
            );
        }

        // Lọc theo từ khóa
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.firstName.toLowerCase().includes(lower) ||
                s.lastName.toLowerCase().includes(lower) ||
                s.email.toLowerCase().includes(lower) ||
                (s.phoneNumber && s.phoneNumber.includes(lower))
            );
        }

        // Lọc theo Center
        if (studentStatus === "active" && selectedCenterId !== "ALL") {
            if (selectedCenterId === "NONE") {
                result = result.filter(s => !s.connectedCenters || s.connectedCenters.length === 0);
            } else {
                result = result.filter(s =>
                    s.connectedCenters && s.connectedCenters.some((c) => c.id === Number(selectedCenterId))
                );
            }
        }

        setFilteredStudents(result);
        setCurrentPage(1);
    }, [searchTerm, selectedCenterId, allStudents, studentStatus, studentScope]);

    const totalPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * studentsPerPage,
        currentPage * studentsPerPage
    );

    const handleDeleteStudent = async (studentId: number) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const message = await deleteOrRolloutStudent(user.id, studentId);
            toast.success(message);
            setDeletingStudentId(null);

            // Refresh list
            setAllStudents(prev => prev.filter(s => s.id !== studentId));
            setFilteredStudents(prev => prev.filter(s => s.id !== studentId));
        } catch (e) {
            if (axios.isAxiosError(e)) {
                toast.error(String(e.response?.data || "Unable to update student."));
            } else {
                toast.error("Unable to update student.");
            }
        }
    };

    const handleResetPassword = async (student: TeacherManagedStudent) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const message = await resetStudentPassword(user.id, student.id);
            toast.success(`${message} Login: ${student.email}`);
            setResettingStudent(null);
        } catch (e) {
            if (axios.isAxiosError(e)) {
                toast.error(String(e.response?.data || "Unable to reset password."));
            } else {
                toast.error("Unable to reset password.");
            }
        }
    };

    const handleRollbackStudent = async (student: TeacherManagedStudent) => {
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const message = await rollbackStudent(user.id, student.id);
            toast.success(message);
            setRollingBackStudent(null);
            setAllStudents(prev => prev.filter(s => s.id !== student.id));
            setFilteredStudents(prev => prev.filter(s => s.id !== student.id));
        } catch (e) {
            if (axios.isAxiosError(e)) {
                toast.error(String(e.response?.data || "Unable to rollback student."));
            } else {
                toast.error("Unable to rollback student.");
            }
        }
    };

    const deletingStudent = allStudents.find((s) => s.id === deletingStudentId);

    // Hàm mở modal Create
    const openCreateModal = () => {
        setEditingStudent(undefined); // undefined = Create Mode
        setModalOpen(true);
    }

    // Hàm mở modal Edit
    const openEditModal = (student: any) => {
        setEditingStudent(student); // Object = Edit Mode
        setModalOpen(true);
    }

    const refreshData = () => {
        fetchData(); // Hàm fetch cũ của bạn
    }


    return (
        <div className="space-y-6 mx-auto">

            <ConfirmModal
                isOpen={deletingStudentId !== null}
                title="Roll Out Student"
                message={`Roll out "${deletingStudent?.lastName || ""} ${deletingStudent?.firstName || ""}"? This disables the account, removes current center links, clears enrollments, and hides the student from active lists.`}
                confirmText="Roll Out"
                onClose={() => setDeletingStudentId(null)}
                onConfirm={() => (deletingStudentId !== null ? handleDeleteStudent(deletingStudentId) : undefined)}
            />

            <ConfirmModal
                isOpen={!!resettingStudent}
                title="Reset Student Password"
                message={`Reset the password for "${resettingStudent?.lastName || ""} ${resettingStudent?.firstName || ""}" to the default password \"ecm123\"?`}
                confirmText="Reset Password"
                onClose={() => setResettingStudent(null)}
                onConfirm={() => (resettingStudent ? handleResetPassword(resettingStudent) : undefined)}
            />

            <ConfirmModal
                isOpen={!!rollingBackStudent}
                title="Rollback Student"
                message={`Restore "${rollingBackStudent?.lastName || ""} ${rollingBackStudent?.firstName || ""}" back to the active student list?`}
                confirmText="Rollback"
                onClose={() => setRollingBackStudent(null)}
                onConfirm={() => (rollingBackStudent ? handleRollbackStudent(rollingBackStudent) : undefined)}
            />

            {/* HEADER */}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                <div>

                    <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
                        <Users className="text-[var(--color-main)]" />
                        Manage Students
                    </h1>

                    <p className="text-sm text-[var(--color-text)]">
                        {studentStatus === "active"
                            ? studentScope === "own"
                                ? "Shows students you created or directly manage."
                                : "Shows students who joined your courses but are managed by another teacher."
                            : "Shows rolled out students created by you. Students can only be restored from here."}
                    </p>

                </div>

                {studentStatus === "active" && (
                    <button
                        onClick={openCreateModal}
                        className="
                    flex items-center gap-2
                    px-4 py-2 rounded-lg font-semibold
                    border-2 border-[var(--color-main)]
                    bg-[var(--color-main)] text-white
                    hover:bg-white hover:text-[var(--color-main)]
                    transition"
                    >
                        <Plus size={18} />
                        Add New Student
                    </button>
                )}

            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => {
                        setStudentStatus("active");
                        setStudentScope("own");
                        setSelectedCenterId("ALL");
                    }}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                        studentStatus === "active"
                            ? "border-[var(--color-main)] bg-[var(--color-main)] text-white"
                            : "border-[var(--color-main)] text-[var(--color-main)] hover:bg-[var(--color-main)] hover:text-white"
                    }`}
                >
                    Active Students
                </button>

                <button
                    onClick={() => {
                        setStudentStatus("rolled-out");
                        setStudentScope("own");
                        setSelectedCenterId("ALL");
                    }}
                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition ${
                        studentStatus === "rolled-out"
                            ? "border-[var(--color-alert)] bg-[var(--color-alert)] text-white"
                            : "border-[var(--color-alert)] text-[var(--color-alert)] hover:bg-[var(--color-alert)] hover:text-white"
                    }`}
                >
                    Rolled Out Students
                </button>
            </div>

            {/* TOOLBAR */}

            <div className="
            bg-[var(--color-soft-white)]
            border border-[var(--color-main)]
            p-4 rounded-xl shadow-sm
            flex flex-col md:flex-row gap-4
        ">

                {/* SEARCH */}

                <div className="relative flex-1">

                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]"
                        size={18}
                    />

                    <input
                        type="text"
                        placeholder="Search name, email, phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="
                    w-full pl-10 pr-4 py-2 text-sm
                    border border-[var(--color-main)]
                    rounded-lg outline-none
                    focus:ring-2 focus:ring-[var(--color-secondary)]
                    "
                    />

                </div>


                {/* FILTER */}

                {studentStatus === "active" && studentScope === "own" && (
                <div className="relative min-w-[220px]">

                    <Filter
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]"
                        size={18}
                    />

                    <select
                        title="Select Center"
                        value={selectedCenterId}
                        onChange={(e) => setSelectedCenterId(e.target.value)}
                        className="
                    w-full pl-10 pr-8 py-2 text-sm
                    border border-[var(--color-main)]
                    rounded-lg outline-none
                    focus:ring-2 focus:ring-[var(--color-secondary)]
                    bg-white appearance-none cursor-pointer
                    "
                    >

                        <option value="ALL">All Centers</option>

                        {centers.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}

                        <option value="NONE">
                            Unassigned Students
                        </option>

                    </select>

                </div>
                )}

            </div>


            {/* TABLE */}

            {studentStatus === "active" && (
                <div className="border-b border-[var(--color-text)]">
                    <div className="flex flex-wrap gap-6">
                        <button
                            onClick={() => {
                                setStudentScope("own");
                                setSelectedCenterId("ALL");
                            }}
                            className={`px-4 py-2 font-medium flex items-center gap-2 border-b-4 border-r-2 transition ${
                                studentScope === "own"
                                    ? "border-[var(--color-main)] text-[var(--color-main)]"
                                    : "border-transparent text-[var(--color-text)] hover:text-[var(--color-secondary)]"
                            }`}
                        >
                            <Users size={18} /> My Students
                        </button>

                        <button
                            onClick={() => {
                                setStudentScope("other");
                                setSelectedCenterId("ALL");
                            }}
                            className={`px-4 py-2 font-medium flex items-center gap-2 border-b-4 border-r-2 transition ${
                                studentScope === "other"
                                    ? "border-[var(--color-main)] text-[var(--color-main)]"
                                    : "border-transparent text-[var(--color-text)] hover:text-[var(--color-secondary)]"
                            }`}
                        >
                            <UserCog size={18} /> Other Teachers' Students
                        </button>
                    </div>
                </div>
            )}

            <StudentTable
                students={paginatedStudents}
                loading={loading}
                onDelete={studentStatus === "active" && studentScope === "own" ? (studentId) => setDeletingStudentId(studentId) : undefined}
                onResetPassword={studentStatus === "active" && studentScope === "own" ? (student) => setResettingStudent(student) : undefined}
                onRollback={studentStatus === "rolled-out" ? (student) => setRollingBackStudent(student) : undefined}
                onEdit={studentStatus === "active" && studentScope === "own" ? openEditModal : undefined}
                deleteLabel="Roll Out"
            />

            {!loading && filteredStudents.length > 0 && (
                <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-main)]/15 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-[var(--color-text)]">
                        Showing {(currentPage - 1) * studentsPerPage + 1}
                        {" - "}
                        {Math.min(currentPage * studentsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                    </p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg border border-[var(--color-main)] px-3 py-2 text-sm font-medium text-[var(--color-main)] transition hover:bg-[var(--color-main)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--color-main)]"
                        >
                            Previous
                        </button>

                        <span className="min-w-[90px] text-center text-sm font-semibold text-[var(--color-text)]">
                            Page {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-lg border border-[var(--color-main)] px-3 py-2 text-sm font-medium text-[var(--color-main)] transition hover:bg-[var(--color-main)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[var(--color-main)]"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}


            {/* MODAL */}

            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={refreshData}
                studentToEdit={editingStudent}
            />

        </div>
    );
}