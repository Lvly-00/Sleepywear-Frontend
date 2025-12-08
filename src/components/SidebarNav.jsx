import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Center, Stack, Menu } from "@mantine/core";
import AppLogo from "../assets/Logo.svg";
import classes from "../css/NavbarMinimal.module.css";
import api from "../api/axios";
import { Icons } from "./Icons";
// Removed TopLoadingBar import

const links = [
  { icon: Icons.Dashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Icons.ShoppingBag, label: "Orders", path: "/orders" },
  { icon: Icons.Store, label: "Inventory", path: "/collections" },
  { icon: Icons.ContactBook, label: "Customers", path: "/customers" },
];

function SidebarNav() {
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

  // ====== NAVIGATION HANDLER ======
  const handleNavigation = (path) => {
    // Navigate immediately without fetching data first
    navigate(path);
  };

  const handleSettingsClick = () => {
    // Navigate immediately to settings
    navigate("/settings");
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
          {links.map(({ icon: Icon, label, path }) => {
            
            const isActive = location.pathname === path || (path === "/collections" && location.pathname.startsWith("/collections"));
            
            return (
              <div
                key={label}
                onClick={() => handleNavigation(path)}
                className={`${classes.link} ${isActive ? classes.active : ""}`}
                style={{
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <Icon active={isActive} size={25} />
                <span className={classes.linkLabel}>{label}</span>
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
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              className={classes.menuItem}
              color="white"
              leftSection={<Icons.Settings size={20} />}
              onClick={handleSettingsClick}
            >
              Settings
            </Menu.Item>
            <Menu.Item
              className={classes.menuItem}
              color="white"
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