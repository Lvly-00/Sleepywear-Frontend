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

function Item() {
  const { id } = useParams();

  // Collections state
  const [collections, setCollections] = useState([]);
  const [loadingCollections, setLoadingCollections] = useState(false);

  // Items state
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Fetch collections
  const fetchCollections = async () => {
    setLoadingCollections(true);
    try {
      const res = await api.get("/collections");
      setCollections(res.data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoadingCollections(false);
    }
  };

  // Fetch items by collection_id query parameter
  const fetchItems = async (collectionId) => {
    setLoadingItems(true);
    try {
      const res = await api.get("/items", {
        params: { collection_id: collectionId },
      });
      setItems(res.data);
      console.log("Fetched items:", res.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (id) fetchItems(id);
  }, [id]);

  const collection = collections.find((c) => String(c.id) === String(id));
  const collectionItems = items;

  // Sync collection totals by updating backend directly (optional)
  const syncCollectionTotals = async () => {
    if (!collection) return;
    const totalQty = collectionItems.length;
    const stockQty = collectionItems.filter((i) => i.status === "Available").length;
    const status = stockQty > 0 ? "Active" : "Sold Out";

    if (
      collection.qty !== totalQty ||
      collection.stock_qty !== stockQty ||
      collection.status !== status
    ) {
      try {
        await api.put(`/collections/${collection.id}`, {
          ...collection,
          qty: totalQty,
          stock_qty: stockQty,
          status,
        });
        // Refetch collections after update
        fetchCollections();
      } catch (err) {
        console.error("Error syncing collection totals:", err.response?.data || err.message);
      }
    }
  };

  const handleItemAdded = (newItemData) => {
    setAddErrors({});
    // Optimistically add item
    setItems((prev) => [...prev, newItemData]);
    setAddModal(false);
    setTimeout(syncCollectionTotals, 100);
    fetchItems(id); // Fetch fresh items just in case
  };

  const handleItemUpdated = (updatedItemData) => {
    console.log("Item updated:", updatedItemData);
    setEditErrors({});
    setEditModal(false);
    setSelectedItem(null);

    fetchItems(id).then(() => {
      console.log("Items refreshed after edit");
    });
    setTimeout(syncCollectionTotals, 100);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/items/${itemToDelete.id}`);
      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      setDeleteModalOpen(false);
      setItemToDelete(null);
      setTimeout(syncCollectionTotals, 100);
      fetchItems(id);
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
        onAdd={() => {
          setAddErrors({});
          setAddModal(true);
        }}
      />

      {(loadingCollections || loadingItems) ? (
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

                <Badge color={item.status === "Available" ? "green" : "red"} mt="xs">
                  {item.status === "Available" ? "Available" : "Sold Out"}
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
                    setEditErrors({});
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
        onItemAdded={handleItemAdded}
      />

      {selectedItem && (
        <EditItemModal
          opened={editModal}
          onClose={() => setEditModal(false)}
          item={selectedItem}
          onItemUpdated={handleItemUpdated}
          errors={editErrors}
        />
      )}
    </Stack>
  );
}

export default Item;
