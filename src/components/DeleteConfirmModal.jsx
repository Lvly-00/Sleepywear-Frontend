// src/components/DeleteConfirmModal.jsx
import { Modal, Button, Group, Text } from "@mantine/core";

function DeleteConfirmModal({ opened, onClose, name, onConfirm }) {
  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      centered
    >
      <Modal.Overlay />
      <Modal.Content
        style={{
          borderRadius: "26px",
          padding: " 20px",
          overflow: "hidden",
          minHeight: "220px",
          // width: "400px"
        }}
      >
        <Modal.Header>
          <Text align="center" color="#0D0F66"
            style={{
              width: "100%",
              fontWeight: "500",
              fontSize: "26px",
            }}>
            Delete Confirmation
          </Text>
        </Modal.Header>

        <Modal.Body>
          <Text align="center" color="#6B6B6B"
            style={{
              width: "100%",
              fontWeight: "400",
              fontSize: "18px",
              paddingBottom: "5px",
            }}>
            Are you sure you want to delete{" "}
            <Text span fw={700} style={{ textTransform: "uppercase" }}>
              {name || "this item"}
            </Text>

            <Text span >
              ?
            </Text>

          </Text>

          <Group justify="center" mt="lg" align="center" >
            <Button color="#F2F2F2"
              style={{
                borderRadius: "26px",
                width: "110px"
              }}
              onClick={onClose}>
              <Text color="#535353">
                Cancel
              </Text>

            </Button>
            <Button color="#9E2626"
              style={{
                borderRadius: "26px",
                width: "110px"
              }}
              onClick={onConfirm}>
              Delete
            </Button>
          </Group>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root >
  );
}

export default DeleteConfirmModal;
