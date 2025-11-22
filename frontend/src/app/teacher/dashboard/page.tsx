"use client";

import { BookOpen, Users, Calendar } from "lucide-react";

export default function TeacherDashboard() {
    // Dữ liệu giả (Sau này gọi API lấy thật)
    const stats = [
        { label: "Lớp đang dạy", value: "4", icon: BookOpen, color: "bg-blue-500" },
        { label: "Tổng học viên", value: "120", icon: Users, color: "bg-green-500" },
        { label: "Lịch hôm nay", value: "2 Ca", icon: Calendar, color: "bg-orange-500" },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan</h1>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                        <div className={`${stat.color} p-4 rounded-lg text-white`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Khu vực chức năng nhanh */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Hành động nhanh</h2>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        + Tạo khóa học mới
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                        Điểm danh nhanh
                    </button>
                </div>
            </div>
        </div>
    );
}