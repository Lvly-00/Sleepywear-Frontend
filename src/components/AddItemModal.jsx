import React, { useState } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
  FileInput,
  Textarea,
  Button,
  Group,
} from "@mantine/core";
import api from "../api/axios";

export default function AddItemModal({
  opened,
  onClose,
  collectionId,
  onItemAdded,
}) {
  const [form, setForm] = useState({ name: "", price: 0, notes: "" });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({ name: "", price: "", file: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset errors
    setErrors({ name: "", price: "", file: "" });
    let hasError = false;

    // Validate fields manually
    if (!form.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Item name is required." }));
      hasError = true;
    }

    if (isNaN(form.price) || form.price < 0) {
      setErrors((prev) => ({
        ...prev,
        price: "Price must be a valid number ≥ 0.",
      }));
      hasError = true;
    }

    if (!file) {
      setErrors((prev) => ({ ...prev, file: "Image is required." }));
      hasError = true;
    }

    if (hasError) return;

    try {
      const data = new FormData();
      data.append("collection_id", collectionId);
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("notes", form.notes);
      data.append("image", file);

      const res = await api.post("/api/items", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onItemAdded(res.data);
      setForm({ name: "", price: 0, notes: "" });
      setFile(null);
      onClose();
    } catch (err) {
      console.error("Error adding item:", err.response?.data || err.message);
      setErrors((prev) => ({
        ...prev,
        name: "Failed to add item. Try again.",
      }));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Add Item to Collection #${collectionId}`}
      centered
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate>
        <TextInput
          label="Item Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          mt="sm"
        />

        <NumberInput
          label="Price"
          value={form.price}
          onChange={(val) => setForm({ ...form, price: val })}
          placeholder="0" 
          parser={(value) => value.replace(/[^\d.]/g, "")}
          error={errors.price}
          mt="sm"
        />

        <FileInput
          label="Item Image"
          value={file}
          onChange={setFile}
          error={errors.file}
          mt="sm"
        />

        <Textarea
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          mt="sm"
        />

        <Group mt="md">
          <Button type="submit">Save</Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
