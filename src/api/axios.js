import axios from "axios";

// Use Vite env variable or fallback to local / deployed backend
const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // include cookies for Sanctum
    headers: {
        "X-Requested-With": "XMLHttpRequest",
    },
});

// Automatically get CSRF cookie before any authenticated request
api.interceptors.request.use(async(config) => {
    if (!window.csrfLoaded) {
        // Use BASE URL dynamically (works for local & deployed)
        await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
            withCredentials: true,
        });
        window.csrfLoaded = true;
    }
    return config;
});

export default api;