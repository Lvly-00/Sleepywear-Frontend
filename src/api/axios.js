import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

// ✅ Automatically request CSRF cookie once using the same instance
api.interceptors.request.use(async(config) => {
    if (!window.__csrfLoaded) {
        try {
            await api.get("/sanctum/csrf-cookie"); // use api, not axios
            window.__csrfLoaded = true;
        } catch (err) {
            console.error("Failed to load CSRF cookie:", err);
        }
    }
    return config;
});

export default api;