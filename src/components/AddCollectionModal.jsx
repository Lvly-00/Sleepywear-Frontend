import React, { useState, useEffect } from "react";
import {
  Stack,
  TextInput,
  NumberInput,
  Button,
  Modal,
  Text,
  Group,
} from "@mantine/core";
import api from "../api/axios";

function AddCollectionModal({ opened, onClose, onCollectionAdded }) {
  const [form, setForm] = useState({
    name: "",
    release_date: "",
    capital: 0,
  });

  const [errors, setErrors] = useState({
    name: "",
    release_date: "",
    capital: "",
  });

  useEffect(() => {
    if (opened) {
      setForm({
        name: "",
        release_date: "",
        capital: 0,
      });
      setErrors({
        name: "",
        release_date: "",
        capital: "",
      });
    }
  }, [opened]);

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
      newErrors.name = "Collection number is required";
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
                fontWeight: "600",
              }}
            >
              New Collection
            </Text>
          </Modal.Title>
          <div style={{ width: 36 }} />
        </Modal.Header>

        {/* Body */}
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <Stack spacing="sm">
              <TextInput
                label={
                  <span>
                    Collection Number
                  </span>
                }
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Enter collection number"
                required
              />

              <NumberInput
                label={
                  <span>
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

              <TextInput
                label={
                  <span>
                    Release Date
                  </span>
                }
                name="release_date"
                type="date"
                value={form.release_date}
                onChange={handleChange}
                error={errors.release_date}
                required
              />

              {/* Save button aligned to right */}
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
                    width: "110px",
                    fontSize: "16px",
                  }}
                  type="submit"
                >
                  Save
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}

export default AddCollectionModal;
