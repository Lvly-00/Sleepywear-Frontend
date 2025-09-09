import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/");
  };

  const handleInventory = () => {
    navigate("/inventory");
  };

  const handleOrder = () => {
    navigate("/order");
  };
  const hanndleSettings = () => {
    navigate("/settings");
  };

  const handleAnalytics = () => {
    navigate("/analytics");
  };

  const handleInvoice = () => {
    navigate("/invoice");
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Dashboard Page</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "15px",
        }}
      >
        <button onClick={handleLogin}>Logout</button>
        <button onClick={handleInventory}>Inventory</button>
        <button onClick={handleOrder}>Order</button>
        <button onClick={hanndleSettings}>Settings</button>
        <button onClick={handleAnalytics}>Analytics</button>
        <button onClick={handleInvoice}>Invoice</button>
      </div>
    </div>
  );
}

export default Dashboard;
