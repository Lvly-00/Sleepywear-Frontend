import axios from "axios";
import CryptoJS from "crypto-js";

const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function getDeviceKey() {
    const fingerprint = navigator.userAgent + navigator.language + window.location.hostname;
    return CryptoJS.SHA256(fingerprint).toString();
}

function getDecryptedToken() {
    const encryptedToken = localStorage.getItem("secure_access_token");
    if (!encryptedToken) return null;

    try {
        const key = getDeviceKey();
        const bytes = CryptoJS.AES.decrypt(encryptedToken, key);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        return decrypted || null;
    } catch {
        return null;
    }
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = getDecryptedToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (error) => {
        const originalRequest = error.config;
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest.url.includes("/login") &&
            !originalRequest.url.includes("/register")
        ) {
            localStorage.removeItem("secure_access_token");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default api;