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
        const status = error.response?.status;
        if (status === 401 || status === 403) {
            console.warn(`Auth error (${status}) - logging out`);

            localStorage.removeItem("loginResponse");

            // redirect to login
            if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;