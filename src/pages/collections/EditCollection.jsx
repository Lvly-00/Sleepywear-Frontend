import { useEffect, useState } from "react";
import { Button, TextInput, Stack, Container, Paper, Title, Divider, Select } from "@mantine/core";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";

function EditCollection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    release_date: new Date().toISOString().split("T")[0], // default today
    qty: 0,
    status: "active", // match enum
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Fetch collection data
  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await api.get(`/api/collections/${id}`);
        // Ensure status is lowercase
        setForm({
          ...res.data,
          status: res.data.status.toLowerCase(),
        });
      } catch (error) {
        console.error("Failed to fetch collection:", error.response?.data || error.message);
      }
    };
    fetchCollection();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/collections/${id}`, form);
      navigate("/collections");
    } catch (error) {
      console.error("Failed to update collection:", error.response?.data || error.message);
    }
  };

  return (
    <Container size="sm" py="md">
     

      <Paper shadow="xs" p="lg" radius="md" withBorder>
        <Title order={2} mb="sm">Edit Collection</Title>
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

            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={(value) => setForm({ ...form, status: value })}
              data={[
                { value: "draft", label: "Draft" },
                { value: "active", label: "Active" },
                { value: "archived", label: "Archived" },
              ]}
            />

            <Button type="submit">Update Collection</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default EditCollection;
