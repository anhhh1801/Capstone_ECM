
import axiosClient from './axiosClient';

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
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface RegisterData {
    firstName: string;
    lastName: string;
    personalEmail: string;
    phoneNumber: string;
    password?: string;
    role?: string;
}


export const loginUser = async (email: string, password: string) => {
    const response = await axiosClient.post<LoginResponse>('/users/login', { email, password });
    return response.data;
};

export const registerTeacher = async (data: RegisterData) => {
    const payload = { ...data, password: "", role: "TEACHER" };
    const response = await axiosClient.post('/users/register-teacher', payload);
    return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
    const response = await axiosClient.post('/users/verify-otp', { email, otp });
    return response.data;
};

export const resendOtp = async (email: string) => {
    const response = await axiosClient.post(`/users/resend-otp?email=${email}`);
    return response.data;
};