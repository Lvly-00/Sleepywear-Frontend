import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SidebarNav from "../components/SidebarNav";
import TopLoadingBar from "../components/TopLoadingBar";

function MainLayout() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show loading bar on location change
    setLoading(true);

    // Hide loading bar after 300ms (simulate page load)
    const timer = setTimeout(() => setLoading(false), 300);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="flex h-screen">
      <SidebarNav />
      <main className="flex-1 p-6 overflow-y-auto">
        <TopLoadingBar loading={loading} />
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
