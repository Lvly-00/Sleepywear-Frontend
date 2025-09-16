import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import {
  Container,
  Table,
  Title,
  Loader,
  Center,
  Paper,
  Button,
  Group,
  Modal,
  Text,
  Image,
} from "@mantine/core";
import CollectionBreadcrumbs from "../../components/CollectionBreadcrumbs";

function Inventory() {
  const { id } = useParams(); // collection ID
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    api
      .get(`/api/items?collection_id=${id}`)
      .then((res) => {
        console.log("Fetched items:", res.data);
        setItems(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "Error fetching items:",
          err.response?.data || err.message
        );
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/items/${deleteId}`);
      setItems(items.filter((i) => i.id !== deleteId));
      setOpened(false);
    } catch (error) {
      console.error(
        "Error deleting item:",
        error.response?.data || error.message
      );
    }
  };

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Container>
      {/* Breadcrumbs */}
      <CollectionBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Collections", to: "/collections" },
          { label: `Collection #${id}`, to: `/collections/${id}/items` },
          { label: "Inventory" },
        ]}
      />

      <Group justify="space-between" mb="md">
        <Title order={2}>Inventory for Collection #{id}</Title>
        <Button component={Link} to={`/collections/${id}/items/new`}>
          + Add Item
        </Button>
      </Group>

      <Paper withBorder shadow="sm" p="md" radius="md">
        {items.length === 0 ? (
          <Center py="lg">
            <Text>No items found for this collection.</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item Code</Table.Th>
                <Table.Th>Item Name</Table.Th>
                <Table.Th>Item Image</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Notes</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.code}</Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      component={Link}
                      to={`/inventory/${item.id}`}
                    >
                      {item.name}
                    </Button>
                  </Table.Td>

                  <Table.Td>
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fit="cover"
                        radius="sm"
                        style={{ width: 100, height: 100 }} 
                      />
                    ) : (
                      <Text size="sm" c="dimmed">
                        No image
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td>${item.price}</Table.Td>
                  <Table.Td>{item.notes}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        component={Link}
                        to={`/inventory/${item.id}/edit`}
                      >
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        onClick={() => {
                          setDeleteId(item.id);
                          setOpened(true);
                        }}
                      >
                        Delete
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      {/* Delete Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Delete Item"
        centered
      >
        <Text>Are you sure you want to delete this item?</Text>
        <Group mt="md">
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setOpened(false)}>
            Cancel
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default Inventory;
