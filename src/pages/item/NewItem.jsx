import React, { useState } from "react";
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
} from "@mantine/core";

export default function NewItem() {
  const { id } = useParams(); // collection ID
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: 0,
    notes: "",
  });
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("collection_id", id);
    data.append("name", form.name);
    data.append("price", form.price);
    data.append("notes", form.notes);
    if (file) data.append("image", file);

    await api.post("api/items", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    navigate(`/collections/${id}/items`);
  };

  return (
    <Paper shadow="sm" p="md">
      

      <Title order={3} mb="md">
        Add Item to Collection #{id}
      </Title>

      <form onSubmit={handleSubmit}>
        {/* ✅ Removed Item Code (auto-generated in backend) */}

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
          <Button type="submit">Save</Button>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
