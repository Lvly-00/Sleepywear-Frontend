import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import {
  Container,
  Card,
  Text,
  Badge,
  Button,
  Group,
  Center,
  SimpleGrid,
} from "@mantine/core";
import PageHeader from "../../components/PageHeader";
import AddItemModal from "../../components/AddItemModal";
import EditItemModal from "../../components/EditItemModal";
import SleepyLoader from "../../components/SleepyLoader";
import { openDeleteConfirmModal } from "../../components/DeleteConfirmModal";

function Inventory() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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

  const handleItemUpdated = (updatedItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handleDelete = (itemId, itemName) => {
    openDeleteConfirmModal({
      title: "Delete Item",
      name: itemName,
      onConfirm: async () => {
        try {
          await api.delete(`/api/items/${itemId}`);
          setItems((prev) => prev.filter((item) => item.id !== itemId));
        } catch (error) {
          console.error(
            "Error deleting item:",
            error.response?.data || error.message
          );
        }
      },
    });
  };

  if (loading) return <SleepyLoader />;

  return (
    <Container>
      <PageHeader
        title="Items"
        showSearch={false}
        addLabel="Add Item"
        onAdd={() => setAddModal(true)}
      />

      {items.length === 0 ? (
        <Center py="lg">
          <Text>No items found for this collection.</Text>
        </Center>
      ) : (
        <SimpleGrid
          cols={3}
          spacing="lg"
          breakpoints={[
            { maxWidth: 980, cols: 2 },
            { maxWidth: 600, cols: 1 },
          ]}
        >
          {items.map((item) => (
            <Card
              key={item.id}
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: 500,
              }}
            >
              {/* Image Section */}
              <Card.Section>
                <div
                  style={{
                    height: 250,
                    width: "100%",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f0f0f0",
                  }}
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Text size="sm" c="dimmed">
                      No image
                    </Text>
                  )}
                </div>
              </Card.Section>

              {/* Info Section */}
              <div style={{ flexGrow: 1, marginTop: 12 }}>
                <Text weight={500} lineClamp={1}>
                  {item.name} {item.code && <Text span c="dimmed">({item.code})</Text>}
                </Text>

                <Text size="sm" mt="xs">
                  Price: ${Number(item.price).toFixed(2)}
                </Text>

                <Badge
                  color={item.status === "available" ? "green" : "red"}
                  mt="xs"
                >
                  {item.status === "available" ? "Available" : "Taken"}
                </Badge>

                <Text size="sm" mt="xs" lineClamp={3}>
                  {item.notes || "-"}
                </Text>
              </div>

              {/* Action Buttons - Bottom Left */}
              <Group mt="md" spacing="xs" position="left">
                <Button
                  size="xs"
                  onClick={() => {
                    setSelectedItem(item);
                    setEditModal(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  color="red"
                  onClick={() => handleDelete(item.id, item.name)}
                >
                  Delete
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Add Item Modal */}
      <AddItemModal
        opened={addModal}
        onClose={() => setAddModal(false)}
        collectionId={id}
        onItemAdded={handleItemAdded}
      />

      {/* Edit Item Modal */}
      {selectedItem && (
        <EditItemModal
          opened={editModal}
          onClose={() => setEditModal(false)}
          item={selectedItem}
          onItemUpdated={handleItemUpdated}
        />
      )}
    </Container>
  );
}

export default Inventory;
