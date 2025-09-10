import api from "../api";

export const getCsrf = () => api.get("/sanctum/csrf-cookie"); // no /api prefix

export const login = async (email, password) => {
  await getCsrf(); // INIT CSRF cookie first
  return api.post("/api/login", { email, password }); // or "/login" depending on your route file
};

export const logout = () => api.post("/api/logout");
export const fetchUser = () => api.get("/api/user");
