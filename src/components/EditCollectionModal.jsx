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

export default function EditCollectionModal({
  opened,
  onClose,
  collection,
  onCollectionUpdated,
}) {
  const [form, setForm] = useState({
    name: "",
    release_date: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    release_date: "",
  });

  useEffect(() => {
    if (collection && opened) {
      setForm({
        name: collection.name || "",
        release_date: collection.release_date
          ? new Date(collection.release_date)
          : null,
        capital: collection.capital || 0,

      });
      setErrors({ name: "", release_date: "", capital: "" });
    }
  }, [collection, opened]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleCapitalChange = (value) => {
    setForm({ ...form, capital: value });
    setErrors({ ...errors, capital: "" });
  };

  const handleDateChange = (value) => {
    setForm({ ...form, release_date: value });
    setErrors({ ...errors, release_date: "" });
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
      const payload = {
        ...form,
        release_date: form.release_date
          ? new Date(form.release_date).toISOString().split("T")[0]
          : null,
      };
      const res = await api.put(`/collections/${collection.id}`, payload);
      if (onCollectionUpdated) onCollectionUpdated(res.data);
      onClose();
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };


  return (
    <Modal.Root opened={opened} onClose={onClose} centered>
      <Modal.Overlay />
      <Modal.Content
        style={{
          borderRadius: "16px",
          padding: "20px",
        }}
      >
        {/* Header */}
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
              style={{
                width: "100%",
                fontSize: "26px",
                fontWeight: "700",
              }}
            >
              Edit Collection
            </Text>
          </Modal.Title>
          <div style={{ width: 36 }} />
        </Modal.Header>

        {/* Body */}
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <Stack spacing="sm">
              <TextInput
                label={<span style={{ fontWeight: 400 }}>
                  Collection Name</span>}
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Enter collection name"
                required
              />

              <NumberInput
                label={
                  <span style={{ fontWeight: 400 }}>
                    Capital
                  </span>
                }
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
                label={<span style={{ fontWeight: 400 }}>
                  Release Date</span>}
                placeholder="mm/dd/yyyy"
                name="release_date"
                value={form.release_date}
                onChange={handleDateChange}
                error={errors.release_date}
                required
                valueFormat="MM/DD/YYYY"
              />

              {/* Save Button */}
              <Group
                mt="lg"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
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
