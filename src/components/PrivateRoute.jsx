import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";
import SleepyLoader from "./TopLoadingBar";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    api.get("/user/settings")
      .then(() => setIsAuthenticated(true))
      .catch(() => {
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <SleepyLoader />;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  return children;
};

export default PrivateRoute;
