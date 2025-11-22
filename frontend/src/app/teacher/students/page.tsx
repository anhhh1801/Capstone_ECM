"use client";

import { useEffect, useState } from "react";
import { Users, Search, Filter, Plus } from "lucide-react";
import api from "@/utils/axiosConfig";
import { getMyCenters, Center } from "@/services/centerService";
import toast from "react-hot-toast";

// Import các Component con
import StudentTable from "./components/StudentTable";
import { deleteStudent } from "@/services/userService";
import StudentModal from "./components/StudentModal";

export default function GlobalStudentsPage() {
    // 1. STATE QUẢN LÝ DỮ LIỆU
    const [allStudents, setAllStudents] = useState<any[]>([]); // Data gốc
    const [filteredStudents, setFilteredStudents] = useState<any[]>([]); // Data sau khi lọc
    const [centers, setCenters] = useState<Center[]>([]);
    const [loading, setLoading] = useState(true);

    // 2. STATE UI & FILTER
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCenterId, setSelectedCenterId] = useState<string>("ALL");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [isModalOpen, setModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null); // Lưu học sinh đang sửa

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
            for (const center of resCenters) {
                try {
                    const res = await api.get(`/centers/${center.id}/students`);
                    // Gán thêm thông tin center vào student để hiển thị
                    const studentsWithCenter = res.data.map((s: any) => ({
                        ...s,
                        // Backend đang trả về User, cần đảm bảo User có field connectedCenters
                        // Nếu chưa có, ta tạm thời manual push vào ở frontend (hơi hack não xíu)
                    }));
                    aggregatedStudents = [...aggregatedStudents, ...studentsWithCenter];
                } catch (e) { }
            }

            // Khử trùng lặp (Vì 1 em học 2 center sẽ bị fetch 2 lần)
            const uniqueStudents = Array.from(new Map(aggregatedStudents.map(item => [item.id, item])).values());

            setAllStudents(uniqueStudents);
            setFilteredStudents(uniqueStudents);

        } catch (e) {
            console.error(e);
            toast.error("Lỗi tải dữ liệu");
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
        const confirmMsg = "CẢNH BÁO: Hành động này sẽ xóa VĨNH VIỄN tài khoản học sinh và toàn bộ dữ liệu học tập liên quan.\n\nBạn có chắc chắn không?";
        if (!confirm(confirmMsg)) return;

        try {
            await deleteStudent(studentId);
            toast.success("Đã xóa vĩnh viễn!");

            // Cập nhật lại list
            setAllStudents(prev => prev.filter(s => s.id !== studentId));
        } catch (e) {
            toast.error("Không thể xóa (Có thể do dữ liệu ràng buộc)");
        }
    };

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
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="text-blue-600" /> Quản lý Học viên (Bể chung)
                    </h1>
                    <p className="text-gray-500 text-sm">Tổng hợp học viên từ tất cả chi nhánh của bạn</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-sm transition"
                >
                    <Plus size={20} /> Thêm Học viên Mới
                </button>
            </div>

            {/* TOOLBAR (Search & Filter) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4">
                {/* Search Box */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm tên, email, số điện thoại..."
                        className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filter Dropdown */}
                <div className="relative min-w-[200px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        className="w-full pl-10 pr-8 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
                        value={selectedCenterId}
                        onChange={(e) => setSelectedCenterId(e.target.value)}
                    >
                        <option value="ALL">Tất cả Trung tâm</option>
                        {centers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                        <option value="NONE">Học viên tự do (Chưa gán)</option>
                    </select>
                </div>
            </div>

            {/* TABLE COMPONENT (Tách biệt hoàn toàn) */}
            <StudentTable
                students={filteredStudents}
                loading={loading}
                onDelete={handleDeletePermanently}
                onEdit={openEditModal} // <--- Truyền hàm mở modal edit
            />

            {/* MODAL COMPONENT */}
            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSuccess={refreshData}
                studentToEdit={editingStudent}
            />
        </div>
    );
}