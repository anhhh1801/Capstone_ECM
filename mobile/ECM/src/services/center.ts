import api from "../utils/axiosConfig";

export interface Center {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
}

export interface CenterRequest {
  name: string;
  address: string;
  phone: string;
  email: string;
  description?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

class CenterService {
  // Create a new center
  async createCenter(request: CenterRequest): Promise<Center> {
    const response = await api.post<Center>("/centers", request);
    return response.data;
  }

  // Get all centers
  async getAllCenters(): Promise<Center[]> {
    const response = await api.get<Center[]>("/centers");
    return response.data;
  }

  // Get center by ID
  async getCenterById(id: number): Promise<Center> {
    const response = await api.get<Center>(`/centers/${id}`);
    return response.data;
  }

  // Get centers managed by teacher
  async getCentersByManager(teacherId: number): Promise<Center[]> {
    const response = await api.get<Center[]>(`/centers/teacher/${teacherId}`);
    return response.data;
  }

  // Get centers where teacher is teaching
  async getCentersTeaching(teacherId: number): Promise<Center[]> {
    const response = await api.get<Center[]>(`/centers/teaching/${teacherId}`);
    return response.data;
  }

  // Update center
  async updateCenter(id: number, request: CenterRequest): Promise<Center> {
    const response = await api.put<Center>(`/centers/${id}`, request);
    return response.data;
  }

  // Delete center
  async deleteCenter(id: number): Promise<string> {
    const response = await api.delete<string>(`/centers/${id}`);
    return response.data;
  }

  // Get teachers by center
  async getTeachersByCenter(centerId: number): Promise<User[]> {
    const response = await api.get<User[]>(`/centers/${centerId}/teachers`);
    return response.data;
  }

  // Get students by center
  async getStudentsByCenter(centerId: number): Promise<User[]> {
    const response = await api.get<User[]>(`/centers/${centerId}/students`);
    return response.data;
  }

  // Assign student to center
  async assignStudentToCenter(centerId: number, studentId: number): Promise<string> {
    const response = await api.post<string>(`/centers/${centerId}/assign-student?studentId=${studentId}`);
    return response.data;
  }

  // Remove student from center
  async removeStudentFromCenter(centerId: number, studentId: number): Promise<string> {
    const response = await api.delete<string>(`/centers/${centerId}/students/${studentId}`);
    return response.data;
  }
}

export default new CenterService();
