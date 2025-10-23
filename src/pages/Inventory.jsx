import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import {
  Stack,
  Card,
  Text,
  Badge,
  Button,
  Group,
  Center,
  SimpleGrid,
} from "@mantine/core";
import PageHeader from "../components/PageHeader";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";

function Inventory() {
  const { id } = useParams();
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Skip fetch if data already exists (for instant navigation back)
    if (collection && items.length > 0) return;

    let isMounted = true;
    const fetchData = async () => {
      try {
        // Temporary title shown instantly
        if (!collection) setCollection({ name: "Collection" });

        const [colRes, itemsRes] = await Promise.all([
          api.get(`/collections/${id}`),
          api.get(`/items?collection_id=${id}`),
        ]);

        if (!isMounted) return;

        setCollection(colRes.data);

        const sorted = itemsRes.data.sort((a, b) => {
          if (a.status === "available" && b.status !== "available") return -1;
          if (a.status !== "available" && b.status === "available") return 1;
          return 0;
        });
        setItems(sorted);
      } catch (err) {
        console.error(err.response?.data || err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
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
    DeleteConfirmModal({
      title: "Delete Item",
      name: itemName,
      onConfirm: async () => {
        try {
          await api.delete(`/items/${itemId}`);
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

  return (
    <Stack p="lg" spacing="lg">
      <PageHeader
        title={collection ? collection.name : "Collection"}
        showBack
        showSearch={false}
        addLabel="Add Item"
        onAdd={() => setAddModal(true)}
      />

      {loading && items.length === 0 ? (
        <Center py="lg">
          <Text>Loading items...</Text>
        </Center>
      ) : items.length === 0 ? (
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
                  {item.name}{" "}
                  {item.code && (
                    <Text span c="dimmed">
                      ({item.code})
                    </Text>
                  )}
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

              {/* Action Buttons */}
              <Group mt="md" spacing="xs" position="left">
                <Button
                  size="xs"
                  color="#276D58"
                  variant="subtle"
                  p={3}
                  onClick={() => {
                    setSelectedItem(item);
                    setEditModal(true);
                  }}
                >
                  <Icons.Edit size={24} />
                </Button>
                <Button
                  size="xs"
                  color="#276D58"
                  variant="subtle"
                  p={3}
                  onClick={() => {
                    setItemToDelete(item);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Icons.Trash size={24} />
                </Button>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Delete Item Modal */}
      <DeleteConfirmModal
        opened={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        name={itemToDelete ? itemToDelete.name : ""}
        onConfirm={async () => {
          if (!itemToDelete) return;
          try {
            await api.delete(`/items/${itemToDelete.id}`);
            setItems((prev) =>
              prev.filter((item) => item.id !== itemToDelete.id)
            );
            setDeleteModalOpen(false);
            setItemToDelete(null);
          } catch (err) {
            console.error(
              "Error deleting item:",
              err.response?.data || err.message
            );
          }
        }}
      />

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
    </Stack>
  );
}

export default Inventory;
