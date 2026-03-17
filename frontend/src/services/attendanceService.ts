import api from "../utils/axiosConfig";

export type AttendanceStatus = "ATTEND" | "ABSENT" | "LATE" | "EXCUSE";

export interface CourseSession {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    status?: string;
    note?: string;
    classSlotId?: number;
    classroomId?: number;
    classroomLocation?: string;
}

export interface CourseSessionSlotOption {
    classSlotId: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    classroomId?: number;
    classroomLocation?: string;
}

export interface AttendanceSheetStudentRow {
    studentId: number;
    firstName: string;
    lastName: string;
    email?: string;
    status: AttendanceStatus;
    note?: string;
}

export interface AttendanceSheetResponse {
    classSessionId: number;
    courseId: number;
    date: string;
    startTime: string;
    endTime: string;
    students: AttendanceSheetStudentRow[];
}

export interface AttendanceRecord {
    id: number;
}

export interface SaveAttendancePayload {
    classSessionId: number;
    studentStatuses: Array<{
        studentId: number;
        status: AttendanceStatus;
        note?: string;
    }>;
}

export interface CreateCourseSessionPayload {
    actorId: number;
    date: string;
    classSlotId: number;
    note?: string;
}

export interface UpdateCourseSessionPayload {
    actorId: number;
    date: string;
    classSlotId: number;
    note?: string;
}

export const getCourseSessions = async (courseId: number) => {
    const response = await api.get<CourseSession[]>(`/courses/${courseId}/sessions`);
    return response.data;
};

export const getCourseSessionSlotOptions = async (courseId: number) => {
    const response = await api.get<CourseSessionSlotOption[]>(`/courses/${courseId}/session-slot-options`);
    return response.data;
};

export const createCourseSession = async (courseId: number, payload: CreateCourseSessionPayload) => {
    const response = await api.post<CourseSession>(`/courses/${courseId}/sessions`, payload);
    return response.data;
};

export const updateCourseSession = async (
    courseId: number,
    sessionId: number,
    payload: UpdateCourseSessionPayload
) => {
    const response = await api.put<CourseSession>(`/courses/${courseId}/sessions/${sessionId}`, payload);
    return response.data;
};

export const deleteCourseSession = async (courseId: number, sessionId: number, actorId: number) => {
    const response = await api.delete(`/courses/${courseId}/sessions/${sessionId}?actorId=${actorId}`);
    return response.data;
};

export const getAttendanceSheet = async (classSessionId: number) => {
    const response = await api.get<AttendanceSheetResponse>(`/attendance/sheet?classSessionId=${classSessionId}`);
    return response.data;
};

export const getAttendanceList = async (classSessionId: number) => {
    const response = await api.get<AttendanceRecord[]>(`/attendance?classSessionId=${classSessionId}`);
    return response.data;
};

export const saveAttendance = async (payload: SaveAttendancePayload) => {
    const response = await api.post("/attendance", payload);
    return response.data;
};
