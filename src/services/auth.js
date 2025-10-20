import api from "./api";

export const login = (email, password) => {
    return api.post("/login", { email, password }); // Laravel route returns token
};

export const logout = () => api.post("/logout"); // optional
export const fetchUser = () => api.get("/user/settings");