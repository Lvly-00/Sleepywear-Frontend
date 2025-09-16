import { useEffect, useState } from "react";
import { Button, TextInput, Stack, Container, Paper, Title, Divider } from "@mantine/core";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CollectionBreadcrumbs from "../../components/CollectionBreadcrumbs";

function EditCollection() {
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    release_date: "",
    qty: 0,
    status: "Active",
  });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:8000/api/collections/${id}`).then((res) => {
      setForm(res.data);
    });
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.put(`http://localhost:8000/api/collections/${id}`, form);
    navigate("/collections");
  };

  return (
    <Container size="sm" py="md">
      <CollectionBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Collections", to: "/collections" },
          { label: "Edit Collection" },
        ]}
      />

      <Paper shadow="xs" p="lg" radius="md" withBorder>
        <Title order={2} mb="sm">
          Edit Collection
        </Title>
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

            <Button type="submit">Update Collection</Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default EditCollection;
