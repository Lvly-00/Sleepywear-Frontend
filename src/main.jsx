import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import "./index.css";
import "@mantine/core/styles.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Notifications position="top-right" autoClose={4000} />
      <ModalsProvider>
        <App />
      </ModalsProvider>
    </MantineProvider>
  </StrictMode>
);
