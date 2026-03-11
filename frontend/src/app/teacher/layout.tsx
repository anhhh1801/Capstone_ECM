"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    CalendarDays,
    Users,
    Building2,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { getInvitations } from "@/services/courseService";

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [collapsed, setCollapsed] = useState(false);
    const [pendingInvites, setPendingInvites] = useState(0);

    // fetch invitation count whenever user or route changes
    useEffect(() => {
        if (user) {
            getInvitations(user.id)
                .then((list) => setPendingInvites(list.length))
                .catch((e) => console.error("failed to fetch invites", e));
        }
    }, [user, pathname]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push("/login");
        }
    }, [router]);

    const menuItems = [
        { name: "Overview", href: "/teacher/dashboard", icon: LayoutDashboard },
        { name: "Centers", href: "/teacher/centers", icon: Building2, notify: pendingInvites > 0 },
        { name: "Courses", href: "/teacher/courses", icon: BookOpen },
        { name: "Schedule", href: "/teacher/schedule", icon: CalendarDays },
        { name: "Students", href: "/teacher/students", icon: Users },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* SIDEBAR */}
            <aside
                className={`${
                    collapsed ? "w-20" : "w-64"
                } bg-[var(--color-main)] shadow-lg flex flex-col transition-all duration-300`}
            >
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between">
                    {!collapsed && (
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--color-soft-white)]">
                                Dashboard
                            </h1>
                            <p className="text-sm text-[var(--color-soft-white)] mt-1">
                                Teacher: {user?.firstName}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-white hover:text-gray-300 transition"
                    >
                        {collapsed ? <ChevronRight size={22} /> : <ChevronLeft size={22} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 mt-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center ${
                                    collapsed ? "justify-center" : "gap-3"
                                } px-4 py-3 font-bold transition-all ${
                                    isActive
                                        ? "bg-blue-50 text-[var(--color-main)]"
                                        : "text-[var(--color-soft-white)] hover:bg-gray-50 hover:text-blue-500"
                                }`}
                            >
                                <item.icon size={22} />
                                {!collapsed && <span>{item.name}</span>}
                                {item.notify && (
                                    <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto p-8 transition-all duration-300">
                {children}
            </main>
        </div>
    );
}