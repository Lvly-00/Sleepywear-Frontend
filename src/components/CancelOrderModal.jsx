import { Modal, Button, Group, Text } from "@mantine/core";

// Cache keys
const ORDER_ITEMS_STORAGE_KEY = "orderItemsCache";
const SELECTED_COLLECTION_STORAGE_KEY = "selectedCollectionCache";
const COLLECTIONS_STORAGE_KEY = "collectionsCache";

function CancelOrderModal({ opened, onClose, onConfirm, onResetItems }) {
  const handleYes = () => {
    try {
      // 🧹 Clear cached data
      localStorage.removeItem(ORDER_ITEMS_STORAGE_KEY);
      localStorage.removeItem(SELECTED_COLLECTION_STORAGE_KEY);
      localStorage.removeItem(COLLECTIONS_STORAGE_KEY);

      // 🧾 Reset frontend order state if provided
      if (onResetItems) onResetItems();

      // 🚀 Proceed with confirmation action (deleting order items + navigating)
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
