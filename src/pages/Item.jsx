// Keep all your imports the same
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
} from "@mantine/core";
import PageHeader from "../components/PageHeader";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";
import TopLoadingBar from "../components/TopLoadingBar";
import NotifySuccess from "@/components/NotifySuccess";


// 🧩 Enhanced real-time sort function (mirrors your backend logic)
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
      return new Date(a.created_at) - new Date(b.created_at); // oldest first for Available

    return new Date(a.updated_at) - new Date(b.updated_at); // oldest first for Sold Out
  });
};


export default function Item() {
  const { id } = useParams();
  const location = useLocation();
  const preloadedItems = location.state?.preloadedItems || null;

  const [items, setItems] = useState(preloadedItems || []);
  const [loading, setLoading] = useState(!preloadedItems);
  const [collections, setCollections] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fixImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
    return `${base}/storage/${url.replace(/^public\//, "")}`;
  };

  // Fetch collections (safe & normalized)
  useEffect(() => {
    api.get("/collections")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];
        setCollections(data);
      })
      .catch((err) => console.error("Error fetching collections:", err));
  }, []);


  // Fetch items
  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items", { params: { collection_id: id } });
      const normalized = res.data.map((item) => ({
        ...item,
        image_url: fixImageUrl(item.image_url || item.image),
        is_available: item.status === "Available",
      }));
      setItems(sortItemsRealtime(normalized));
    } catch (err) {
      console.error("Error fetching items:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    if (!preloadedItems) fetchItems();
  }, [id]);

  // 🔁 Listen for collection updates globally (real-time sync)
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
          <Grid>
            {items.map((item) => (
              <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  shadow="sm"
                  radius="lg"
                  withBorder
                  style={{
                    opacity: item.status === "Available" ? 1 : 0.6,
                    filter: item.status === "Available" ? "none" : "grayscale(0.7)",
                    transition: "all 0.2s ease",
                    height: "100%", // makes all cards equal height per row
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  {item.status !== "Available" && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "#faf8f366",
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        fw={700}
                        transform="uppercase"
                        style={{
                          fontSize: "clamp(20px, 5vw, 48px)",
                          color: "#641212ff",
                          textAlign: "center",
                        }}
                      >
                        Sold 
                      </Text>
                    </div>
                  )}

                  {/*  Responsive image section */}
                  <Card.Section>
                    <AspectRatio ratio={1 / 1}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderTopLeftRadius: "12px",
                            borderTopRightRadius: "12px",
                          }}
                        />
                      ) : (
                        <Skeleton height="100%" />
                      )}
                    </AspectRatio>
                  </Card.Section>

                  {/*  Responsive text & actions */}
                  <Stack p="sm" spacing="xs" style={{ textAlign: "center", flexGrow: 1 }}>
                    <Group gap="xs" justify="center" wrap="wrap">
                      <Text fw={600} style={{ fontSize: "clamp(12px, 2vw, 18px)" }}>
                        {item.item_code || item.code}
                      </Text>
                      <Text c="dimmed">|</Text>
                      <Text fw={500} style={{ fontSize: "clamp(12px, 2vw, 18px)" }}>
                        {item.name}
                      </Text>
                    </Group>

                    <Group justify="space-between" align="center" mt="xs" wrap="nowrap">
                      <Text
                        color="#A6976B"
                        fw={500}
                        style={{
                          fontSize: "clamp(14px, 2.5vw, 20px)",
                          flex: 1,
                          textAlign: "center",
                        }}
                      >
                        ₱{Number(item.price).toString().replace(/^0+/, "")}
                      </Text>

                      <Group gap="xs">
                        <Button
                          size="compact-sm"
                          color="#276D58"
                          variant="subtle"
                          onClick={() => {
                            setSelectedItem(item);
                            setEditModal(true);
                          }}
                        >
                          <Icons.Edit size={26} />
                        </Button>
                        <Button
                          size="compact-sm"
                          color="red"
                          variant="subtle"
                          onClick={() => {
                            setItemToDelete(item);
                            setDeleteModalOpen(true);
                          }}
                        >
                          <Icons.Trash size={26} />
                        </Button>
                      </Group>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>

            ))}
          </Grid>
        )}
      </Stack>

      {/* Add Item Modal */}
      <AddItemModal
        opened={addModal}
        onClose={() => setAddModal(false)}
        collectionId={id}
        onItemAdded={(newItem) => {
          const normalized = {
            ...newItem,
            image_url: fixImageUrl(newItem.image_url || newItem.image),
            is_available: newItem.status === "Available",
          };
          setItems((prev) => sortItemsRealtime([...prev, normalized]));
          window.dispatchEvent(new Event("collectionsUpdated"));
          NotifySuccess.addedItem();
        }}
      />

      {/* Edit Item Modal */}
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
              image_url: fixImageUrl(updatedItem.image_url || updatedItem.image),
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

      {/* Delete Confirmation */}
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
