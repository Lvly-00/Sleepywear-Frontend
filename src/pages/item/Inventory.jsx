import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/axios";
import {
  Container,
  Table,
  Loader,
  Center,
  Paper,
  Button,
  Group,
  Modal,
  Text,
  Image,
  Badge,
} from "@mantine/core";
import PageHeader from "../../components/PageHeader";
import AddItemModal from "../../components/AddItemModal";
import { openDeleteConfirmModal } from "../../components/DeleteConfirmModal";

function Inventory() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);

  useEffect(() => {
    api
      .get(`/api/items?collection_id=${id}`)
      .then((res) => {
        const sorted = res.data.sort((a, b) => {
          if (a.status === "available" && b.status !== "available") return -1;
          if (a.status !== "available" && b.status === "available") return 1;
          return 0;
        });
        setItems(sorted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
        setLoading(false);
      });
  }, [id]);

  const handleItemAdded = (newItem) => {
    setItems((prev) => [...prev, newItem]);
  };

  const handleDelete = (collectionId, collectionName) => {
    openDeleteConfirmModal({
      title: "Delete Collection",
      name: collectionName,
      onConfirm: async () => {
        try {
          await api.delete(`/api/collections/${collectionId}`);
          // Optionally, you can add logic here to update the UI after deletion if needed.
        } catch (error) {
          console.error(
            "Error deleting collection:",
            error.response?.data || error.message
          );
        }
      },
    });
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
      <PageHeader
        title="Items"
        showSearch={false}
        addLabel="Add Item"
        onAdd={() => setAddModal(true)}
      />

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
                <Table.Th>Status</Table.Th>
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
                  <Table.Td>${Number(item.price).toFixed(2)}</Table.Td>
                  <Table.Td>
                    {item.status === "available" ? (
                      <Badge color="green">Available</Badge>
                    ) : (
                      <Badge color="red">Taken</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>{item.notes || "-"}</Table.Td>
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
                          setDeleteModal(true);
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

      {/* Add Item Modal Component */}
      <AddItemModal
        opened={addModal}
        onClose={() => setAddModal(false)}
        collectionId={id}
        onItemAdded={handleItemAdded}
      />


    </Container>
  );
}

export default Inventory;
