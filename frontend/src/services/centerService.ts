import api from '../utils/axiosConfig';

export interface Center {
    id: number;
    name: string;
    description: string;
    phoneNumber: string;
    manager: {
        id: number;
        firstName: string;
        lastName: string;
    };
}

// Lấy danh sách trung tâm của giáo viên
export const getMyCenters = async (teacherId: number) => {
    const response = await api.get<Center[]>(`/centers/teacher/${teacherId}`);
    return response.data;
};

export const getCenterInvitations = async (teacherId: number) => {
    const response = await api.get<Center[]>(`/centers/invitations/${teacherId}`);
    return response.data;
};

// Tạo trung tâm mới
export const createCenter = async (data: {
    name: string;
    description: string;
    phoneNumber: string;
    managerId: number
}) => {
    const response = await api.post('/centers', data);
    return response.data;
};

export interface CenterSubject {
    id: number;
    name: string;
    description?: string;
}

export interface CenterGrade {
    id: number;
    name: string;
    description?: string;
    fromAge?: number;
    toAge?: number;
}

export interface CenterClassroom {
    id: number;
    seat: number;
    location: string;
    lastMaintainDate: string;
}

export interface ClassroomPayload {
    seat: number;
    location: string;
    lastMaintainDate: string;
    managerId: number;
}

export interface CenterClassSlot {
    id: number;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    dayOfWeek?: string;
    isRecurring: boolean;
    excludedDates?: string[];
    course?: {
        id: number;
        name: string;
        status?: string;
        startDate?: string;
        endDate?: string;
        teacher?: {
            id?: number;
            firstName?: string;
            lastName?: string;
            name?: string;
            fullName?: string;
        };
        teacherName?: string;
        studentCount?: number;
        totalStudents?: number;
        totalStudent?: number;
        numberOfStudents?: number;
        students?: Array<{ id?: number }>;
    };
    classroom?: {
        id: number;
        location: string;
        seat?: number;
    };
}

export interface ClassSlotOccurrenceOverridePayload {
    managerId: number;
    startTime: string;
    endTime: string;
    classroomId: number;
}

export interface ClassSlotPayload {
    managerId: number;
    courseId: number;
    classroomId: number;
    startTime: string;
    endTime: string;
    daysOfWeek: string[];
    recurring: boolean;
}

// Lấy danh sách giáo viên của trung tâm
export const getCenterTeachers = async (centerId: number) => {
    const response = await api.get(`/centers/${centerId}/teachers`);
    return response.data;
};

export const inviteTeacherToCenter = async (centerId: number, managerId: number, email: string) => {
    const response = await api.post(`/centers/${centerId}/teachers/invite?managerId=${managerId}&email=${encodeURIComponent(email)}`);
    return response.data;
};

export const unlinkTeacherFromCenter = async (centerId: number, teacherId: number, managerId: number) => {
    const response = await api.delete(`/centers/${centerId}/teachers/${teacherId}?managerId=${managerId}`);
    return response.data;
};

// Lấy danh sách môn học do manager tạo cho trung tâm
export const getCenterSubjects = async (centerId: number) => {
    const response = await api.get<CenterSubject[]>(`/centers/${centerId}/subjects`);
    return response.data;
};

// Tạo môn học cho trung tâm
export const createCenterSubject = async (centerId: number, data: { name: string; description?: string }) => {
    const response = await api.post(`/centers/${centerId}/subjects`, data);
    return response.data as CenterSubject;
};

// Cập nhật môn học của trung tâm
export const updateCenterSubject = async (centerId: number, subjectId: number, data: { name: string; description?: string }) => {
    const response = await api.put(`/centers/${centerId}/subjects/${subjectId}`, data);
    return response.data as CenterSubject;
};

// Xóa môn học của trung tâm
export const deleteCenterSubject = async (centerId: number, subjectId: number) => {
    const response = await api.delete(`/centers/${centerId}/subjects/${subjectId}`);
    return response.data;
};

// Lấy danh sách khối lớp do manager tạo cho trung tâm
export const getCenterGrades = async (centerId: number) => {
    const response = await api.get<CenterGrade[]>(`/centers/${centerId}/grades`);
    return response.data;
};

// Tạo khối lớp cho trung tâm
export const createCenterGrade = async (centerId: number, data: { name: string; fromAge?: number; toAge?: number; description?: string }) => {
    const response = await api.post(`/centers/${centerId}/grades`, data);
    return response.data as CenterGrade;
};

// Update existing grade
export const updateCenterGrade = async (centerId: number, gradeId: number, data: { name: string; fromAge?: number; toAge?: number; description?: string }) => {
    const response = await api.put(`/centers/${centerId}/grades/${gradeId}`, data);
    return response.data as CenterGrade;
};

// Xóa khối lớp của trung tâm
export const deleteCenterGrade = async (centerId: number, gradeId: number) => {
    const response = await api.delete(`/centers/${centerId}/grades/${gradeId}`);
    return response.data;
};

// Lấy danh sách phòng học của trung tâm
export const getCenterClassrooms = async (centerId: number) => {
    const response = await api.get<CenterClassroom[]>(`/centers/${centerId}/classrooms`);
    return response.data;
};

// Tạo phòng học cho trung tâm
export const createCenterClassroom = async (centerId: number, data: ClassroomPayload) => {
    const response = await api.post(`/centers/${centerId}/classrooms`, data);
    return response.data as CenterClassroom;
};

// Cập nhật phòng học
export const updateCenterClassroom = async (centerId: number, classroomId: number, data: ClassroomPayload) => {
    const response = await api.put(`/centers/${centerId}/classrooms/${classroomId}`, data);
    return response.data as CenterClassroom;
};

// Xóa phòng học
export const deleteCenterClassroom = async (centerId: number, classroomId: number, managerId: number) => {
    const response = await api.delete(`/centers/${centerId}/classrooms/${classroomId}?managerId=${managerId}`);
    return response.data;
};

// Lấy danh sách class slots của trung tâm
export const getCenterClassSlots = async (centerId: number) => {
    const response = await api.get<CenterClassSlot[]>(`/centers/${centerId}/class-slots`);
    return response.data;
};

// Tạo class slot
export const createCenterClassSlot = async (centerId: number, data: ClassSlotPayload) => {
    const response = await api.post(`/centers/${centerId}/class-slots`, data);
    return response.data as CenterClassSlot;
};

// Cập nhật class slot
export const updateCenterClassSlot = async (centerId: number, slotId: number, data: ClassSlotPayload) => {
    const response = await api.put(`/centers/${centerId}/class-slots/${slotId}`, data);
    return response.data as CenterClassSlot;
};

// Xóa class slot
export const deleteCenterClassSlot = async (centerId: number, slotId: number, managerId: number) => {
    const response = await api.delete(`/centers/${centerId}/class-slots/${slotId}?managerId=${managerId}`);
    return response.data;
};

export const deleteCenterClassSlotOccurrence = async (
    centerId: number,
    slotId: number,
    date: string,
    managerId: number
) => {
    const response = await api.delete(
        `/centers/${centerId}/class-slots/${slotId}/occurrences?date=${date}&managerId=${managerId}`
    );
    return response.data;
};

export const overrideCenterClassSlotOccurrence = async (
    centerId: number,
    slotId: number,
    date: string,
    data: ClassSlotOccurrenceOverridePayload
) => {
    const response = await api.post(`/centers/${centerId}/class-slots/${slotId}/occurrences/override?date=${date}`, data);
    return response.data as CenterClassSlot;
};