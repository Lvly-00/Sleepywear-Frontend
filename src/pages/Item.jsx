import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../api/axios";
import {
  Stack,
  Card,
  Text,
  Button,
  Group,
  Center,
  Grid,
  AspectRatio,
  Skeleton,
  Box,
} from "@mantine/core";
import PageHeader from "../components/PageHeader";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";
import TopLoadingBar from "../components/TopLoadingBar";
import NotifySuccess from "@/components/NotifySuccess";

// ----------------------------------------------------------------------
// HELPER: Sort Logic
// ----------------------------------------------------------------------
const sortItemsRealtime = (itemsList) => {
  const statusOrder = (status) => {
    switch (status) {
      case "Available": return 1;
      case "Sold Out": return 2;
      default: return 3;
    }
  };

  return [...itemsList].sort((a, b) => {
    const aStatus = statusOrder(a.status);
    const bStatus = statusOrder(b.status);

    if (aStatus !== bStatus) return aStatus - bStatus;

    if (aStatus === 1 && bStatus === 1)
      return new Date(a.created_at) - new Date(b.created_at);

    return new Date(a.updated_at) - new Date(b.updated_at);
  });
};

// ----------------------------------------------------------------------
// HELPER: Image URL Formatter
// ----------------------------------------------------------------------
const fixImageUrl = (url) => {
  if (!url) return null;

  if (url.startsWith("items/") || !url.includes(".")) {
    return `https://res.cloudinary.com/dz0q8u0ia/image/upload/f_auto,q_auto/${url}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  return `${base}/storage/${url.replace(/^public\//, "")}`;
};

export default function Item() {
  const { id } = useParams();
  const location = useLocation();
  const preloadedItems = location.state?.preloadedItems || null;

  const [items, setItems] = useState(() => {
    if (!preloadedItems) return [];

    return sortItemsRealtime(preloadedItems.map(item => ({
      ...item,
      image_url: fixImageUrl(item.image || item.image_url),
      is_available: item.status === "Available",
    })));
  });

  const [loading, setLoading] = useState(!preloadedItems);
  const [collections, setCollections] = useState([]);

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    api.get("/collections")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCollections(data);
      })
      .catch((err) => console.error("Error fetching collections:", err));
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items", { params: { collection_id: id } });

      const normalized = res.data.map((item) => ({
        ...item,
        image_url: fixImageUrl(item.image || item.image_url),
        is_available: item.status === "Available",
      }));

      setItems(sortItemsRealtime(normalized));
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [id]);

  useEffect(() => {
    const onCollectionsUpdated = () => fetchItems();
    window.addEventListener("collectionsUpdated", onCollectionsUpdated);
    return () => window.removeEventListener("collectionsUpdated", onCollectionsUpdated);
  }, [id]);

  const collection = collections.find((c) => String(c.id) === String(id));

  return (
    <>
      <TopLoadingBar loading={loading} />

      <Stack p="lg" spacing="lg">
        {collection && (
          <PageHeader
            title={collection.name}
            showBack
            addLabel="Add Item"
            onAdd={() => setAddModal(true)}
          />
        )}

        {items.length === 0 && !loading ? (
          <Center py="lg">
            <Text>No items found for this collection.</Text>
          </Center>
        ) : (
          <Grid gutter="md">
            {items.map((item) => (
              // UPDATED GRID: Added 'xl: 2' to allow 6 items per row on large screens/zoom out
              <Grid.Col key={item.id} span={{ base: 12, xs: 6, sm: 4, md: 3, xl: 2 }}>
                <Card
                  shadow="sm"
                  radius="lg"
                  withBorder
                  padding="sm"
                  style={{
                    opacity: item.status === "Available" ? 1 : 0.85,
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  {/* 1. CARD SECTION MUST BE FIRST CHILD TO SIT FLUSH AT TOP */}
                  <Card.Section>
                    <AspectRatio ratio={1080 / 1350}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            filter: item.status === "Available" ? "none" : "grayscale(0.5)",
                          }}
                          onError={(e) => {
                            console.warn("Failed to load image:", item.image_url);
                          }}
                        />
                      ) : (
                        <Skeleton height="100%" />
                      )}
                    </AspectRatio>
                  </Card.Section>

                  {/* 2. INFO SECTION */}
                  <Stack pt="sm" gap={4} style={{ textAlign: "center", flexGrow: 1 }}>
                    <Group gap="xs" justify="center" wrap="wrap" style={{ minHeight: "2.5em" }}>
                      <Text fw={600} style={{ fontSize: "clamp(12px, 1.2vw, 20px)" }}>
                        {item.item_code || item.code}
                      </Text>
                      <Text c="dimmed" size="sm">|</Text>
                      <Text fw={400} style={{ fontSize: "clamp(12px, 1.2vw, 20px)" }}>
                        {item.name}
                      </Text>
                    </Group>

                    {/* Price & Buttons */}
                    <Box
                      mt="auto"
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "40px"
                      }}
                    >
                      <Text
                        color="#A6976B"
                        fw={700}
                        style={{
                          fontSize: "clamp(16px, 1.8vw, 20px)",
                          textAlign: "center",
                          width: "100%",
                          zIndex: 1,
                        }}
                      >
                        ₱{Number(item.price).toLocaleString()}
                      </Text>

                      <Group
                        gap={2}
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 20
                        }}
                      >
                        <Button
                          size="compact-sm"
                          color="#276D58"
                          variant="subtle"
                          disabled={item.status !== "Available"}
                          style={{ pointerEvents: "auto", padding: "4px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItem(item);
                            setEditModal(true);
                          }}
                        >
                          <Icons.Edit size={18} />
                        </Button>
                        <Button
                          size="compact-sm"
                          color="red"
                          variant="subtle"
                          style={{ pointerEvents: "auto", padding: "4px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToDelete(item);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Icons.Trash size={18} />
                        </Button>
                      </Group>
                    </Box>
                  </Stack>

                  {/* 3. SOLD OVERLAY - MOVED TO BOTTOM */}
                  {item.status !== "Available" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(250, 248, 243, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10,
                        borderRadius: "16px",
                        pointerEvents: "none",
                      }}
                    >
                      <Text
                        fw={900}
                        transform="uppercase"
                        style={{
                          fontSize: "clamp(20px, 4vw, 32px)",
                          color: "#B80000",
                          textAlign: "center",
                          transform: "rotate(-15deg)",
                          border: "4px solid #B80000",
                          padding: "0.2rem 1rem",
                          borderRadius: "8px",
                          backgroundColor: "rgba(255, 255, 255, 0.8)"
                        }}
                      >
                        SOLD
                      </Text>
                    </div>
                  )}
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>

      <AddItemModal
        opened={addModal}
        onClose={() => setAddModal(false)}
        collectionId={id}
        onItemAdded={(newItem) => {
          const normalized = {
            ...newItem,
            image_url: fixImageUrl(newItem.image || newItem.image_url),
            is_available: newItem.status === "Available",
          };
          setItems((prev) => sortItemsRealtime([...prev, normalized]));
          window.dispatchEvent(new Event("collectionsUpdated"));
          NotifySuccess.addedItem();
        }}
      />

      {selectedItem && (
        <EditItemModal
          opened={editModal}
          onClose={() => {
            setEditModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onItemUpdated={(updatedItem) => {
            const normalized = {
              ...updatedItem,
              image_url: fixImageUrl(updatedItem.image || updatedItem.image_url),
              is_available: updatedItem.status === "Available",
            };
            setItems((prev) =>
              sortItemsRealtime(
                prev.map((i) => (i.id === normalized.id ? normalized : i))
              )
            );
            NotifySuccess.editedItem();
          }}
        />
      )}

      <DeleteConfirmModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        name={itemToDelete?.name || ""}
        onConfirm={async () => {
          if (!itemToDelete) return;
          try {
            await api.delete(`/items/${itemToDelete.id}`);
            setItems((prev) => sortItemsRealtime(prev.filter((i) => i.id !== itemToDelete.id)));
            NotifySuccess.deleted();
          } catch (err) {
            console.error("Error deleting item:", err);
          } finally {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        }}
      />
    </>
  );
}