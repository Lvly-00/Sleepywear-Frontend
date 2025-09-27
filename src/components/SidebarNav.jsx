import { NavLink, useNavigate } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconArchive,
  IconUsers,
  IconUser,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";
import { Center, Stack, Menu } from "@mantine/core";
import AppLogo from "../assets/Logo.svg";
import classes from "../css/NavbarMinimal.module.css";
import axios from "../api/axios";

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
      await axios.get("/sanctum/csrf-cookie");
      await axios.post("/api/logout");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Failed to logout. Please try again.");
    }
  };

  return (
    <nav className={classes.navbar}>
      {/* Logo */}
      <Center className={classes.logoWrapper}>
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

      {/* Account Settings Dropdown */}
      <div className={classes.navbarBottom}>
        <Menu
          shadow="md"
          width={180}
          classNames={{ dropdown: classes.dropdown }}
        >
          <Menu.Target>
            <div className={classes.link} style={{ cursor: "pointer" }}>
              <IconUser size={22} stroke={1.5} />
              <span className={classes.linkLabel}>Account Settings</span>
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              className={classes.dropdownItem}
              leftSection={<IconSettings size={18} />}
              onClick={() => navigate("/settings")}
            >
              Settings
            </Menu.Item>
            <Menu.Item
              className={classes.dropdownItem}
              color="red"
              leftSection={<IconLogout size={18} />}
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
