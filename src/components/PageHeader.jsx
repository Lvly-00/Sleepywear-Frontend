import React, { useState } from "react";
import { Group, TextInput, Button, Text, ActionIcon, Tooltip } from "@mantine/core";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";
import api from "../api/axios";
import TopLoadingBar from "./TopLoadingBar";

const PageHeader = ({
  title,
  showSearch,
  search,
  setSearch,
  addLabel,
  addLink,
  onAdd,
  showBack,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleBack = async () => {
    setLoading(true);

    try {
      // If you're in an items page (e.g. /items/:id)
      if (location.pathname.includes("/items")) {
        const res = await api.get("/collections");
        navigate("/collections", { state: { preloadedCollections: res.data } });
      }

      // If you're inside collections (e.g. /collections/:id)
      else if (location.pathname.includes("/collections")) {
        const res = await api.get("/collections");
        navigate("/collections", { state: { preloadedCollections: res.data } });
      }

      // If you're in customers
      else if (location.pathname.includes("/customers")) {
        const res = await api.get("/customers");
        navigate("/customers", { state: { preloadedCustomers: res.data } });
      }

      // If you're in orders
      else if (location.pathname.includes("/orders")) {
        const res = await api.get("/orders");
        navigate("/orders", { state: { preloadedOrders: res.data } });
      }

      // Default fallback
      else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Failed to fetch before going back:", err);
      alert("Failed to reload data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopLoadingBar loading={loading} />

      <Group justify="space-between" mt={50}>
        {/* Left section: Back button + Title */}
        <Group>
          {showBack && (
            <Tooltip label="Reload & Go Back" position="bottom" withArrow>
              <ActionIcon
                variant="subtle"
                radius="xl"
                size={50}
                onClick={handleBack}
                disabled={loading}
                style={{
                  transition: "background-color 0.2s ease",
                  cursor: loading ? "wait" : "pointer",
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#D3D8FF")}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#E8EBFF")}
              >
                <Icons.Back size={32}/>
              </ActionIcon>
            </Tooltip>
          )}

          <Text
            component="h1"
            style={{
              fontFamily: "League Spartan, sans-serif",
              fontWeight: 700,
              fontSize: "64px",
              color: "#02034C",
              margin: 0,
            }}
          >
            {title}
          </Text>
        </Group>

        {/* Right section: Search + Add button */}
        <Group>
          {showSearch && (
            <TextInput
              placeholder={`Search ${title}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<Icons.Search style={{ color: "#444444" }} size={18} />}
              radius="md"
              style={{ maxWidth: 250, width: 250 }}
            />
          )}

          {addLabel &&
            (addLink ? (
              <Button
                component={Link}
                to={addLink}
                radius="md"
                style={{
                  backgroundColor: "#232D80",
                  width: 150,
                }}
              >
                {addLabel}
              </Button>
            ) : (
              <Button
                onClick={onAdd}
                radius="md"
                style={{
                  backgroundColor: "#232D80",
                }}
              >
                {addLabel}
              </Button>
            ))}
        </Group>
      </Group>
    </>
  );
};

export default PageHeader;
