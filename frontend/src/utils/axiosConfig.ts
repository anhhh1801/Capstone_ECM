import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Cổng của Spring Boot
    headers: {
        'Content-Type': 'application/json',
    },
});

// Log request để debug cho dễ
api.interceptors.request.use((config) => {
    console.log(`🚀 Calling API: ${config.url}`);
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;