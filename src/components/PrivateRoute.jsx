import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import SleepyLoader from "./SleepyLoader";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Get CSRF cookie first
        await api.get("/sanctum/csrf-cookie");

        // 2. Then check user session
        await api.get("/api/user/settings");
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loader while auth status is being determined
  if (isAuthenticated === null) return <SleepyLoader minTime={100} />;

  return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;
