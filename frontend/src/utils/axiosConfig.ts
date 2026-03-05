import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

/* Attach token to request */


api.interceptors.request.use((config) => {
    try {
        const userStr = localStorage.getItem("loginResponse");

        if (userStr) {
            const userData = JSON.parse(userStr);

            if (userData?.token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${userData.token}`;
            }
        }
    } catch (error) {
        console.error("Token parse error", error);
    }

    return config;
});

/* Handle unauthorized responses */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized - logging out");

            localStorage.removeItem("loginResponse");

            // redirect to login
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;