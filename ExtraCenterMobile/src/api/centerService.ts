import axiosClient from "./axiosClient";

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

export const getMyCenters = async (teacherId: number) => {
    const response = await axiosClient.get<Center[]>(`/centers/teacher/${teacherId}`);
    return response.data;
};

export const deleteCenter = async (centerId: number) => {
    const response = await axiosClient.delete(`/centers/${centerId}`);
    return response.data;
};

export const createCenter = async (data: {
    name: string;
    description: string;
    phoneNumber: string;
    managerId: number;
}) => {

    console.log("Payload gửi đi:", JSON.stringify(data, null, 2));
    const response = await axiosClient.post('/centers', data);
    return response.data;
};

export const updateCenter = async (
    id: number,
    data: { name: string; description: string; phoneNumber: string; managerId: number }
) => {
    const response = await axiosClient.put(`/centers/${id}`, data);
    return response.data;
};

export const getCenterById = async (id: number) => {
    const response = await axiosClient.get(`/centers/${id}`);
    return response.data;
};