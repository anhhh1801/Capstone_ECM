"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    CalendarDays,
    Users,
    LogOut,
    Building2
} from "lucide-react"; // Bộ icon xịn xò
import { useEffect, useState } from "react";

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Lấy thông tin user từ LocalStorage để hiển thị tên
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // Nếu chưa đăng nhập mà cố vào -> đá về login
            router.push("/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        router.push("/login");
    };

    const menuItems = [
        { name: "Tổng quan", href: "/teacher/dashboard", icon: LayoutDashboard },
        { name: "Trung tâm", href: "/teacher/centers", icon: Building2 },
        { name: "Khóa học", href: "/teacher/courses", icon: BookOpen },
        { name: "Lịch dạy", href: "/teacher/schedule", icon: CalendarDays },
        { name: "Học viên", href: "/teacher/students", icon: Users },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* --- SIDEBAR (MENU TRÁI) --- */}
            <aside className="w-64 bg-white shadow-lg flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">ECM Manager</h1>
                    <p className="text-sm text-gray-500 mt-1">Giáo viên: {user?.firstName}</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-500"
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                        <LogOut size={20} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT (NỘI DUNG BÊN PHẢI) --- */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}