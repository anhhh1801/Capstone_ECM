import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api', // Cổng của Spring Boot
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const userStr = localStorage.getItem('loginResponse');

    if (userStr) {
        const userData = JSON.parse(userStr);

        if (userData.token) {
            config.headers.Authorization = `Bearer ${userData.token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;