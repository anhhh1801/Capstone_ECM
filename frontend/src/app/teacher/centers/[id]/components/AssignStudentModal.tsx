"use client";

import { useState } from "react";
import { X, Search, UserPlus } from "lucide-react";
import api from "@/utils/axiosConfig";
import toast from "react-hot-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    centerId: number;
    onSuccess: () => void; // Reload list sau khi add
}

export default function AssignStudentModal({ isOpen, onClose, centerId, onSuccess }: Props) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    if (!isOpen) return null;

    // 1. Tìm kiếm trong bể chung (API này bạn cần viết bên Backend: tìm theo email/sđt)
    // Tạm thời tôi giả định bạn dùng API get all students hoặc API search user
    const handleSearch = async () => {
        if (!searchTerm) return;
        setSearching(true);
        try {
            // Ví dụ gọi API search user theo email/phone
            // GET /api/users/search?keyword=...
            // Tạm thời dùng logic mock hoặc API search bạn tự viết
            // const res = await api.get(`/users/search?q=${searchTerm}&role=STUDENT`);

            // Mock tạm để demo UI
            setResults([
                { id: 99, firstName: "Test", lastName: "User", email: searchTerm, phoneNumber: "0999" }
            ]);
        } catch (e) {
            toast.error("Không tìm thấy");
        } finally {
            setSearching(false);
        }
    };

    // 2. Gán vào trung tâm
    const handleAssign = async (studentId: number) => {
        try {
            await api.post(`/centers/${centerId}/assign-student?studentId=${studentId}`);
            toast.success("Đã thêm vào trung tâm!");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Lỗi: Học sinh này có thể đã ở trong trung tâm rồi");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden min-h-[300px]">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">Tìm học sinh từ Bể chung</h3>
                    <button onClick={onClose}><X size={20} /></button>
                </div>
                <div className="p-4">
                    <div className="flex gap-2 mb-4">
                        <input
                            className="flex-1 p-2 border rounded"
                            placeholder="Nhập chính xác Email hoặc SĐT..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <button onClick={handleSearch} className="bg-blue-600 text-white p-2 rounded"><Search size={20} /></button>
                    </div>

                    {/* Kết quả tìm kiếm */}
                    <div className="space-y-2">
                        {results.map(u => (
                            <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                                <div>
                                    <p className="font-bold">{u.lastName} {u.firstName}</p>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                </div>
                                <button
                                    onClick={() => handleAssign(u.id)}
                                    className="text-green-600 hover:bg-green-100 p-2 rounded"
                                >
                                    <UserPlus size={20} />
                                </button>
                            </div>
                        ))}
                        {results.length === 0 && !searching && <p className="text-center text-gray-400 text-sm">Nhập email để tìm kiếm học sinh tự do.</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}