import { NavLink } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconArchive,
  IconReceipt2,
  IconUser,
  IconLogout,
} from "@tabler/icons-react";
import { Center, Stack } from "@mantine/core";
import AppLogo from "../assets/AppLogo.svg";
import classes from "../css/NavbarMinimal.module.css";

const links = [
  { icon: IconLayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: IconShoppingBag, label: "Orders", path: "/orders" },
  { icon: IconArchive, label: "Inventory", path: "/collections" },
  { icon: IconReceipt2, label: "Invoices", path: "/invoices" },
];

function SidebarNav() {
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
        <NavLink to="/" className={classes.link}>
          <IconLogout size={22} stroke={1.5} />
          <span className={classes.linkLabel}>Logout</span>
        </NavLink>
      </Stack>
    </nav>
  );
}

export default SidebarNav;
