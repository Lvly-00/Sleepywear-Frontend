import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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

const sortItemsByStatus = (itemsList) =>
  [...itemsList].sort((a, b) =>
    a.status === b.status ? 0 : a.status === "Available" ? -1 : 1
  );

function Item() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

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
    const base = import.meta.env.VITE_API_URL?.replace("/api", "");
    return `${base}/storage/${url.replace("public/", "")}`;
  };

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get("/collections");
        setCollections(res.data);
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    if (!preloadedItems) {
      const fetchItems = async () => {
        setLoading(true);
        try {
          const res = await api.get("/items", { params: { collection_id: id } });
          const sorted = sortItemsByStatus(
            res.data.map((item) => ({
              ...item,
              image_url: fixImageUrl(item.image_url || item.image),
            }))
          );
          setItems(sorted);
        } catch (err) {
          console.error("Error fetching items:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchItems();
    }
  }, [id, preloadedItems]);

  const collection = collections.find((c) => String(c.id) === String(id));

  if (!collection && !loading)
    return (
      <Center style={{ height: "80vh", flexDirection: "column" }}>
        <Text size="xl" mb="md">
          Collection not found.
        </Text>
        <Button onClick={() => navigate("/collections")}>Back to Collections</Button>
      </Center>
    );

  return (
    <>
      {/* Top progress bar */}
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
          <Grid gutter="md" mt="lg">
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
                    position: "relative",
                  }}
                >
                  {item.status !== "Available" && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 100,
                        background: "#faf8f377",
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
                          fontSize: "clamp(16px, 4vw, 52px)",
                          color: "#641212ff",
                        }}
                      >
                        Sold Out
                      </Text>
                    </div>
                  )}
                  <Card.Section>
                    <AspectRatio ratio={1080 / 1350}>
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <Skeleton height="100%" />
                      )}
                    </AspectRatio>
                  </Card.Section>

                  <Stack style={{ textAlign: "center", padding: "8px 0" }}>
                    <Group gap="xs" justify="center">
                      <Text fw={600}>{item.item_code || item.code}</Text>
                      <Text c="dimmed">|</Text>
                      <Text fw={500}>{item.name}</Text>
                    </Group>
                    <Text color="#A6976B">₱{item.price}</Text>

                    <Group justify="center" mt="md">
                      <Button
                        size="xs"
                        color="#276D58"
                        variant="subtle"
                        onClick={() => {
                          setSelectedItem(item);
                          setEditModal(true);
                        }}
                      >
                        <Icons.Edit size={20} />
                      </Button>
                      <Button
                        size="xs"
                        color="red"
                        variant="subtle"
                        onClick={() => {
                          setItemToDelete(item);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Icons.Trash size={20} />
                      </Button>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Stack>

      {/* Modals */}
      <AddItemModal
        opened={addModal}
        onClose={() => setAddModal(false)}
        collectionId={id}
        onItemAdded={(newItem) =>{
          setItems((prev) => sortItemsByStatus([...prev, newItem]));

      window.dispatchEvent(new Event("collectionsUpdated"));
  }}        
      />

      {selectedItem && (
        <EditItemModal
          opened={editModal}
          onClose={() => setEditModal(false)}
          item={selectedItem}
          onItemUpdated={(updatedItem) =>
            setItems((prev) =>
              sortItemsByStatus(
                prev.map((i) => (i.id === updatedItem.id ? updatedItem : i))
              )
            )
          }
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
            setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
          } catch (err) {
            console.error("Error deleting item:", err);
          } finally {
            setDeleteModalOpen(false);
          }
        }}
      />
    </>
  );
}

export default Item;
