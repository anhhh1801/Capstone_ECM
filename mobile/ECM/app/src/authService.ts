import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';

// Create axios instance with base URL
const api: AxiosInstance = axios.create({
  baseURL: 'https://your-api-url.com/api', // Replace with your actual API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout user
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('user');
      // You might want to emit an event or reset auth state here
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  name: string;
  token: string;
}

/**
 * Login user with email and password
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw error;
  }
}

/**
 * Register user with email, password, and name
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> {
  try {
    const response = await api.post<RegisterResponse>('/auth/register', {
      email,
      password,
      name,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
    throw error;
  }
}

/**
 * Verify token validity
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await api.post('/auth/verify', { token });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

export default api;
