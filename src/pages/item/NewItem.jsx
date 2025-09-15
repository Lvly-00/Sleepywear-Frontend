import React from "react";
import { useNavigate } from "react-router-dom";

function NewItem() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/dashboard");
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <h1>NewItem Page</h1>
      <button onClick={handleLogin}>Dashboard</button>
    </div>
  );
}

export default NewItem;
