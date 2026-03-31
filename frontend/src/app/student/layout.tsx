"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    CalendarDays,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { useEffect, useState } from "react";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push("/login");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("loginResponse");
        router.push("/login");
    };

    const menuItems = [
        { name: "Overview", href: "/student/dashboard", icon: LayoutDashboard },
        { name: "Courses", href: "/student/courses", icon: BookOpen },
        { name: "Schedule", href: "/student/schedule", icon: CalendarDays },
    ];

    return (
        <div className="flex flex-1 min-h-0 bg-gray-100">

            {/* SIDEBAR */}
            <aside
                className={`${collapsed ? "w-20" : "w-64"
                    } bg-[var(--color-main)] shadow-lg flex flex-col transition-all duration-300 `}
            >
                {/* Header (Fixed Spacing Issue Here) */}
                <div className="p-6 border-b flex items-center justify-between">
                    {!collapsed && (
                        <div>
                            <h1 className="text-xl font-bold text-[var(--color-soft-white)]">
                                Dashboard
                            </h1>
                            <p className="text-xs text-[var(--color-soft-white)]/80 mt-1 truncate">
                                Student: {user?.firstName}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-white hover:text-gray-300 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-lg shrink-0"
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 mt-6 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/student/dashboard' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center ${collapsed ? "justify-center" : "gap-3 px-6"
                                    } py-3.5 font-bold transition-all mx-2 rounded-xl group ${isActive
                                        ? "bg-white text-[var(--color-main)] shadow-sm"
                                        : "text-[var(--color-soft-white)] hover:bg-white/10"
                                    }`}
                                title={collapsed ? item.name : ""}
                            >
                                <item.icon
                                    size={22}
                                    className={`shrink-0 transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                                />
                                {!collapsed && (
                                    <span className="whitespace-nowrap">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 min-h-0 overflow-y-auto bg-gray-50/50 p-4 md:p-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

        </div>
    );
}