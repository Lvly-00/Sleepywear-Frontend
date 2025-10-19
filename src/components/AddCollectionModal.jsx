import { useState } from "react";
import { Button, TextInput, Stack, NumberInput } from "@mantine/core";
import api from "../api/axios";

function AddCollectionModal({ onClose, onCollectionAdded }) {
  const [form, setForm] = useState({
    name: "",
    release_date: new Date().toISOString().split("T")[0],
    capital: 0, // added capital
  });

  const [errors, setErrors] = useState({
    name: "",
    release_date: "",
    capital: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleCapitalChange = (value) => {
    setForm({ ...form, capital: value });
    setErrors({ ...errors, capital: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = { name: "", release_date: "", capital: "" };

    if (!form.name.trim()) {
      newErrors.name = "Collection name is required";
      valid = false;
    }
    if (!form.release_date) {
      newErrors.release_date = "Release date is required";
      valid = false;
    }
    if (form.capital === null || form.capital < 0) {
      newErrors.capital = "Capital must be a non-negative number";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await api.post("/api/collections", form);

      if (onCollectionAdded) onCollectionAdded(res.data);
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
        <NumberInput
          label="Capital"
          value={form.capital}
          onChange={handleCapitalChange}
          min={0}
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          formatter={(value) =>
            !Number.isNaN(parseFloat(value))
            ? `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            : "₱ "
          }
          error={errors.capital}
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
