import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Center, Stack, Menu } from "@mantine/core";
import AppLogo from "../assets/Logo.svg";
import classes from "../css/NavbarMinimal.module.css";
import api from "../api/axios";
import { Icons } from "./Icons";
import TopLoadingBar from "./TopLoadingBar";

const links = [
  { icon: Icons.Dashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Icons.ShoppingBag, label: "Orders", path: "/orders" },
  { icon: Icons.Store, label: "Inventory", path: "/collections" },
  { icon: Icons.ContactBook, label: "Customers", path: "/customers" },
];

function SidebarNav() {
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);

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

  // ---- Handle Settings Navigation ----
  const handleSettingsClick = async (e) => {
    e.preventDefault();
    if (loadingSettings) return;

    setLoadingSettings(true);
    try {
      const res = await api.get("/user/settings");
      // Pass entire settings data to settings page as preloaded data
      navigate("/settings", { state: { preloadedProfile: res.data } });
    } catch (err) {
      console.error("Failed to fetch user settings:", err);
      alert("Failed to load settings. Please try again.");
    } finally {
      setLoadingSettings(false);
    }
  };

  // ---- Handle Dashboard Navigation ----
  const handleDashboardClick = async (e) => {
    e.preventDefault();
    if (loadingDashboard) return;

    setLoadingDashboard(true);
    try {
      const res = await api.get("/dashboard-summary");
      navigate("/dashboard", { state: { preloadedSummary: res.data } });
    } catch (err) {
      console.error("Failed to fetch dashboard summary:", err);
      alert("Failed to load dashboard. Please try again.");
    } finally {
      setLoadingDashboard(false);
    }
  };

  // ---- Handle Orders Navigation ----
  const handleOrdersClick = async (e) => {
  e.preventDefault();
  if (loadingOrders) return;

  setLoadingOrders(true);
  try {
    const res = await api.get("/orders");
    navigate("/orders", { state: { preloadedOrders: res.data } });
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    alert("Failed to load orders. Please try again.");
  } finally {
    setLoadingOrders(false);
  }
};


  // ---- Handle Inventory Navigation ----
  const handleInventoryClick = async (e) => {
    e.preventDefault();
    if (loadingInventory) return;

    setLoadingInventory(true);
    try {
      const res = await api.get("/collections");
      navigate("/collections", { state: { preloadedCollections: res.data } });
    } catch (err) {
      console.error("Failed to fetch collections:", err);
      alert("Failed to load inventory. Please try again.");
    } finally {
      setLoadingInventory(false);
    }
  };

  // ---- Handle Customers Navigation ----
  const handleCustomersClick = async (e) => {
    e.preventDefault();
    if (loadingCustomers) return;

    setLoadingCustomers(true);
    try {
      const res = await api.get("/customers");
      navigate("/customers", { state: { preloadedCustomers: res.data } });
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      alert("Failed to load customers. Please try again.");
    } finally {
      setLoadingCustomers(false);
    }
  };

  // ---- Handle Logout ----
  const handleLogout = async () => {
    try {
      await api.post("/logout");
      localStorage.clear();
      sessionStorage.clear();
      delete api.defaults.headers.common["Authorization"];
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <nav className={classes.navbar}>
      {/* Logo */}
      <Center className={classes.logoWrapper}>
        <img src={AppLogo} alt="SLEEPYWEARS Logo" className={classes.logo} />
      </Center>

      {/* Main Links */}
      <div className={classes.navbarMain}>
        <Stack justify="center" gap={10}>
          {links.map(({ icon: Icon, label, path }) => {
            const isActive =
              location.pathname === path ||
              (path === "/collections" &&
                location.pathname.startsWith("/collections"));

            if (path === "/dashboard") {
              return (
                <div
                  key={label}
                  onClick={handleDashboardClick}
                  className={`${classes.link} ${isActive ? classes.active : ""}`}
                  style={{
                    cursor: loadingDashboard ? "wait" : "pointer",
                    position: "relative",
                  }}
                  aria-disabled={loadingDashboard}
                >
                  <Icon active={isActive} size={25} />
                  <span className={classes.linkLabel}>{label}</span>
                  {loadingDashboard && (
                    <div
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
                    >
                      <TopLoadingBar loading={true} />
                    </div>
                  )}
                </div>
              );
            }

            if (path === "/orders") {
              return (
                <div
                  key={label}
                  onClick={handleOrdersClick}
                  className={`${classes.link} ${isActive ? classes.active : ""}`}
                  style={{
                    cursor: loadingOrders ? "wait" : "pointer",
                    position: "relative",
                  }}
                  aria-disabled={loadingOrders}
                >
                  <Icon active={isActive} size={25} />
                  <span className={classes.linkLabel}>{label}</span>
                  {loadingOrders && (
                    <div
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
                    >
                      <TopLoadingBar loading={true} />
                    </div>
                  )}
                </div>
              );
            }

            if (path === "/collections") {
              return (
                <div
                  key={label}
                  onClick={handleInventoryClick}
                  className={`${classes.link} ${isActive ? classes.active : ""}`}
                  style={{
                    cursor: loadingInventory ? "wait" : "pointer",
                    position: "relative",
                  }}
                  aria-disabled={loadingInventory}
                >
                  <Icon active={isActive} size={25} />
                  <span className={classes.linkLabel}>{label}</span>
                  {loadingInventory && (
                    <div
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
                    >
                      <TopLoadingBar loading={true} />
                    </div>
                  )}
                </div>
              );
            }

            if (path === "/customers") {
              return (
                <div
                  key={label}
                  onClick={handleCustomersClick}
                  className={`${classes.link} ${isActive ? classes.active : ""}`}
                  style={{
                    cursor: loadingCustomers ? "wait" : "pointer",
                    position: "relative",
                  }}
                  aria-disabled={loadingCustomers}
                >
                  <Icon active={isActive} size={25} />
                  <span className={classes.linkLabel}>{label}</span>
                  {loadingCustomers && (
                    <div
                      style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
                    >
                      <TopLoadingBar loading={true} />
                    </div>
                  )}
                </div>
              );
            }

            return (
              <NavLink
                key={label}
                to={path}
                className={`${classes.link} ${isActive ? classes.active : ""}`}
              >
                <Icon active={isActive} size={25} />
                <span className={classes.linkLabel}>{label}</span>
              </NavLink>
            );
          })}
        </Stack>
      </div>

      {/* Account Settings Dropdown */}
      <div className={classes.navbarBottom}>
        <Menu
          shadow="md"
          width={240}
          classNames={{ dropdown: classes.dropdown }}
          styles={{
            dropdown: {
              padding: "10px",
              fontSize: "16px",
            },
            item: {
              padding: "8px 14px",
            },
          }}
        >
          <Menu.Target>
            <div
              className={classes.link}
              style={{ cursor: "pointer", position: "relative" }}
              aria-disabled={loadingSettings}
            >
              <Icons.User size={25} />
              <span className={classes.linkLabel}>Account</span>
              {loadingSettings && (
                <div
                  style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
                >
                  <TopLoadingBar loading={true} />
                </div>
              )}
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              className={classes.dropdownItem}
              leftSection={<Icons.Settings size={20} />}
              onClick={handleSettingsClick}
              disabled={loadingSettings}
            >
              Settings
            </Menu.Item>
            <Menu.Item
              className={classes.dropdownItem}
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
