import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true, // send cookies for Sanctum auth
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
});

// Always get CSRF cookie before making authenticated requests
api.interceptors.request.use(async (config) => {
  if (!window.csrfLoaded) {
    await axios.get("http://localhost:8000/sanctum/csrf-cookie", {
      withCredentials: true,
    });
    window.csrfLoaded = true;
  }
  return config;
});

export default api;
