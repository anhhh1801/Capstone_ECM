import api from '../utils/axiosConfig';

// Định nghĩa kiểu dữ liệu Course (khớp với Java)
export interface Course {
    id: number;
    name: string;
    subject: string;
    grade: number;
    status: string;
    startDate: string;
    endDate: string;
    center: {
        name: string;
    };
    teacher: {
        id: number;
        email: string;
        firstName: string;
        lastName: string;
    };
    invitationStatus: string; // PENDING, ACCEPTED
}

// Hàm gọi API lấy danh sách
export const getTeacherCourses = async (teacherId: number) => {
    const response = await api.get<Course[]>(`/courses/teacher/${teacherId}`);
    return response.data;
};

export const getCoursesByCenter = async (centerId: number) => {
    const response = await api.get<Course[]>(`/courses?centerId=${centerId}`);
    // Lưu ý: Bạn cần check lại Backend xem có API filter theo centerId chưa.
    // Nếu chưa, ta dùng tạm API getTeacherCourses rồi filter phía client cũng được (cho nhanh).
    return response.data;
};

export interface CreateCourseData {
    name: string;
    subject: string;
    grade: number;
    description: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;
    centerId: number;
    teacherId: number;
    slots?: any[]; // Tạm thời để trống, xử lý lịch sau
}

// API Tạo
export const createCourse = async (data: CreateCourseData) => {
    const response = await api.post('/courses', data);
    return response.data;
};

// API Xóa
export const deleteCourse = async (id: number) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
};

// Lấy chi tiết 1 khóa
export const getCourseById = async (id: number) => {
    const res = await api.get(`/courses/${id}`);
    return res.data;
}

// Cập nhật khóa học
export const updateCourse = async (id: number, data: any) => {
    const res = await api.put(`/courses/${id}`, data);
    return res.data;
}

// Hàm mời
export const inviteTeacher = async (courseId: number, email: string) => {
    await api.post(`/courses/${courseId}/invite?email=${email}`);
};

// Hàm phản hồi
export const respondInvitation = async (courseId: number, status: "ACCEPTED" | "REJECTED") => {
    await api.post(`/courses/${courseId}/respond?status=${status}`);
};

// Hàm lấy lời mời
export const getInvitations = async (teacherId: number) => {
    const res = await api.get(`/courses/invitations/${teacherId}`);
    return res.data;
};

// Get students in a course
export const getStudentsInCourse = async (courseId: number) => {
    const response = await api.get(`/courses/${courseId}/students`);
    return response.data;
};

// Add student
export const addStudentToCourse = async (courseId: number, studentId: number) => {
    const response = await api.post(`/courses/${courseId}/students/${studentId}`);
    return response.data;
};

// Remove student
export const removeStudentFromCourse = async (courseId: number, studentId: number) => {
    const response = await api.delete(`/courses/${courseId}/students/${studentId}`);
    return response.data;
};

// Search Students (Reusing your User Search logic)
export const searchStudents = async (keyword: string) => {
    const response = await api.get(`/users/search?keyword=${keyword}`);
    return response.data;
};