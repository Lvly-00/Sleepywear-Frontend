import React, { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
  FileInput,
  Textarea,
  Button,
  Group,
  Loader,
  Center,
  Text,
} from "@mantine/core";
import api from "../api/axios";

export default function EditItemModal({ opened, onClose, item, onItemUpdated }) {
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!item) return;
    setForm(item);
    setLoading(false);
  }, [item]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form) return;

    const data = new FormData();
    data.append("code", form.code);
    data.append("name", form.name);
    data.append("price", form.price);
    data.append("notes", form.notes);
    if (file) data.append("image", file);

    try {
      const res = await api.post(`/api/items/${item.id}?_method=PUT`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onItemUpdated(res.data); // update item in inventory
      onClose();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Item" size="lg" centered>
      {loading ? (
        <Center style={{ height: 200 }}>
          <Loader />
        </Center>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Item Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
          <TextInput
            label="Item Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            mt="sm"
          />
          <NumberInput
            label="Price"
            value={form.price}
            onChange={(val) => setForm({ ...form, price: val })}
            required
            mt="sm"
            placeholder="0"
          />
          <FileInput
            label="Item Image"
            value={file}
            onChange={setFile}
            mt="sm"
          />
          <Textarea
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            mt="sm"
          />
          <Group mt="md">
            <Button type="submit">Update</Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </Group>
        </form>
      )}
    </Modal>
  );
}
