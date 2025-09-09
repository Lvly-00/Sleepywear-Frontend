import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./assets/Pages/Login";
import Dashboard from "./assets/Pages/Dashboard";
import Inventory from "./assets/Pages/Inventory";
import Order from "./assets/pages/Order";
import Settings from "./assets/pages/Settings";
import Analytics from "./assets/pages/Analytics";
import Invoice from "./assets/pages/Invoice";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path={"/dashboard"} element={<Dashboard />} />{" "}
        <Route path={"/inventory"} element={<Inventory />} />
        <Route path={"/order"} element={<Order />} />
        <Route path={"/settings"} element={<Settings />} />
        <Route path={"/analytics"} element={<Analytics />} />
        <Route path={"/invoice"} element={<Invoice />} />
      </Routes>
    </Router>
  );
}

export default App;
