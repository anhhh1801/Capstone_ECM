"use client";

import { useEffect, useState } from "react";
import { Users, Search, Filter, Plus } from "lucide-react";
import api from "@/utils/axiosConfig";
import { getMyCenters, Center } from "@/services/centerService";
import toast from "react-hot-toast";

// Import child components
import StudentTable from "./components/StudentTable";
import { deleteStudent } from "@/services/userService";
import StudentModal from "./components/StudentModal";
import ConfirmModal from "@/components/ConfirmModal";

export default function GlobalStudentsPage() {
    // 1. STATE QUẢN LÝ DỮ LIỆU
    const [allStudents, setAllStudents] = useState<any[]>([]); // original data
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]); // filtered data
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);

    // 2. STATE UI & FILTER
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCenterId, setSelectedCenterId] = useState<string>("ALL");

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null); // Lưu học sinh đang sửa
    const [deletingStudentId, setDeletingStudentId] = useState<number | null>(null);

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

            // B. Lấy danh sách TẤT CẢ học sinh (Cần Backend API hỗ trợ)
            // Tạm thời: Loop qua các centers để lấy và gộp lại (Cách tạm bợ)
            // Hoặc lý tưởng nhất: api.get(`/users/my-students?managerId=${user.id}`)
            // Giả sử ta có API mock hoặc dùng cách gộp:

            let aggregatedStudents: any[] = [];

            // --- CÁCH 1: Lấy từ từng center gộp lại (Hơi chậm nhưng chắc chắn có data lúc này) ---
            // Build a map by student ID so we can merge connectedCenters across centers
            const studentMap = new Map<number, any>();

            for (const center of resCenters) {
                try {
                    const res = await api.get(`/centers/${center.id}/students`);
                    for (const s of res.data) {
                        const existing = studentMap.get(s.id);
                        const baseStudent = {
                            ...s,
                            connectedCenters: s.connectedCenters ?? []
                        };

                        const centerInfo = { id: center.id, name: center.name };
                        const hasCenterAlready = baseStudent.connectedCenters.some((c: any) => c.id === center.id);

                        const mergedCenters = hasCenterAlready
                            ? baseStudent.connectedCenters
                            : [...baseStudent.connectedCenters, centerInfo];

                        if (existing) {
                            // Merge with existing record (avoid duplicates)
                            const existingCenters = existing.connectedCenters ?? [];
                            const combinedCenters = [...existingCenters];
                            if (!combinedCenters.some((c: any) => c.id === center.id)) {
                                combinedCenters.push(centerInfo);
                            }

                            studentMap.set(s.id, {
                                ...existing,
                                ...baseStudent,
                                connectedCenters: combinedCenters,
                            });
                        } else {
                            studentMap.set(s.id, {
                                ...baseStudent,
                                connectedCenters: mergedCenters,
                            });
                        }
                    }
                } catch (e) { }
            }

            const uniqueStudents = Array.from(studentMap.values());

            setAllStudents(uniqueStudents);
            setFilteredStudents(uniqueStudents);

        } catch (e) {
            console.error(e);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 4. XỬ LÝ FILTER (Tìm kiếm & Lọc theo Center)
    useEffect(() => {
        let result = allStudents;

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
        if (selectedCenterId !== "ALL") {
            result = result.filter(s =>
                s.connectedCenters && s.connectedCenters.some((c: any) => c.id === Number(selectedCenterId))
            );
        }

        setFilteredStudents(result);
    }, [searchTerm, selectedCenterId, allStudents]);

    const handleDeletePermanently = async (studentId: number) => {
        try {
            await deleteStudent(studentId);
            toast.success("Permanently deleted!");
            setDeletingStudentId(null);

            // Refresh list
            setAllStudents(prev => prev.filter(s => s.id !== studentId));
            setFilteredStudents(prev => prev.filter(s => s.id !== studentId));
        } catch (e) {
            toast.error("Unable to delete (may be due to data constraints)");
        }
    };

    const deletingStudent = allStudents.find((s) => s.id === deletingStudentId);

    // Hàm mở modal Create
    const openCreateModal = () => {
        setEditingStudent(null); // Null = Create Mode
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
                title="Permanently Delete Student"
                message={`This will permanently delete "${deletingStudent?.lastName || ""} ${deletingStudent?.firstName || ""}" and related study data. Continue?`}
                confirmText="Delete Permanently"
                onClose={() => setDeletingStudentId(null)}
                onConfirm={() => (deletingStudentId !== null ? handleDeletePermanently(deletingStudentId) : undefined)}
            />

            {/* HEADER */}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                <div>

                    <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
                        <Users className="text-[var(--color-main)]" />
                        Manage Students
                    </h1>

                    <p className="text-sm text-[var(--color-text)]">
                        Aggregates students from all your centers
                    </p>

                </div>

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

                <div className="relative min-w-[220px]">

                    <Filter
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary)]"
                        size={18}
                    />

                    <select
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

            </div>


            {/* TABLE */}

            <StudentTable
                students={filteredStudents}
                loading={loading}
                onDelete={(studentId) => setDeletingStudentId(studentId)}
                onEdit={openEditModal}
            />


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