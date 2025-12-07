// CancelOrderModal.jsx
import React from "react";
import { Modal, Button, Group, Text } from "@mantine/core";

// Cache keys
const ORDER_ITEMS_STORAGE_KEY = "orderItemsCache_v2";
const SELECTED_COLLECTION_STORAGE_KEY = "selectedCollectionCache_v2";

function CancelOrderModal({ opened, onClose, onConfirm, onResetItems }) {
  
  // 🔥 Helper to check if there are actual items in the cache
  const hasSelectedItems = () => {
    try {
      const itemsJson = localStorage.getItem(ORDER_ITEMS_STORAGE_KEY);
      
      // If no key exists, return false
      if (!itemsJson) return false;

      // Parse the JSON to check if the array actually has items
      const items = JSON.parse(itemsJson);
      return Array.isArray(items) && items.length > 0;
    } catch (e) {
      console.error("Error parsing order items:", e);
      return false;
    }
  };

  // 🔥 Checks:
  // 1. Do we have specific items selected? (Priority)
  // 2. OR do we have a collection selected? (Optional: remove this line if you ONLY want it to trigger on items)
  const shouldRender = 
    hasSelectedItems() || 
    localStorage.getItem(SELECTED_COLLECTION_STORAGE_KEY);

  // If there are no items (and no collection selected), do not render the modal
  if (!shouldRender) {
    return null;
  }

  const handleYes = () => {
    try {
      localStorage.removeItem(ORDER_ITEMS_STORAGE_KEY);
      localStorage.removeItem(SELECTED_COLLECTION_STORAGE_KEY);
      
      if (onResetItems) onResetItems();
      if (onConfirm) onConfirm();
    } catch (err) {
      console.error("Failed to clear order cache:", err);
    }
  };

  return (
    <Modal.Root opened={opened} onClose={onClose} centered>
      <Modal.Overlay />
      <Modal.Content
        style={{
          borderRadius: "26px",
          padding: "20px",
          overflow: "hidden",
          minHeight: "220px",
        }}
      >
        <Modal.Header>
          <Text
            align="center"
            color="#0D0F66"
            style={{
              width: "100%",
              fontWeight: 500,
              fontSize: "26px",
            }}
          >
            Cancel Order
          </Text>
        </Modal.Header>

        <Modal.Body>
          <Text
            align="center"
            color="#6B6B6B"
            style={{
              width: "100%",
              fontWeight: 400,
              fontSize: "18px",
              paddingBottom: "5px",
            }}
          >
            Are you sure you want to delete{" "}
            <Text span fw={700} style={{ textTransform: "uppercase" }}>
              this ORDER
            </Text>
            <Text span>?</Text>
          </Text>

          <Group justify="center" mt="lg" align="center">
            <Button
              color="#F2F2F2"
              style={{
                borderRadius: "26px",
                width: "110px",
              }}
              onClick={onClose}
            >
              <Text color="#535353">No</Text>
            </Button>

            <Button
              color="#9E2626"
              style={{
                borderRadius: "26px",
                width: "110px",
              }}
              onClick={handleYes}
            >
              Yes
            </Button>
          </Group>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}

export default CancelOrderModal;