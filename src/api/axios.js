import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL || "https://sleepywear-backend.onrender.com/api";

const getToken = () => localStorage.getItem("access_token");

const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // Handle unauthorized or expired session
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest.url.includes("/login") &&
            !originalRequest.url.includes("/register")
        ) {
            console.warn("⚠️ Session expired — clearing all caches and redirecting to login...");

            const cacheKeys = [
                "access_token",
                "collections_cache",
                "collections_cache_time",
                "user_settings_cache",
                "products_cache",
                "products_cache_time",
                "dashboard_cache",
            ];

            cacheKeys.forEach((key) => localStorage.removeItem(key));

            sessionStorage.clear();

            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default api;