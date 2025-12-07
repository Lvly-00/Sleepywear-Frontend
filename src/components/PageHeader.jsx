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

const ORDER_ITEMS_STORAGE_KEY = "orderItemsCache_v2";
// We don't check collection key anymore for the warning
// const SELECTED_COLLECTION_STORAGE_KEY = "selectedCollectionCache_v2"; 

const PageHeader = ({
  title,
  showSearch,
  search,
  setSearch,
  onSearchEnter, 
  addLabel,
  addLink,
  onAdd,
  showBack,
  resetOrder,
  selectedItems,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // 🔥 UPDATED: Strictly check for ITEMS only. 
  // Selecting a collection doesn't count as "unsaved work".
  const hasPendingOrderData = () => {
    try {
      const itemsJson = localStorage.getItem(ORDER_ITEMS_STORAGE_KEY);
      
      // Only return TRUE if the key exists AND the array has items inside
      if (itemsJson) {
        const items = JSON.parse(itemsJson);
        return Array.isArray(items) && items.length > 0;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

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

      if (resetOrder) resetOrder();

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
    if (location.pathname.includes("/confirm-order")) {
      navigate("/add-order");
      return;
    }

    if (location.pathname.includes("/add-order")) {
      // 🔥 Check if we really have items to cancel
      if (hasPendingOrderData()) {
        setShowCancelModal(true);
      } else {
        // No items? Just navigate back freely
        setLoading(true);
        try {
          const res = await api.get("/orders");
          navigate("/orders", { state: { preloadedOrders: res.data } });
        } catch (err) {
          navigate("/orders");
        } finally {
          setLoading(false);
        }
      }
      return;
    }

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearchEnter) {
      onSearchEnter();
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

        <Group>
          {showSearch && (
            <TextInput
              placeholder={`Search ${title}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
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