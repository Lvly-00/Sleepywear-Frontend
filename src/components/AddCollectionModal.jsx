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

function AddCollectionModal({ opened, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    release_date: null,
    capital: 0,
  });

  const [errors, setErrors] = useState({
    name: "",
    release_date: "",
    capital: "",
  });

  useEffect(() => {
    if (opened) {
      setForm({ name: "", release_date: null, capital: 0 });
      setErrors({ name: "", release_date: "", capital: "" });
    }
  }, [opened]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const handleCapitalChange = (value) => {
    let strValue = value?.toString() || "";

    if (strValue.length > 1) {
      strValue = strValue.replace(/^0+/, "");
    }

    setForm((f) => ({ ...f, capital: strValue }));
    setErrors((e) => ({ ...e, capital: "" }));
  };


  const handleDateChange = (value) => {
    setForm((f) => ({ ...f, release_date: value }));
    setErrors((e) => ({ ...e, release_date: "" }));
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
      const payload = {
        ...form,
        release_date:
          form.release_date && form.release_date instanceof Date
            ? form.release_date.toISOString().split("T")[0]
            : form.release_date,
      };

      const res = await api.post("/collections", payload);

      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 422) {
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
      <Modal.Content style={{ borderRadius: 16, padding: 20 }}>
        <Modal.Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Modal.CloseButton size={35} style={{ order: 0, marginRight: 16, color: "#AB8262" }} />
          <Modal.Title style={{ flex: 1 }}>
            <Text align="center" color="black" style={{ fontSize: 26, fontWeight: 700 }}>
              New Collection
            </Text>
          </Modal.Title>
          <div style={{ width: 36 }} />
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing="sm">
              <TextInput
                label="Collection Number"
                name="name"
                value={form.name}
                onChange={(e) => {
                  const value = e.target.value;
                  const digitsOnly = value.replace(/\D/g, ""); // remove non-digits
                  setForm((f) => ({ ...f, name: digitsOnly }));
                  setErrors((e) => ({ ...e, name: "" }));
                }}
                error={errors.name}
                placeholder="Enter collection number"
                required
              />


              <NumberInput
                label="Capital"
                withAsterisk
                placeholder="Enter capital"
                value={form.capital}
                onChange={(value) => {
                  let valStr = value?.toString() || "";

                  if (valStr.length > 1) {
                    valStr = valStr.replace(/^0+/, "");
                  }
                  const cleanedValue = valStr === "" ? 0 : parseInt(valStr, 10);

                  setForm({ ...form, capital: cleanedValue });
                }}
                min={0}
                step={1}
                precision={0}
                allowDecimal={false}
                allowNegative={false}
                clampBehavior="strict"
                parser={(value) =>
                  value.replace(/\₱\s?|(,*)/g, "").replace(/\./g, "")
                }
                formatter={(value) =>
                  !Number.isNaN(parseInt(value, 10))
                    ? `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : "₱ "
                }
                error={errors.capital}
              />


              <DateInput
                label="Release Date"
                placeholder="MM/DD/YYYY"
                value={form.release_date}
                onChange={handleDateChange}
                error={errors.release_date}
                required
                valueFormat="MM/DD/YYYY"
                clearable={false}
              />

              <Group mt="lg" justify="flex-end">
                <Button
                  color="#AB8262"
                  style={{ borderRadius: 15, width: 90, fontSize: 16 }}
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
