// src/components/DeleteConfirmModal.jsx
import { modals } from "@mantine/modals";
import { Text } from "@mantine/core";

export function openDeleteConfirmModal({ title, name, onConfirm }) {
  modals.openConfirmModal({
    title: title || "Confirm Delete",
    centered: true,
    children: (
      <Text size="sm">
        Are you sure you want to delete{" "}
        <Text span fw={700}>
          {name || "this item"}
        </Text>
        ? This action cannot be undone.
      </Text>
    ),
    labels: { confirm: "Delete", cancel: "Cancel" },
    confirmProps: { color: "red" },
    onConfirm,
  });
}
