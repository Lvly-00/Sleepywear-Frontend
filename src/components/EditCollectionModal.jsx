import React, { useState, useEffect } from "react";
import {
  Stack,
  TextInput,
  Button,
  Modal,
  Text,
  Group,
  NumberInput,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import api from "../api/axios";
import { useCollectionStore } from "../store/collectionStore";

export default function EditCollectionModal({
  opened,
  onClose,
  collection,
  onCollectionUpdated, // ✅ ensure this callback is called after edit
}) {
  const [form, setForm] = useState({
    name: "",
    release_date: "",
    capital: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    release_date: "",
    capital: "",
  });

  const { updateCollection } = useCollectionStore();

  useEffect(() => {
    if (collection && opened) {
      setForm({
        name: collection.name || "",
        release_date: collection.release_date
          ? new Date(collection.release_date)
          : null,
        capital: collection.capital ?? "",
      });
      setErrors({ name: "", release_date: "", capital: "" });
    }
  }, [collection, opened]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCapitalChange = (value) => {
    if (value !== undefined) {
      setForm((prev) => ({ ...prev, capital: value }));
      setErrors((prev) => ({ ...prev, capital: "" }));
    }
  };

  const handleDateChange = (value) => {
    setForm((prev) => ({ ...prev, release_date: value }));
    setErrors((prev) => ({ ...prev, release_date: "" }));
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
    if (form.capital === "" || form.capital === null || form.capital < 0) {
      newErrors.capital = "Capital must be a non-negative number";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        ...form,
        capital: parseFloat(form.capital),
        release_date: form.release_date
          ? new Date(form.release_date).toISOString().split("T")[0]
          : null,
      };

      const res = await api.put(`/collections/${collection.id}`, payload);

      // ✅ Update Zustand store instantly
      updateCollection(res.data);

      // ✅ Also trigger parent callback
      if (onCollectionUpdated) onCollectionUpdated(res.data);

      onClose();
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <Modal.Root opened={opened} onClose={onClose} centered>
      <Modal.Overlay />
      <Modal.Content style={{ borderRadius: "16px", padding: "20px" }}>
        <Modal.Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Modal.CloseButton
            size={35}
            style={{
              order: 0,
              marginRight: "1rem",
              color: "#AB8262",
            }}
          />
          <Modal.Title style={{ flex: 1 }}>
            <Text
              align="center"
              color="black"
              style={{ width: "100%", fontSize: "26px", fontWeight: "700" }}
            >
              Edit Collection
            </Text>
          </Modal.Title>
          <div style={{ width: 36 }} />
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <Stack spacing="sm">
              <TextInput
                label="Collection Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Enter collection name"
                required
              />

              <NumberInput
                label="Capital"
                placeholder="Enter capital"
                value={form.capital}
                onChange={handleCapitalChange}
                min={0}
                parser={(value) => value.replace(/\₱\s?|(,*)/g, "")}
                formatter={(value) =>
                  !Number.isNaN(parseFloat(value))
                    ? `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "₱ "
                }
                error={errors.capital}
                required
              />

              <DateInput
                label="Release Date"
                placeholder="mm/dd/yyyy"
                name="release_date"
                value={form.release_date}
                onChange={handleDateChange}
                error={errors.release_date}
                required
                valueFormat="MM/DD/YYYY"
              />


              <Group mt="lg" justify="flex-end">
                <Button
                  color="#AB8262"
                  style={{
                    borderRadius: "15px",
                    width: "90px",
                    fontSize: "16px",
                  }}
                  type="submit"
                >
                  Update
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
