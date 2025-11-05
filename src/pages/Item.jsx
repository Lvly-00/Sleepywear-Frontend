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
  Loader,
  Skeleton,
} from "@mantine/core";
import PageHeader from "../components/PageHeader";
import AddItemModal from "../components/AddItemModal";
import EditItemModal from "../components/EditItemModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";

const CACHE_TTL_MS = 5 * 60 * 1000;

// Sorting helper: Available first, Sold Out last
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
    <SimpleGrid cols={3} spacing="lg" breakpoints={[{ maxWidth: 980, cols: 2 }, { maxWidth: 600, cols: 1 }]}>
      {Array.from({ length: count }).map((_, idx) => (
        <Card key={idx} shadow="sm" padding="md" radius="md" withBorder>
          <Skeleton height={250} width="100%" mb="sm" />
          <Skeleton height={20} width="80%" mb="xs" />
          <Skeleton height={20} width="40%" mb="xs" />
          <Skeleton height={16} width="60%" mb="xs" />
          <Skeleton height={32} width="100%" />
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
                      src={item.image_url || "/placeholder.png"}
                      alt={item.name}
                      style={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <Skeleton height={250} width="100%" />
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
