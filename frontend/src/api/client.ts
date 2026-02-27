import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "1",
    },
});

// Interceptor to add JWT token to headers for authenticated requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor to handle session expiration (401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Optional: window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
