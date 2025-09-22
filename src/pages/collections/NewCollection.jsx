import { useState } from "react";
import { Button, TextInput, Stack, Container, Paper, Title, Divider } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import CollectionBreadcrumbs from "../../components/CollectionBreadcrumbs";

function NewCollection() {
  const [form, setForm] = useState({
    name: "",
    release_date: new Date().toISOString().split("T")[0], // today
    qty: 0,
    status: "active", // lowercase to match enum
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/collections", form);
      console.log("Collection created:", response.data);
      navigate("/collections");
    } catch (error) {
      console.error("Error creating collection:", error.response?.data || error.message);
    }
  };

  return (
    <Container size="sm" py="md">
      <CollectionBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Collections", to: "/collections" },
          { label: "New Collection" },
        ]}
      />

      <Paper shadow="xs" p="lg" radius="md" withBorder>
        <Title order={2} mb="sm">Add New Collection</Title>
        <Divider mb="md" />

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="Collection Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <TextInput
              label="Release Date"
              name="release_date"
              type="date"
              value={form.release_date}
              onChange={handleChange}
            />
            <TextInput
              label="Quantity"
              name="qty"
              type="number"
              value={form.qty}
              onChange={handleChange}
            />
            <TextInput
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
            />

            <Button type="submit">Save Collection</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default NewCollection;
