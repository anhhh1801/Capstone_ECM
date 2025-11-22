import { ShieldAlert } from "lucide-react";
import { User } from "@/services/authService";

interface Props {
    teachers: User[];
    isManager: boolean;
}

export default function TeacherListTab({ teachers, isManager }: Props) {
    if (!isManager) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-red-500 border border-red-100 bg-red-50 rounded-xl">
                <ShieldAlert size={48} className="mb-4" />
                <h3 className="font-bold">Không có quyền truy cập</h3>
                <p>Chỉ quản lý trung tâm mới xem được mục này.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700">Danh sách Giáo viên ({teachers.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teachers.map((t) => (
                    <div key={t.id} className="bg-white p-4 border rounded flex gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                            {t.lastName[0]}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">{t.firstName} {t.lastName}</p>
                            <p className="text-sm text-gray-500">{t.email}</p>
                            <p className="text-sm text-gray-500">{t.phoneNumber || "SĐT: ---"}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}