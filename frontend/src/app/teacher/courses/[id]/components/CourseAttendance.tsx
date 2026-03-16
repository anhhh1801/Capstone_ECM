"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
    AttendanceSheetStudentRow,
    AttendanceStatus,
    CourseSession,
    createCourseSession,
    getAttendanceSheet,
    getCourseSessions,
    saveAttendance,
} from "@/services/attendanceService";
import { formatDateValue } from "@/utils/dateFormat";

interface Props {
    courseId: number;
}

const STATUS_OPTIONS: AttendanceStatus[] = ["ATTEND", "ABSENT", "LATE", "EXCUSE"];

const STATUS_LABELS: Record<AttendanceStatus, string> = {
    ATTEND: "Attend",
    ABSENT: "Absent",
    LATE: "Late",
    EXCUSE: "Excuse",
};

export default function CourseAttendance({ courseId }: Props) {
    const [sessions, setSessions] = useState<CourseSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<number | "">("");
    const [rows, setRows] = useState<AttendanceSheetStudentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [creatingSession, setCreatingSession] = useState(false);
    const [newSessionDate, setNewSessionDate] = useState("");
    const [newSessionStartTime, setNewSessionStartTime] = useState("07:00");
    const [newSessionEndTime, setNewSessionEndTime] = useState("08:00");
    const [newSessionNote, setNewSessionNote] = useState("");

    const fetchSessions = async (targetSessionId?: number) => {
        try {
            setLoading(true);
            const data = await getCourseSessions(courseId);
            setSessions(data);

            if (targetSessionId && data.some((s) => s.id === targetSessionId)) {
                setSelectedSessionId(targetSessionId);
                return;
            }

            if (data.length > 0) {
                setSelectedSessionId(data[0].id);
            } else {
                setSelectedSessionId("");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.error || "Cannot load sessions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [courseId]);

    useEffect(() => {
        if (!selectedSessionId) {
            setRows([]);
            return;
        }

        const fetchSheet = async () => {
            try {
                setLoading(true);
                const sheet = await getAttendanceSheet(Number(selectedSessionId));
                setRows(sheet.students || []);
            } catch (error: any) {
                console.error(error);
                toast.error(error?.response?.data?.error || "Cannot load attendance sheet.");
            } finally {
                setLoading(false);
            }
        };

        fetchSheet();
    }, [selectedSessionId]);

    const selectedSession = useMemo(
        () => sessions.find((s) => s.id === Number(selectedSessionId)) || null,
        [sessions, selectedSessionId]
    );

    const setStatusForStudent = (studentId: number, status: AttendanceStatus) => {
        setRows((prev) =>
            prev.map((row) => (row.studentId === studentId ? { ...row, status } : row))
        );
    };

    const markAll = (status: AttendanceStatus) => {
        setRows((prev) => prev.map((row) => ({ ...row, status })));
    };

    const handleSave = async () => {
        if (!selectedSessionId) {
            toast.error("Please select a session first.");
            return;
        }

        try {
            setSaving(true);
            await saveAttendance({
                classSessionId: Number(selectedSessionId),
                studentStatuses: rows.map((row) => ({
                    studentId: row.studentId,
                    status: row.status,
                    note: row.note,
                })),
            });
            toast.success("Attendance saved.");
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.error || "Cannot save attendance.");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateSession = async () => {
        const userRaw = localStorage.getItem("user");
        const user = userRaw ? JSON.parse(userRaw) : null;
        const actorId = user?.id as number | undefined;

        if (!actorId) {
            toast.error("Cannot identify user. Please login again.");
            return;
        }

        if (!newSessionDate) {
            toast.error("Please select session date.");
            return;
        }

        if (!newSessionStartTime || !newSessionEndTime) {
            toast.error("Please select session start and end time.");
            return;
        }

        if (newSessionEndTime <= newSessionStartTime) {
            toast.error("End time must be after start time.");
            return;
        }

        try {
            setCreatingSession(true);
            const created = await createCourseSession(courseId, {
                actorId,
                date: newSessionDate,
                startTime: newSessionStartTime,
                endTime: newSessionEndTime,
                note: newSessionNote || undefined,
            });

            toast.success("Session created.");
            await fetchSessions(created.id);
        } catch (error: any) {
            console.error(error);
            toast.error(error?.response?.data?.error || "Cannot create session.");
        } finally {
            setCreatingSession(false);
        }
    };

    if (loading && sessions.length === 0) {
        return <div className="p-6 text-center text-[var(--color-text)]">Loading attendance...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-lg border border-[var(--color-main)] bg-[var(--color-soft-white)] p-3">
                <div className="mb-2 text-sm font-semibold text-[var(--color-text)]">Create Session</div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
                    <input
                        type="date"
                        value={newSessionDate}
                        onChange={(e) => setNewSessionDate(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                    />
                    <input
                        type="time"
                        min="07:00"
                        max="22:00"
                        step={1800}
                        value={newSessionStartTime}
                        onChange={(e) => setNewSessionStartTime(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                    />
                    <input
                        type="time"
                        min="07:00"
                        max="22:00"
                        step={1800}
                        value={newSessionEndTime}
                        onChange={(e) => setNewSessionEndTime(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Optional note"
                        value={newSessionNote}
                        onChange={(e) => setNewSessionNote(e.target.value)}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                    />
                    <button
                        onClick={handleCreateSession}
                        disabled={creatingSession}
                        className="rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-main)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] disabled:opacity-50"
                    >
                        {creatingSession ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value ? Number(e.target.value) : "")}
                    className="rounded-lg border border-[var(--color-main)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none"
                >
                    <option value="">Select a session</option>
                    {sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                            {formatDateValue(session.date)} | {session.startTime?.slice(0, 5)} - {session.endTime?.slice(0, 5)}
                        </option>
                    ))}
                </select>
            </div>

            {selectedSession && (
                <div className="rounded-lg border border-[var(--color-main)] bg-[var(--color-soft-white)] px-3 py-2 text-sm text-[var(--color-text)]">
                    Session: {formatDateValue(selectedSession.date)} | {selectedSession.startTime?.slice(0, 5)} - {selectedSession.endTime?.slice(0, 5)}
                </div>
                
            )}

            {rows.length === 0 ? (
                <div className="rounded-lg border bg-white p-6 text-center text-gray-500">
                    {sessions.length === 0 ? "No session yet. Create one above to start attendance." : "No students found for this session."}
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-[var(--color-main)] bg-white">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-[var(--color-main)] text-white">
                                <th className="px-3 py-2 text-left">Student</th>
                                {STATUS_OPTIONS.map((status) => (
                                    <th key={status} className="px-3 py-2 text-center">
                                        <button
                                            onClick={() => markAll(status)}
                                            className="rounded border border-white/40 px-2 py-1 text-xs hover:bg-white/20"
                                            type="button"
                                        >
                                            {STATUS_LABELS[status]} (All)
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.studentId} className="border-t">
                                    <td className="px-3 py-2 text-[var(--color-text)]">
                                        <div className="font-medium">{row.lastName} {row.firstName}</div>
                                        <div className="text-xs text-gray-500">{row.email || "No email"}</div>
                                    </td>
                                    {STATUS_OPTIONS.map((status) => (
                                        <td key={status} className="px-3 py-2 text-center">
                                            <input
                                                type="radio"
                                                name={`attendance-${row.studentId}`}
                                                checked={row.status === status}
                                                onChange={() => setStatusForStudent(row.studentId, status)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="flex justify-center pt-2">
                <button
                    onClick={handleSave}
                    disabled={saving || !selectedSessionId || rows.length === 0}
                    className="rounded-lg border-2 border-[var(--color-main)] bg-[var(--color-main)] px-6 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-soft-white)] hover:text-[var(--color-main)] disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Attendance"}
                </button>
            </div>
        </div>
    );
}
