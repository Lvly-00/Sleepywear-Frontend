import React, { useEffect, useState, useCallback, useRef } from "react";
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
  Grid,
  Loader,
  Skeleton,
  AspectRatio,
} from "@mantine/core";
import PageHeader from "../components/PageHeader";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";

const CACHE_TTL_MS = 5 * 60 * 1000;

const sortItemsByStatus = (itemsList) => {
  return [...itemsList].sort((a, b) => {
    if (a.status === b.status) return 0;
    if (a.status === "Available") return -1;
    if (b.status === "Available") return 1;
    return 0;
  });
};

function Item() {
  const { id } = useParams();
  const [collections, setCollections] = useState([]);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const debounceRef = useRef(null);

  const fixImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const base = import.meta.env.VITE_API_URL?.replace("/api", "");
    return `${base}/storage/${url.replace("public/", "")}`;
  };

  const itemsCacheKey = (collectionId) => `items_cache_${collectionId}`;
  const itemsCacheTimeKey = (collectionId) => `items_cache_${collectionId}_time`;

  const fetchCollections = useCallback(async () => {
    setLoadingCollections(true);
    try {
      const cached = localStorage.getItem("collections_cache");
      const ts = localStorage.getItem("collections_cache_time");
      const now = Date.now();

      if (cached && ts && now - Number(ts) < CACHE_TTL_MS) {
        setCollections(JSON.parse(cached));
      } else {
        const res = await api.get("/collections");
        setCollections(res.data);
        localStorage.setItem("collections_cache", JSON.stringify(res.data));
        localStorage.setItem("collections_cache_time", String(now));
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
    } finally {
      setLoadingCollections(false);
    }
  }, []);

  const fetchItemsFromServer = useCallback(async (collectionId) => {
    if (!collectionId) return null;
    try {
      const res = await api.get("/items", { params: { collection_id: collectionId } });
      const fixedItems = res.data.map((item) => ({
        ...item,
        image_url: fixImageUrl(item.image_url || item.image),
      }));

      const sortedItems = sortItemsByStatus(fixedItems);
      setItems(sortedItems);

      const now = Date.now();
      sessionStorage.setItem(itemsCacheKey(collectionId), JSON.stringify(sortedItems));
      sessionStorage.setItem(itemsCacheTimeKey(collectionId), String(now));

      return sortedItems;
    } catch (err) {
      console.error("Error fetching items:", err);
      return null;
    }
  }, []);

  const loadItems = useCallback(
    async (collectionId) => {
      if (!collectionId) return;
      const cached = sessionStorage.getItem(itemsCacheKey(collectionId));
      const ts = sessionStorage.getItem(itemsCacheTimeKey(collectionId));
      const now = Date.now();

      if (cached && ts && now - Number(ts) < CACHE_TTL_MS) {
        try {
          const parsed = JSON.parse(cached);
          const sortedItems = sortItemsByStatus(parsed);
          setItems(sortedItems);
        } catch {
          sessionStorage.removeItem(itemsCacheKey(collectionId));
          sessionStorage.removeItem(itemsCacheTimeKey(collectionId));
          await fetchItemsFromServer(collectionId);
          return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          fetchItemsFromServer(collectionId);
        }, 300);
      } else {
        setLoadingItems(true);
        await fetchItemsFromServer(collectionId);
        setLoadingItems(false);
      }
    },
    [fetchItemsFromServer]
  );

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    loadItems(id);
  }, [id, loadItems]);

  const collection = collections.find((c) => String(c.id) === String(id));
  const collectionItems = items;

  const syncCollectionTotals = useCallback(async () => {
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
        localStorage.removeItem("collections_cache");
        localStorage.removeItem("collections_cache_time");
        fetchCollections();
      } catch (err) {
        console.error("Error syncing totals:", err);
      }
    }
  }, [collection, collectionItems, fetchCollections]);

  const updateCacheAndRevalidate = useCallback(
    (updatedList) => {
      sessionStorage.setItem(itemsCacheKey(id), JSON.stringify(updatedList));
      sessionStorage.setItem(itemsCacheTimeKey(id), String(Date.now()));
      fetchItemsFromServer(id);
      setTimeout(syncCollectionTotals, 200);
    },
    [id, fetchItemsFromServer, syncCollectionTotals]
  );

  const handleItemAdded = (newItem) => {
    setAddModal(false);
    const next = sortItemsByStatus([newItem, ...items]);
    setItems(next);
    updateCacheAndRevalidate(next);
  };

  const handleItemUpdated = (updatedItem) => {
    setEditModal(false);
    const next = sortItemsByStatus(items.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    setItems(next);
    updateCacheAndRevalidate(next);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const next = sortItemsByStatus(items.filter((i) => i.id !== itemToDelete.id));
      setItems(next);
      setDeleteModalOpen(false);
      setItemToDelete(null);
      await api.delete(`/items/${itemToDelete.id}`);
      updateCacheAndRevalidate(next);
    } catch (err) {
      console.error("Error deleting item:", err);
      fetchItemsFromServer(id);
    }
  };

  const renderSkeletonGrid = (count = 6) => (
    <SimpleGrid
      cols={3}
      spacing="lg"
      breakpoints={[
        { maxWidth: 980, cols: 2 },
        { maxWidth: 600, cols: 1 },
      ]}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} shadow="sm" padding="md" radius="md" withBorder>
          <Skeleton height={350} mb="sm" />
          <Skeleton height={20} width="70%" mb="xs" />
          <Skeleton height={20} width="50%" mb="xs" />
        </Card>
      ))}
    </SimpleGrid>
  );

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

      {loadingCollections ? (
        <Center py="lg">
          <Loader />
        </Center>
      ) : loadingItems ? (
        renderSkeletonGrid()
      ) : collectionItems.length === 0 ? (
        <Center py="lg">
          <Text>No items found for this collection.</Text>
        </Center>
      ) : (
        <Grid gutter="md" mt="lg">

          {collectionItems.map((item) => (
            <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                key={item.id}
                shadow="sm"
                radius="lg"
                withBorder
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                  border: "1px solid #e6e6e6",
                  opacity: item.status === "Available" ? 1 : 0.6,
                  filter: item.status === "Available" ? "none" : "grayscale(0.7)",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Dim Overlay for Sold Out */}
                {item.status !== "Available" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 100,
                      background: "#faf8f377",
                      backdropFilter: "blur(2px)",
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
                        letterSpacing: "2px",
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
                          transition: "transform 0.3s ease",
                        }}
                      />
                    ) : (
                      <Skeleton height="100%" />
                    )}
                  </AspectRatio>
                </Card.Section>

                <Stack
                  style={{
                    textAlign: "center",
                    padding: "8px 0",
                    zIndex: 3,
                  }}
                >
                  <Group gap="xs" justify="center" wrap="nowrap">
                    <Text
                      fw={600}
                      transform="uppercase"
                      style={{
                        fontFamily: "'League Spartan', sans-serif",
                        fontSize: "clamp(14px, 2.5vw, 22px)",
                        color: "#0D0F66",
                      }}
                    >
                      {item.item_code || item.code}
                    </Text>
                    <Text
                      c="dimmed"
                      style={{
                        fontSize: "clamp(18px, 2.5vw, 24px)",
                      }}
                    >
                      |
                    </Text>
                    <Text
                      fw={500}
                      transform="uppercase"
                      style={{
                        fontFamily: "'League Spartan', sans-serif",
                        fontSize: "clamp(14px, 2.5vw, 22px)",
                      }}
                    >
                      {item.name}
                    </Text>
                  </Group>

                  <Text
                    color="#A6976B"
                    style={{
                      fontSize: "clamp(14px, 1.8vw, 20px)",
                      fontWeight: 500,
                      marginTop: "4px",
                    }}
                  >
                    ₱{item.price}
                  </Text>

                  {/* Actions */}
                  <Group justify="center" mt="md" spacing="xs">
                    <Button
                      size="xs"
                      color="#276D58"
                      variant="subtle"
                      onClick={() => {
                        setSelectedItem(item);
                        setEditErrors({});
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

      {/* ✅ Modals */}
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
