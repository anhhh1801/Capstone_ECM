import axiosClient from "./axiosClient";

// 1. Get All Users
export const getAllUsers = async () => {
    const response = await axiosClient.get('/users/admin/all');
    return response.data;
};

// 2. Lock / Unlock User
export const toggleUserLock = async (adminId: number, targetUserId: number) => {
    // Note: We use query params as defined in your backend
    const response = await axiosClient.put(`/users/admin/lock?adminId=${adminId}&targetUserId=${targetUserId}`);
    return response.data;
};

// 3. Get User Stats
export const getUserStats = async (adminId: number, targetUserId: number) => {
    const response = await axiosClient.get(`/users/admin/stats?adminId=${adminId}&targetUserId=${targetUserId}`);
    return response.data;
};