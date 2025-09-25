import { NavLink, useNavigate } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconArchive,
  IconUsers,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import { Center, Stack } from "@mantine/core";
import AppLogo from "../assets/AppLogo.svg";
import classes from "../css/NavbarMinimal.module.css";
import axios from "../api/axios"; // make sure axios is correctly configured

const links = [
  { icon: IconLayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: IconShoppingBag, label: "Orders", path: "/orders" },
  { icon: IconArchive, label: "Inventory", path: "/collections" },
  { icon: IconUsers, label: "Customers Log", path: "/customers" },

];

function SidebarNav() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    try {
      // Sanctum requires CSRF cookie first
      await axios.get("/sanctum/csrf-cookie");
      await axios.post("/api/logout");

      // Optional: Clear localStorage or auth state if needed
      localStorage.removeItem("user");
      // Redirect to login page
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <nav className={classes.navbar}>
      {/* Logo */}
      <Center>
        <img src={AppLogo} alt="App Logo" className={classes.logo} />
      </Center>

      {/* Main Links */}
      <div className={classes.navbarMain}>
        <Stack justify="center" gap={10}>
          {links.map(({ icon: Icon, label, path }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `${classes.link} ${isActive ? classes.active : ""}`
              }
            >
              <Icon size={22} stroke={1.5} />
              <span className={classes.linkLabel}>{label}</span>
            </NavLink>
          ))}
        </Stack>
      </div>

      {/* Bottom Links */}
      <Stack justify="center" gap={10}>
        <NavLink to="/settings" className={classes.link}>
          <IconUser size={22} stroke={1.5} />
          <span className={classes.linkLabel}>Account</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className={classes.link}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <IconLogout size={22} stroke={1.5} />
          <span className={classes.linkLabel}>Logout</span>
        </button>
      </Stack>
    </nav>
  );
}

export default SidebarNav;
