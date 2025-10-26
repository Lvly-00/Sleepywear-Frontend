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
import { useItemStore } from "../store/itemStore";
import { useCollectionStore } from "../store/collectionStore";

function Item() {
  const { id } = useParams();

  const { collections, fetchCollections, updateCollection } = useCollectionStore();
  const { items, fetchItems, addItem, updateItem, removeItem, loading } = useItemStore();

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    fetchItems(id);
  }, [id, fetchItems]);

  const collection = collections.find((c) => String(c.id) === String(id));
  const collectionItems = items[id] || [];

  // Sync collection totals and status
  const syncCollectionTotals = () => {
    if (!collection) return;
    const totalQty = collectionItems.length;
    const stockQty = collectionItems.filter(i => i.status === "Available").length;
    const status = stockQty > 0 ? "Active" : "Sold Out";

    if (
      collection.qty !== totalQty ||
      collection.stock_qty !== stockQty ||
      collection.status !== status
    ) {
      const updatedCollection = {
        ...collection,
        qty: totalQty,
        stock_qty: stockQty,
        status,
      };
      updateCollection(updatedCollection);
    }
  };

  // Handle adding a new item
  const handleItemAdded = (newItem) => {
    addItem(id, newItem);
    setAddModal(false); // ✅ close the modal immediately
    setTimeout(syncCollectionTotals, 100);
  };

  // Handle updating an item
  const handleItemUpdated = (updatedItem) => {
    updateItem(id, updatedItem);
    setTimeout(syncCollectionTotals, 100);
  };

  // Handle deleting an item
  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/items/${itemToDelete.id}`);
      removeItem(id, itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setTimeout(syncCollectionTotals, 100);
    } catch (err) {
      console.error("Error deleting item:", err.response?.data || err.message);
    }
  };

  return (
    <Stack p="lg" spacing="lg">
      <PageHeader
        title={collection ? collection.name : "Collection"}
        showBack
        addLabel="Add Item"
        onAdd={() => setAddModal(true)}
      />

      {loading && collectionItems.length === 0 ? (
        <Center py="lg">
          <Text>Loading items...</Text>
        </Center>
      ) : collectionItems.length === 0 ? (
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
          {collectionItems.map((item) => (
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

              <div style={{ flexGrow: 1, marginTop: 12 }}>
                <Text fw={500} lineClamp={1}>
                  {item.name}{" "}
                  {item.code && (
                    <Text span c="dimmed">
                      ({item.code})
                    </Text>
                  )}
                </Text>

                <Text size="sm" mt="xs">
                  Price: ₱{Number(item.price).toFixed(2)}
                </Text>

                <Badge
                  color={item.status === "Available" ? "green" : "red"}
                  mt="xs"
                >
                  {item.status === "Available" ? "Available" : "Taken"}
                </Badge>

                <Text size="sm" mt="xs" lineClamp={3}>
                  {item.notes || "-"}
                </Text>
              </div>

              <Group mt="md" spacing="xs">
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
                  color="red"
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

      <DeleteConfirmModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        name={itemToDelete?.name || ""}
        onConfirm={handleDelete}
      />

      <AddItemModal
        opened={addModal}
        onClose={() => setAddModal(false)}
        collectionId={id}
        onItemAdded={handleItemAdded} // ✅ modal closes after adding
      />

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

export default Item;
