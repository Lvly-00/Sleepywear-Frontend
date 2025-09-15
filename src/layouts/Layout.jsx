import React from "react";
import { Outlet } from "react-router-dom";
import SidebarNav from "../components/SidebarNav";
// import classes from "../css/NavbarMinimal.module.css";

function MainLayout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <SidebarNav />

      {/* Content area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
export default MainLayout;
