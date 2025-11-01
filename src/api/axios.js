import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
    },
});

// Attach token if exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally but ignore login route
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const originalRequest = error.config;

        // ✅ Ignore 401 from /login and /register
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest.url.includes("/login") &&
            !originalRequest.url.includes("/register")
        ) {
            localStorage.removeItem("access_token");
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default api;