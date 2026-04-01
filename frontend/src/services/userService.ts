import api from '../utils/axiosConfig';

export interface CreateStudentData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    centerId?: number;
    createdByTeacherId?: number;
}

export interface UpdateStudentData extends CreateStudentData {
    teacherId: number;
}

export interface TeacherManagedStudent {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    canManage: boolean;
    connectedCenters?: { id: number; name: string }[];
}

// API Tạo học sinh nhanh (Auto email)
export const createStudentAuto = async (data: CreateStudentData) => {
    // POST: /api/users/create-student
    const response = await api.post('/users/create-student', data);
    return response.data; // Trả về User object (có email vừa tạo)
};

// Gỡ khỏi trung tâm
export const removeStudentFromCenter = async (centerId: number, studentId: number) => {
    await api.delete(`/centers/${centerId}/students/${studentId}`);
};

export const getTeacherStudents = async (teacherId: number, status: "active" | "rolled-out" = "active") => {
    const active = status === "active";
    const response = await api.get<TeacherManagedStudent[]>(`/users/teacher/${teacherId}/students?active=${active}`);
    return response.data;
};

export const deleteOrRolloutStudent = async (teacherId: number, studentId: number) => {
    const response = await api.delete<string>(`/users/teacher/${teacherId}/students/${studentId}`);
    return response.data;
};

export const rollbackStudent = async (teacherId: number, studentId: number) => {
    const response = await api.post<string>(`/users/teacher/${teacherId}/students/${studentId}/rollback`);
    return response.data;
};

export const resetStudentPassword = async (teacherId: number, studentId: number) => {
    const response = await api.post<string>(`/users/teacher/${teacherId}/students/${studentId}/reset-password`);
    return response.data;
};

// API Cập nhật
export const updateStudent = async (id: number, data: UpdateStudentData) => {
    const { teacherId, ...payload } = data;
    const response = await api.put(`/users/teacher/${teacherId}/students/${id}`, payload);
    return response.data;
};

// API Gán center (Dùng lại logic đã làm)
export const assignStudentToCenter = async (centerId: number, studentId: number) => {
    await api.post(`/centers/${centerId}/assign-student?studentId=${studentId}`);
};