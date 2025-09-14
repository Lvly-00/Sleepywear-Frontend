import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const buttons = [
    { label: "Logout", onClick: () => navigate("/") },
    { label: "Inventory", onClick: () => navigate("/inventory") },
    { label: "Order", onClick: () => navigate("/order") },
    { label: "Settings", onClick: () => navigate("/settings") },
    { label: "Analytics", onClick: () => navigate("/analytics") },
    { label: "Invoice", onClick: () => navigate("/invoice") },
  ];

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Dashboard</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "15px",
        }}
      >
        {buttons.map((btn, index) => (
          <button key={index} onClick={btn.onClick}>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
