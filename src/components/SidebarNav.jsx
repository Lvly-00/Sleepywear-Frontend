import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Center, Stack, Menu } from "@mantine/core";
import AppLogo from "../assets/Logo.svg";
import classes from "../css/NavbarMinimal.module.css";
import api from "../api/axios";
import { Icons } from "./Icons";
import TopLoadingBar from "./TopLoadingBar";

const links = [
  { icon: Icons.Dashboard, label: "Dashboard", path: "/dashboard", api: "/dashboard-summary", key: "preloadedSummary" },
  { icon: Icons.ShoppingBag, label: "Orders", path: "/orders", api: "/orders", key: "preloadedOrders" },
  { icon: Icons.Store, label: "Inventory", path: "/collections", api: "/collections", key: "preloadedCollections" },
  { icon: Icons.ContactBook, label: "Customers", path: "/customers", api: "/customers", key: "preloadedCustomers" },
];

function SidebarNav() {
  // Track which specific link is currently fetching
  const [fetchingPath, setFetchingPath] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // ====== CUSTOM BACK NAVIGATION LOGIC ======
  useEffect(() => {
    const handlePopState = (e) => {
      const path = location.pathname;
      if (path === "/confirm-order") {
        e.preventDefault();
        navigate("/add-order", { replace: true });
      } else if (path === "/add-order") {
        e.preventDefault();
        navigate("/orders", { replace: true });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [location, navigate]);

  // ====== GENERIC PRE-FETCH HANDLER ======
  const handleNavigation = async (e, path, apiEndpoint, stateKey) => {
    e.preventDefault();
    

    if (fetchingPath) return; // Prevent multiple clicks

    setFetchingPath(path);

    try {
      // 1. Fetch data WHILE staying on the current page
      const res = await api.get(apiEndpoint);
      
      // 2. Data received! Now navigate and pass data in state
      navigate(path, { state: { [stateKey]: res.data } });
      
    } catch (err) {
      console.error(`Failed to load ${path}:`, err);
      // Optional: Add a toast notification here
    } finally {
      setFetchingPath(null);
    }
  };

  const handleSettingsClick = async (e) => {
    e.preventDefault();
    if (fetchingPath) return;

    setFetchingPath("settings");
    try {
      const res = await api.get("/user/settings");
      navigate("/settings", { state: { preloadedProfile: res.data } });
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setFetchingPath(null);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout");
      localStorage.clear();
      sessionStorage.clear();
      delete api.defaults.headers.common["Authorization"];
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className={classes.navbar}>
      <Center className={classes.logoWrapper}>
        <img src={AppLogo} alt="Logo" className={classes.logo} />
      </Center>

      <div className={classes.navbarMain}>
        <Stack justify="center" gap={10}>
          {links.map(({ icon: Icon, label, path, api, key }) => {
            const isActive = location.pathname === path || (path === "/collections" && location.pathname.startsWith("/collections"));
            const isLoadingThis = fetchingPath === path;

            return (
              <div
                key={label}
                onClick={(e) => handleNavigation(e, path, api, key)}
                className={`${classes.link} ${isActive ? classes.active : ""}`}
                style={{
                  cursor: isLoadingThis || fetchingPath ? "wait" : "pointer",
                  position: "relative",
                  opacity: (fetchingPath && !isLoadingThis) ? 0.5 : 1 // Dim other links when one is loading
                }}
              >
                <Icon active={isActive} size={25} />
                <span className={classes.linkLabel}>{label}</span>
                
                {/* Loader shows INSIDE the button while fetching */}
                {isLoadingThis && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                    <TopLoadingBar loading={true} />
                  </div>
                )}
              </div>
            );
          })}
        </Stack>
      </div>

      <div className={classes.navbarBottom}>
        <Menu shadow="md" width={240} classNames={{ dropdown: classes.dropdown }}>
          <Menu.Target>
            <div 
              className={classes.link} 
              style={{ cursor: "pointer", position: "relative" }}
            >
              <Icons.User size={25} />
              <span className={classes.linkLabel}>Account</span>
              {fetchingPath === "settings" && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                  <TopLoadingBar loading={true} />
                </div>
              )}
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<Icons.Settings size={20} />}
              onClick={handleSettingsClick}
            >
              Settings
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<Icons.Logout size={20} />}
              onClick={handleLogout}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </nav>
  );
}

export default SidebarNav;