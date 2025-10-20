import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = "Bearer " + token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Use safe check without optional chaining
        if (error.response && error.response.status === 401) {
            console.warn("Unauthorized - redirecting to login");
            localStorage.removeItem("access_token");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;