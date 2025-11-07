import React, { useState } from "react";
import {
  Group,
  TextInput,
  Button,
  Text,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Icons } from "./Icons";
import api from "../api/axios";
import TopLoadingBar from "./TopLoadingBar";
import CancelOrderModal from "./CancelOrderModal";

const PageHeader = ({
  title,
  showSearch,
  search,
  setSearch,
  addLabel,
  addLink,
  onAdd,
  showBack,
  resetOrder, // optional prop to reset local order state
  selectedItems, // array of selected order items to delete
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleConfirmCancel = async () => {
    setShowCancelModal(false);
    setLoading(true);

    try {
      if (selectedItems && selectedItems.length > 0) {
        await Promise.all(
          selectedItems.map((itemId) =>
            api.delete(`/order-items/${itemId}`).catch((err) => {
              console.error(`Failed to delete item ${itemId}:`, err);
            })
          )
        );
      }

      // Reset local order state (if provided)
      if (resetOrder) resetOrder();

      // Fetch updated orders and navigate
      const res = await api.get("/orders");
      navigate("/orders", { state: { preloadedOrders: res.data } });
    } catch (err) {
      console.error("Failed to cancel order:", err);
      alert("An error occurred while canceling the order. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleBack = async () => {
    // 🧾 If in CONFIRM ORDER → just go back to Add Order (no modal)
    if (location.pathname.includes("/confirm-order")) {
      navigate("/add-order");
      return;
    }

    // ❌ If in ADD ORDER → show cancel modal
    if (location.pathname.includes("/add-order")) {
      setShowCancelModal(true);
      return;
    }

    // 🔁 Normal back navigation for other pages
    setLoading(true);
    try {
      if (location.pathname.includes("/items")) {
        const res = await api.get("/collections");
        navigate("/collections", { state: { preloadedCollections: res.data } });
      } else if (location.pathname.includes("/collections")) {
        const res = await api.get("/collections");
        navigate("/collections", { state: { preloadedCollections: res.data } });
      } else if (location.pathname.includes("/customers")) {
        const res = await api.get("/customers");
        navigate("/customers", { state: { preloadedCustomers: res.data } });
      } else if (location.pathname.includes("/orders")) {
        const res = await api.get("/orders");
        navigate("/orders", { state: { preloadedOrders: res.data } });
      } else {
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

      <CancelOrderModal
        opened={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />

      <Group justify="space-between" mt={50}>
        {/* Left: Back button + Title */}
        <Group>
          {showBack && (
            <Tooltip label="Go Back" position="bottom" withArrow>
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
              >
                <Icons.Back size={32} />
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

        {/* Right: Search + Add Button */}
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
