import api from '../utils/axiosConfig';

// Định nghĩa kiểu dữ liệu trả về từ Java (cho gợi ý code thông minh)
export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    role: {
        id: number;
        name: string;
    };
    // Thêm các trường khác nếu cần
}

export const loginUser = async (email: string, password: string) => {
    // Gọi vào API /api/users/login bên Spring Boot
    const response = await api.post<User>('/users/login', { email, password });
    return response.data;
};

// Interface cho dữ liệu đăng ký
export interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password?: string; // Để optional vì backend tự sinh, nhưng DTO có thể cần
    role?: string;     // Backend tự set là TEACHER
}

// Hàm gọi API Đăng ký Giáo viên
export const registerTeacher = async (data: RegisterData) => {
    // Gửi kèm một password dummy (rỗng) vì Backend sẽ tự override bằng UUID
    const payload = { ...data, password: "", role: "TEACHER" };

    const response = await api.post('/users/register-teacher', payload);
    return response.data;
};

// Hàm gọi API xác thực token
export const verifyAccount = async (token: string) => {
    const response = await api.get(`/users/verify?token=${token}`);
    return response.data;
};