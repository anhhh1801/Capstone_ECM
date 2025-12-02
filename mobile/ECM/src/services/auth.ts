import api from "../utils/axiosConfig";
import { AxiosResponse } from "axios";

// User interface returned from backend
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

// Register request data
export interface RegisterData {
    firstName: string;
    lastName: string;
    personalEmail: string;
    phoneNumber: string;
    password?: string; // optional, backend generates UUID if needed
    role?: string;     // backend sets TEACHER
}

class AuthService {
    // Login
    async loginUser(email: string, password: string): Promise<AxiosResponse<any>> {
        const response = await api.post("/users/login", { email, password });
        return response; // caller can read response.data and response.headers
    }

    // Register teacher
    async registerTeacher(data: RegisterData): Promise<any> {
        const payload = { ...data, password: "", role: "TEACHER" };
        const response = await api.post("/users/register-teacher", payload);
        return response.data;
    }

    // Verify OTP
    async verifyOtp(email: string, otp: string): Promise<any> {
        const response = await api.post("/users/verify-otp", { email, otp });
        return response.data;
    }

    // Resend OTP
    async resendOtp(email: string): Promise<any> {
        const response = await api.post(`/users/resend-otp?email=${email}`);
        return response.data;
    }
}

export default new AuthService();
