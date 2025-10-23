import React, { useState, useEffect } from "react";
import {
  Modal,
  Text,
  TextInput,
  NumberInput,
  Button,
  Group,
} from "@mantine/core";
import api from "../api/axios";

export default function AddItemModal({ opened, onClose, collectionId, onItemAdded }) {
  const [form, setForm] = useState({ name: "", price: 0 });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({ name: "", price: "", file: "" });

  useEffect(() => {
    if (opened) {
      setForm({ name: "", price: 0 });
      setFile(null);
      setPreview(null);
      setErrors({ name: "", price: "", file: "" });
    }
  }, [opened]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ name: "", price: "", file: "" });

    let hasError = false;

    if (!form.name.trim()) {
      setErrors((prev) => ({ ...prev, name: "Item name is required." }));
      hasError = true;
    }

    if (isNaN(form.price) || form.price < 0) {
      setErrors((prev) => ({ ...prev, price: "Price must be ≥ 0." }));
      hasError = true;
    }

    if (!file) {
      setErrors((prev) => ({ ...prev, file: "Image is required." }));
      hasError = true;
    }

    if (hasError) return;

    try {
      const data = new FormData();
      data.append("collection_id", collectionId);
      data.append("name", form.name);
      data.append("price", form.price);
      data.append("image", file);

      const res = await api.post("/items", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onItemAdded(res.data);
      onClose();
    } catch (err) {
      console.error("Error adding item:", err.response?.data || err.message);
      setErrors((prev) => ({
        ...prev,
        name: "Failed to add item. Try again.",
      }));
    }


  };

  return (
    <Modal.Root opened={opened} onClose={onClose} centered>
      <Modal.Overlay />
      <Modal.Content
        style={{
          borderRadius: "20px",
          padding: "10px",
          margin: "auto",
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
              style={{ width: "100%", fontSize: "26px", fontWeight: "700" }}
            >
              Add Item
            </Text>
          </Modal.Title>
          <div style={{ width: 36 }} />
        </Modal.Header>

        {/* Body */}
        <Modal.Body>
          <form onSubmit={handleSubmit} noValidate>
            {/* Upload Box */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "10px",
                marginBottom: "10px",
              }}
            >
              <label
                htmlFor="imageUpload"
                style={{
                  display: "block",
                  width: "60%",
                  height: "160px",
                  border: "2px dashed #000000ff",
                  textAlign: "center",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: 500,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      padding: "5px"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      color: "#aaa",
                      fontWeight: "400"
                    }}
                  >
                    Add Photo
                  </div>
                )}
              </label>
            </div>

            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {errors.file && (
              <Text color="red" size="xs" mt={-5} ta="center">
                {errors.file}
              </Text>
            )}

            {/* Inputs Row */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "25px",
              }}
            >
              <div style={{ flex: 1 }}>
                <TextInput
                  label={<span style={{ fontWeight: "400" }}>Item Name</span>}
                  withAsterisk
                  placeholder="Enter name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                />
              </div>
              <div style={{ flex: 1 }}>
                <NumberInput
                  label={<span style={{ fontWeight: "400" }}>Price</span>}
                  withAsterisk
                  placeholder="Enter price"
                  value={form.price}
                  onChange={(value) => setForm({ ...form, price: value })}
                  min={0}
                  parser={(value) => value.replace(/\₱\s?|(,*)/g, "")}
                  formatter={(value) =>
                    !Number.isNaN(parseFloat(value))
                      ? `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : "₱ "
                  }
                  error={errors.price}
                />
              </div>
            </div>

            {/* Save Button */}
            <Group mt="30px" justify="flex-end">
              <Button
                type="submit"
                style={{
                  backgroundColor: "#AB8262",
                  color: "white",
                  borderRadius: "12px",
                  width: "90px",
                  height: "36px",
                  fontSize: "15px",
                }}
              >
                Save
              </Button>
            </Group>
          </form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>


  );
}