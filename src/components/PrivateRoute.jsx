import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/axios";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");


  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    api.get("/user/settings")
      .then(() => {
      })
      .catch(() => {
        console.error("Session expired or invalid token");
        localStorage.removeItem("access_token");
        setIsAuthenticated(false);
      });
  }, [token]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PrivateRoute;