import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL || "https://sleepywear-backend.onrender.com/api";

// Get access token from local storage
const getToken = () => localStorage.getItem("access_token");

const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// ✅ Attach token to every request if available
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ✅ Global response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // Handle Unauthorized (expired/invalid token)
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest.url.includes("/login") &&
            !originalRequest.url.includes("/register")
        ) {
            console.warn("Session expired. Clearing cache and redirecting to login...");

            // 🧹 Clear localStorage cache and tokens
            localStorage.removeItem("access_token");
            localStorage.removeItem("collections_cache");
            localStorage.removeItem("collections_cache_time");
            localStorage.removeItem("user_settings_cache");

            // Optional: clear sessionStorage too
            sessionStorage.clear();

            // Redirect to login page
            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default api;