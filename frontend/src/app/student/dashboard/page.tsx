"use client";

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { BookOpen, Users, CalendarDays, Clock3, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { getStudentCourses } from "@/services/courseService";
import api from "@/utils/axiosConfig";
import { formatDateValue } from "@/utils/dateFormat";

type UpcomingSession = {
    sessionId?: number;
    courseId?: number;
    courseName?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    roomName?: string;
    status?: string;
};

export default function StudentDashboard() {
    const [loading, setLoading] = useState(true);
    const [totalCourses, setTotalCourses] = useState(0);
    const [studentUpcomingClasses, setStudentUpcomingClasses] = useState<UpcomingSession[]>([]);

    useEffect(() => {
        const fetchOverview = async () => {
            const userRaw = localStorage.getItem("user");
            const user = userRaw ? JSON.parse(userRaw) : null;
            const studentId = user?.id as number | undefined;

            if (!studentId) {
                toast.error("Cannot identify student. Please login again.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                const courses = await getStudentCourses(studentId);
                setTotalCourses(Array.isArray(courses) ? courses.length : 0);

                const startDate = dayjs().format("YYYY-MM-DD");
                const endDate = dayjs().add(14, "day").format("YYYY-MM-DD");
                const sessionResponse = await api.get<UpcomingSession[]>(
                    `/schedule/student/${studentId}/sessions?startDate=${startDate}&endDate=${endDate}`
                );

                const now = dayjs();
                const upcoming = (sessionResponse.data || [])
                    .filter((session) => {
                        if (!session.date || !session.startTime) return false;
                        const start = dayjs(`${session.date}T${session.startTime}`);
                        return start.isAfter(now) || start.isSame(now);
                    })
                    .sort((a, b) => {
                        const aStart = dayjs(`${a.date}T${a.startTime}`).valueOf();
                        const bStart = dayjs(`${b.date}T${b.startTime}`).valueOf();
                        return aStart - bStart;
                    })
                    .slice(0, 8);

                setStudentUpcomingClasses(upcoming);
            } catch (error) {
                console.error(error);
                toast.error("Cannot load dashboard overview.");
            } finally {
                setLoading(false);
            }
        };

        fetchOverview();
    }, []);

    const stats = useMemo(
        () => [
            { label: "Courses", value: String(totalCourses), icon: BookOpen, color: "bg-[var(--color-main)]" },
            { label: "Upcoming Classes", value: String(studentUpcomingClasses.length), icon: CalendarDays, color: "bg-[var(--color-main)]" },
        ],
        [totalCourses, studentUpcomingClasses.length]
    );

    return (
        <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                        <div className={`${stat.color} p-4 rounded-lg text-white`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-[var(--color-text)] font-semibold">{stat.label}</p>
                            <p className="text-2xl font-bold text-[var(--color-alert)]">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-[var(--color-main)]/30">
                <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">Upcoming Classes</h2>

                {loading ? (
                    <p className="text-sm text-gray-500">Loading upcoming classes...</p>
                ) : studentUpcomingClasses.length === 0 ? (
                    <p className="text-sm text-gray-500">No upcoming classes in the next 14 days.</p>
                ) : (
                    <div className="space-y-3">
                        {studentUpcomingClasses.map((session, index) => (
                            <div
                                key={`${session.sessionId || "session"}-${index}`}
                                className="rounded-lg border border-[var(--color-main)]/30 bg-[var(--color-soft-white)] p-3"
                            >
                                <div className="font-semibold text-[var(--color-text)]">
                                    {session.courseName || "Course"}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
                                    <span className="inline-flex items-center gap-1">
                                        <CalendarDays size={14} />
                                        {formatDateValue(session.date)}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <Clock3 size={14} />
                                        {session.startTime?.slice(0, 5)} - {session.endTime?.slice(0, 5)}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin size={14} />
                                        {session.roomName || "TBD"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}