import axiosClient from './axiosClient';

export interface CreateStudentData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    centerId?: number;
}

// API Tạo học sinh nhanh (Auto email)
export const createStudentAuto = async (data: CreateStudentData) => {
    const response = await axiosClient.post('/users/create-student', data);
    return response.data;
};

// Gỡ khỏi trung tâm
export const removeStudentFromCenter = async (centerId: number, studentId: number) => {
    await axiosClient.delete(`/centers/${centerId}/students/${studentId}`);
};

// Xóa vĩnh viễn
export const deleteStudent = async (studentId: number) => {
    await axiosClient.delete(`/users/${studentId}`);
};

// API Cập nhật
export const updateStudent = async (id: number, data: any) => {
    const response = await axiosClient.put(`/users/${id}`, data);
    return response.data;
};

// API Gán center (Dùng lại logic đã làm)
export const assignStudentToCenter = async (centerId: number, studentId: number) => {
    await axiosClient.post(`/centers/${centerId}/assign-student?studentId=${studentId}`);
};

export const deactivateAccount = async (userId: number) => {
    await axiosClient.post(`/users/${userId}/deactivate`)
}