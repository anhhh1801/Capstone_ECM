import api from '../utils/axiosConfig';

export interface CreateStudentData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    centerId?: number;
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

// Xóa vĩnh viễn
export const deleteStudent = async (studentId: number) => {
    await api.delete(`/users/${studentId}`);
};

// API Cập nhật
export const updateStudent = async (id: number, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

// API Gán center (Dùng lại logic đã làm)
export const assignStudentToCenter = async (centerId: number, studentId: number) => {
    await api.post(`/centers/${centerId}/assign-student?studentId=${studentId}`);
};