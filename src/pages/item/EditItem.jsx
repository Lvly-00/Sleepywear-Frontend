import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  TextInput,
  NumberInput,
  FileInput,
  Textarea,
  Button,
  Group,
  Paper,
  Title,
  Loader,
  Center,
} from "@mantine/core";
import CollectionBreadcrumbs from "../../components/CollectionBreadcrumbs";

export default function EditItem() {
  const { id } = useParams(); // item ID
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get(`/api/items/${id}`).then((res) => {
      setForm(res.data);
    });
  }, [id]);

  if (!form) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("code", form.code);
    data.append("name", form.name);
    data.append("price", form.price);
    data.append("notes", form.notes);
    if (file) data.append("image", file);

    await api.post(`/api/items/${id}?_method=PUT`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    navigate(-1);
  };

  return (
    <Paper shadow="sm" p="md">
      <CollectionBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Collections", to: "/collections" },
          { label: "Edit Item" },
        ]}
      />

      <Title order={3} mb="md">
        Edit Item
      </Title>

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
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
