import { useState } from "react";
import { Button, TextInput, Stack } from "@mantine/core";
import api from "../api/axios";

function AddCollectionModal({ onClose, onCollectionAdded }) {
  const [form, setForm] = useState({
    name: "",
    release_date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState({
    name: "",
    release_date: "",
  });

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
      // 🔹 Capture the response from backend
      const res = await api.post("/api/collections", form);

      // 🔹 Send the new collection back to parent
      if (onCollectionAdded) onCollectionAdded(res.data);

      // 🔹 Close modal
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
        <Button type="submit">Save Collection</Button>
      </Stack>
    </form>
  );
}

export default AddCollectionModal;
