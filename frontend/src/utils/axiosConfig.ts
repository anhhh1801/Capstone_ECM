import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});



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

        // 401 UNAUTHORIZED: Token is missing, expired, or invalid. 
        // Action: Log them out.
        if (status === 401) {
            console.warn(`Auth error (401) - logging out`);

            // Clear all local storage data 
            // (I added "user" here just in case, based on your previous screenshot)
            localStorage.removeItem("loginResponse");
            localStorage.removeItem("user");

            // Redirect to login
            if (typeof window !== "undefined" && window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        // 403 FORBIDDEN: Token is valid, but they don't have the right role.
        // Action: Redirect to Access Denied page (Do NOT log them out).
        else if (status === 403) {
            console.warn(`Access Denied (403) - redirecting`);

            // Redirect to your unauthorized page
            if (typeof window !== "undefined" && window.location.pathname !== "/unauthorized") {
                window.location.href = "/unauthorized";
            }
        }

        return Promise.reject(error);
    }
);

export default api;