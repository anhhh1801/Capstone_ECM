import api from "../utils/axiosConfig";

export type AttendanceStatus = "ATTEND" | "ABSENT" | "LATE" | "EXCUSE";

export interface CourseSession {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
    status?: string;
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
    startTime: string;
    endTime: string;
    note?: string;
}

export const getCourseSessions = async (courseId: number) => {
    const response = await api.get<CourseSession[]>(`/courses/${courseId}/sessions`);
    return response.data;
};

export const createCourseSession = async (courseId: number, payload: CreateCourseSessionPayload) => {
    const response = await api.post<CourseSession>(`/courses/${courseId}/sessions`, payload);
    return response.data;
};

export const getAttendanceSheet = async (classSessionId: number) => {
    const response = await api.get<AttendanceSheetResponse>(`/attendance/sheet?classSessionId=${classSessionId}`);
    return response.data;
};

export const saveAttendance = async (payload: SaveAttendancePayload) => {
    const response = await api.post("/attendance", payload);
    return response.data;
};
