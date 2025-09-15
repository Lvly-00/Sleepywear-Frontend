import React from "react";
import { useNavigate } from "react-router-dom";

function Invoice() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Perform login logic here (e.g., authentication)
    // On successful login, navigate to the dashboard
    navigate("/dashboard");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h1>Invoice Page</h1>
      <button onClick={handleLogin}>Dashboard</button>
    </div>
  );
}

export default Invoice;
