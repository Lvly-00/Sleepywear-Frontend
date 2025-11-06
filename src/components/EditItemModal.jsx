import React, { useState, useEffect } from "react";
import {
  Modal,
  Text,
  TextInput,
  NumberInput,
  Button,
  Group,
  Loader,
  Center,
  AspectRatio,
} from "@mantine/core";
import api from "../api/axios";

export default function EditItemModal({ opened, onClose, item, onItemUpdated }) {
  const [form, setForm] = useState({ name: "", price: 0, collection_id: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({ name: "", price: "", file: "" });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || "",
        price: item.price || 0,
        collection_id: item.collection_id || "",
      });
      setPreview(item.image_url || null);
      setLoading(false);
    }
  }, [item]);

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
    if (!form) return;

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

    if (hasError) return;

    const data = new FormData();
    data.append("collection_id", form.collection_id);
    data.append("name", form.name);
    data.append("price", form.price);
    if (file) data.append("image", file);

    try {
      const res = await api.post(`/items/${item.id}?_method=PUT`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      onItemUpdated(res.data);
      onClose();
    } catch (err) {
      console.error(err.response?.data || err.message);
      setErrors((prev) => ({
        ...prev,
        name:
          err.response?.data?.message || "Failed to update item. Try again.",
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
              Edit Item
            </Text>
          </Modal.Title>
          <div style={{ width: 36 }} />
        </Modal.Header>

        <Modal.Body>
          {loading ? (
            <Center style={{ height: 200 }}>
              <Loader />
            </Center>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              {/* ✅ Aspect-ratio consistent image preview */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              >
                <AspectRatio ratio={1080 / 1350} w="60%">
                  <label
                    htmlFor="editImageUpload"
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      border: "2px dashed #000",
                      textAlign: "center",
                      color: "#999",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: 500,
                      overflow: "hidden",
                      position: "relative",
                      borderRadius: "12px",
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
                          fontWeight: "400",
                        }}
                      >
                        Add Photo
                      </div>
                    )}
                  </label>
                </AspectRatio>
              </div>

              <input
                id="editImageUpload"
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
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
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
                  Update
                </Button>
              </Group>
            </form>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
