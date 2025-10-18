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
          overflow: "hidden",
        }}
      >
        <Modal.Header>
          <Modal.Title>Delete Confirmation</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>

        <Modal.Body>
          <Text size="sm">
            Are you sure you want to delete{" "}
            <Text span fw={700}>
              {name || "this item"}
            </Text>
            ? This action cannot be undone.
          </Text>

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button color="red" onClick={onConfirm}>
              Delete
            </Button>
          </Group>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}

export default DeleteConfirmModal;
