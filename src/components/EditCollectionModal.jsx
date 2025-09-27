import { useEffect, useState } from "react";
import { Button, TextInput, Stack } from "@mantine/core";
import api from "../api/axios";

export default function EditCollectionModal({ opened, onClose, collection, onCollectionUpdated }) {
  const [form, setForm] = useState({
    name: "",
    release_date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({
    name: "",
    release_date: "",
  });

  useEffect(() => {
    if (!collection) return;
    setForm({
      name: collection.name || "",
      release_date: collection.release_date || new Date().toISOString().split("T")[0],
    });
  }, [collection]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = { name: "", release_date: "" };
    if (!form.name.trim()) {
      newErrors.name = "Collection name is required";
      valid = false;
    }
    if (!form.release_date) {
      newErrors.release_date = "Release date is required";
      valid = false;
    }
    if (!valid) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await api.put(`/api/collections/${collection.id}`, form);
      if (onCollectionUpdated) onCollectionUpdated(res.data);
      if (onClose) onClose();
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <TextInput
          label="Collection Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
        <TextInput
          label="Release Date"
          name="release_date"
          type="date"
          value={form.release_date}
          onChange={handleChange}
          error={errors.release_date}
          required
        />
        <Button type="submit">Update Collection</Button>
      </Stack>
    </form>
  );
}
