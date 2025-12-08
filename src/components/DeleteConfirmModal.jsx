import React from 'react';
import { Modal, Button, Group, Text } from "@mantine/core";

function DeleteConfirmModal({ opened, onClose, name, onConfirm, message }) {
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
          padding: "20px",
          overflow: "hidden",
          minHeight: "220px",
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
          <Text
            align="center"
            color="#6B6B6B"
            style={{
              width: "100%",
              fontWeight: "400",
              fontSize: "18px",
              paddingBottom: "5px",
            }}
          >
            This will permanently delete all past orders for{" "}
            <Text span fw={700} style={{ textTransform: "uppercase" }}>
              {name || "this item"}
            </Text>
            . Are you sure you want to delete?
          </Text>


          {/* You can keep this logic here. If you don't pass a 'message' prop 
              from the parent, this part simply won't render. */}
          {message && (
            <Text
              align="center"
              color="#9E2626"
              size="sm"
              style={{ maxWidth: "95%", margin: "5px auto 0" }}
            >
              {message}
            </Text>
          )}

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
    </Modal.Root>
  );
}

export default DeleteConfirmModal;