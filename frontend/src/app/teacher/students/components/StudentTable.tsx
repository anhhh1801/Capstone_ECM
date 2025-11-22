"use client";

import { Mail, Phone, Building2, Unlink, Trash2 } from "lucide-react";

// Định nghĩa kiểu dữ liệu cho Props
interface Student {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    connectedCenters?: { id: number; name: string }[]; // Danh sách các trung tâm em này đang học
}

interface Props {
    students: Student[];
    loading: boolean;
    onAssign?: (studentId: number) => void;
    onDelete: (studentId: number) => void;
    deleteLabel?: string;
    onEdit: (student: any) => void;
}

export default function StudentTable({ students, loading, onAssign, onDelete, deleteLabel = "Xóa", onEdit }: Props) {
    if (loading) {
        return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    if (students.length === 0) {
        return (
            <div className="p-10 text-center border border-dashed rounded-xl bg-gray-50 text-gray-500">
                Không tìm thấy học sinh nào.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 font-semibold text-gray-700 uppercase text-xs">
                    <tr>
                        <th className="px-6 py-4">Học viên</th>
                        <th className="px-6 py-4">Thông tin liên hệ</th>
                        <th className="px-6 py-4">Trung tâm trực thuộc</th>
                        <th className="px-6 py-4 text-right">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition">
                            {/* Cột 1: Tên & Avatar */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                        {student.lastName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">
                                            {student.lastName} {student.firstName}
                                        </p>
                                        <p className="text-xs text-gray-500">ID: {student.id}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Cột 2: Liên hệ */}
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail size={14} /> {student.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone size={14} /> {student.phoneNumber || "---"}
                                    </div>
                                </div>
                            </td>

                            {/* Cột 3: Trung tâm đang học (Tags) */}
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                    {student.connectedCenters && student.connectedCenters.length > 0 ? (
                                        student.connectedCenters.map((c) => (
                                            <span
                                                key={c.id}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                            >
                                                <Building2 size={10} /> {c.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Tự do (Chưa gán)</span>
                                    )}
                                </div>
                            </td>

                            {/* Cột 4: Hành động */}
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    {/* Nút gán nhanh */}
                                    {onAssign && (
                                        <button
                                            onClick={() => onAssign(student.id)}
                                            className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-medium border border-blue-200 mr-2"
                                        >
                                            + Gán Center
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(student.id)}
                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded transition"
                                        title={deleteLabel}
                                    >
                                        {deleteLabel === "Gỡ" ? <Unlink size={18} /> : <Trash2 size={18} />}
                                    </button>
                                    <button
                                        onClick={() => onEdit(student)} // Gọi hàm edit
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3"
                                    >
                                        Hồ sơ
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}