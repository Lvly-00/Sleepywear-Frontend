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
import { DateInput } from "@mantine/dates";
import api from "../api/axios";
import { useCollectionStore } from "../store/collectionStore";

function AddCollectionModal({ opened, onClose }) {
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

  const { addCollection } = useCollectionStore();

  useEffect(() => {
    if (opened) {
      setForm({ name: "", release_date: "", capital: 0 });
      setErrors({ name: "", release_date: "", capital: "" });
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

    const newErrors = { name: "", release_date: "", capital: "" };
    let valid = true;

    if (!form.name.trim()) {
      newErrors.name = "Collection number is required";
      valid = false;
    }
    if (!form.release_date) {
      newErrors.release_date = "Release date is required";
      valid = false;
    }
    if (form.capital === null || form.capital < 0) {
      newErrors.capital = "Capital must be non-negative";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    try {
      const res = await api.post("/collections", form);
      addCollection(res.data);
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        // Laravel validation error format: { message, errors: { field: [msg] } }
        const validationErrors = error.response.data.errors || {};
        setErrors((prev) => ({
          ...prev,
          name: validationErrors.name ? validationErrors.name[0] : "",
          release_date: validationErrors.release_date ? validationErrors.release_date[0] : "",
          capital: validationErrors.capital ? validationErrors.capital[0] : "",
        }));
      } else {
        console.error(error.response?.data || error.message);
      }
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
            style={{ order: 0, marginRight: "1rem", color: "#AB8262" }}
          />
          <Modal.Title style={{ flex: 1 }}>
            <Text
              align="center"
              color="black"
              style={{ width: "100%", fontSize: "26px", fontWeight: "700" }}
            >
              New Collection
            </Text>
          </Modal.Title>
          <div style={{ width: 36 }} />
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <Stack spacing="sm">
              <TextInput
                label="Collection Number"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Enter collection number"
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
                value={form.release_date ? new Date(form.release_date) : null}
                onChange={(value) =>
                  handleChange({
                    target: { name: "release_date", value },
                  })
                }
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
