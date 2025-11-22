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