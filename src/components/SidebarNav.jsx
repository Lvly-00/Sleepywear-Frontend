import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Center, Stack, Menu } from "@mantine/core";
import AppLogo from "../assets/Logo.svg";
import classes from "../css/NavbarMinimal.module.css";
import axios from "../api/axios";
import { Icons } from "./Icons";

const links = [
  { icon: Icons.Dashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Icons.ShoppingBag, label: "Orders", path: "/orders" },
  { icon: Icons.Store, label: "Inventory", path: "/collections" },
  { icon: Icons.ContactBook, label: "Customers", path: "/customers" },
];

function SidebarNav() {
  const navigate = useNavigate();
  const location = useLocation(); // detects active route

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
          {links.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
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
            <div className={classes.link} style={{ cursor: "pointer" }}>
              <Icons.User size={25} />
              <span className={classes.linkLabel}>Account </span>
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              className={classes.dropdownItem}
              leftSection={<Icons.Settings size={20} />}
              onClick={() => navigate("/settings")}
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
