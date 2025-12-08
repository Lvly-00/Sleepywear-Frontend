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

function EditCollectionModal({ opened, onClose, collection, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    release_date: null,
    capital: 0,
    ordinal: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    release_date: "",
    capital: "",
    ordinal: "",
  });

  // New state to handle loading status
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (opened && collection) {
      const ordinalMatch = collection.name.match(/\d+/);
      const ordinalNumber = ordinalMatch ? ordinalMatch[0] : "";

      setForm({
        name: collection.name || "",
        release_date: collection.release_date ? new Date(collection.release_date) : null,
        capital: collection.capital || 0,
        ordinal: ordinalNumber,
      });
      setErrors({ name: "", release_date: "", capital: "" });
      // Reset submitting state when modal opens
      setIsSubmitting(false);
    }
  }, [opened, collection]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const handleCapitalChange = (value) => {
    setForm((f) => ({ ...f, capital: value }));
    setErrors((e) => ({ ...e, capital: "" }));
  };

  const handleDateChange = (value) => {
    setForm((f) => ({ ...f, release_date: value }));
    setErrors((e) => ({ ...e, release_date: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submitting if already loading
    if (isSubmitting) return;

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
    if (!form.ordinal || form.ordinal < 1) {
      newErrors.ordinal = "Collection Name is required";
      valid = false;
    }

    if (!valid) {
      setErrors(newErrors);
      return;
    }

    // 1. Start loading
    setIsSubmitting(true);

    try {
      const payload = {
        ...form,
        name: form.ordinal, // just the number string
        capital: form.capital,
        release_date:
          form.release_date && form.release_date instanceof Date
            ? form.release_date.toISOString().split("T")[0]
            : form.release_date,
      };

      const res = await api.put(`/collections/${collection.id}`, payload);

      if (onSuccess) onSuccess(res.data);
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors || {};
        setErrors((prev) => ({
          ...prev,
          name: validationErrors.name ? validationErrors.name[0] : "",
          release_date: validationErrors.release_date
            ? validationErrors.release_date[0]
            : "",
          capital: validationErrors.capital
            ? validationErrors.capital[0]
            : "",
        }));
      } else {
        console.error(error.response?.data || error.message);
      }
    } finally {
      // 2. Stop loading regardless of success or error
      // Note: If modal closes successfully, this might run on an unmounted component, which is fine in modern React.
      setIsSubmitting(false);
    }
  };

  return (
    <Modal.Root opened={opened} onClose={!isSubmitting ? onClose : undefined} centered>
      <Modal.Overlay />
      <Modal.Content style={{ borderRadius: 16, padding: 20 }}>
        <Modal.Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Modal.CloseButton
            size={35}
            // Disable close button while submitting
            disabled={isSubmitting}
            style={{ order: 0, marginRight: 16, color: "#AB8262" }}
          />
          <Modal.Title style={{ flex: 1 }}>
            <Text
              align="center"
              color="black"
              style={{ fontSize: 26, fontWeight: 700 }}
            >
              Edit Collection
            </Text>
          </Modal.Title>
          <div style={{ width: 36 }} />
        </Modal.Header>

        <Modal.Body>
          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing="sm">
              <TextInput
                label="Collection Number"
                name="ordinal"
                value={form.ordinal}
                onChange={(e) => setForm(f => ({ ...f, ordinal: e.target.value.replace(/\D/g, '') }))}
                error={errors.ordinal}
                placeholder="Enter collection number"
                required
                disabled={isSubmitting} 
              />

              <NumberInput
                label="Capital"
                placeholder="Enter capital"
                value={form.capital}
                onChange={(value) => {
                  let valStr = value?.toString() || "";
                  if (valStr.length > 1) {
                    valStr = valStr.replace(/^0+/, "");
                  }
                  const cleanedValue = valStr === "" ? 0 : parseInt(valStr, 10);

                  handleCapitalChange(cleanedValue);
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
                required
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />

              <Group mt="lg" justify="flex-end">
                <Button
                  color="#AB8262"
                  style={{ borderRadius: 15, width: 95, fontSize: 16 }}
                  type="submit"
                  disabled={isSubmitting}
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

export default EditCollectionModal;