import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Container,
  Table,
  Loader,
  Center,
  Paper,
  Button,
  Group,
  Text,
  Image,
  Badge,
} from "@mantine/core";
import PageHeader from "../../components/PageHeader";
import AddItemModal from "../../components/AddItemModal";
import { openDeleteConfirmModal } from "../../components/DeleteConfirmModal";

function Inventory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [collection, setCollection] = useState(null);

  // Fetch collection details and items
  useEffect(() => {
    const fetchData = async () => {
      try {
        const collectionRes = await api.get(`/api/collections/${id}`);
        setCollection(collectionRes.data);

        const itemsRes = await api.get(`/api/items?collection_id=${id}`);
        const sorted = itemsRes.data.sort((a, b) => {
          if (a.status === "available" && b.status !== "available") return -1;
          if (a.status !== "available" && b.status === "available") return 1;
          return 0;
        });
        setItems(sorted);
      } catch (err) {
        console.error(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle item deletion
  const handleItemDelete = (itemId, itemName) => {
    openDeleteConfirmModal({
      title: "Delete Item",
      name: itemName,
      onConfirm: async () => {
        try {
          await api.delete(`/api/items/${itemId}`);
          setItems((prev) => prev.filter((i) => i.id !== itemId));
        } catch (err) {
          console.error("Error deleting item:", err);
        }
      },
    });
  };

  // Handle collection deletion
  const handleCollectionDelete = () => {
    if (!collection) return;
    openDeleteConfirmModal({
      title: "Delete Collection",
      name: collection.name,
      onConfirm: async () => {
        try {
          await api.delete(`/api/collections/${collection.id}`);
          navigate("/collections"); // redirect to collections page after deletion
        } catch (err) {
          console.error("Error deleting collection:", err);
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
        title={collection?.name || "Items"}
        showSearch={false}
        addLabel="Add Item"
        onAdd={() => setAddModal(true)}
        extraActions={
          <Button color="red" onClick={handleCollectionDelete}>
            Delete Collection
          </Button>
        }
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
                        onClick={() => handleItemDelete(item.id, item.name)}
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
        onItemAdded={(newItem) => setItems((prev) => [...prev, newItem])}
      />
    </Container>
  );
}

export default Inventory;
