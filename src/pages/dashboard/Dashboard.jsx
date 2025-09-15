import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Group, Title } from "@mantine/core";

function Dashboard() {
  const navigate = useNavigate();

  const buttons = [
    { label: "Logout", path: "/" },
    { label: "Inventory", path: "/inventory" },
    { label: "Orders", path: "/orders" },
    { label: "Settings", path: "/settings" },
    { label: "Analytics", path: "/analytics" },
    { label: "Invoices", path: "/invoices" },
  ];

  return (
    <>
      <Title order={1} mb="md">
        Dashboard
      </Title>
      <Group justify="center" gap="md" wrap="wrap">
        {buttons.map((btn, index) => (
          <Button key={index} onClick={() => navigate(btn.path)}>
            {btn.label}
          </Button>
        ))}
      </Group>
    </>
  );
}

export default Dashboard;
