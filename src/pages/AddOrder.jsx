import React, { useState, useEffect } from "react";
import {
  Select,
  Card,
  Image,
  Text,
  Button,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  AspectRatio, // Added AspectRatio
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import CancelOrderModal from "../components/CancelOrderModal";

const ORDER_ITEMS_STORAGE_KEY = "orderItemsCache_v2";
const SELECTED_COLLECTION_STORAGE_KEY = "selectedCollectionCache_v2";
const COLLECTIONS_STORAGE_KEY = "collectionsCache_v2";

// ----------------------------------------------------------------------
// HELPER: Image URL Formatter 
// ----------------------------------------------------------------------
const fixImageUrl = (url) => {
  if (!url) return null;
  
  if (url.startsWith("items/") || !url.includes(".")) {
     // Use f_auto,q_auto to handle missing extensions (.png, .jpg)
     return `https://res.cloudinary.com/dz0q8u0ia/image/upload/f_auto,q_auto/${url}`;
  }

  // 2. If it's already a valid HTTP link
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // 3. Fallback for actual legacy local images
  const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "";
  return `${base}/storage/${url.replace(/^public\//, "")}`;
};

const AddOrder = () => {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const [cancelModalOpened, setCancelModalOpened] = useState(false);

  const [selectedItems, setSelectedItems] = useState(() => {
    if (locationState?.selectedItems) return locationState.selectedItems;
    const saved = localStorage.getItem(ORDER_ITEMS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCollection, setSelectedCollection] = useState(() => {
    const saved = localStorage.getItem(SELECTED_COLLECTION_STORAGE_KEY);
    return saved || "";
  });

  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(collections.length === 0);

  // Cache selectedItems
  useEffect(() => {
    try {
      const dataStr = JSON.stringify(selectedItems);
      if (new Blob([dataStr]).size < 4.5 * 1024 * 1024) {
        localStorage.setItem(ORDER_ITEMS_STORAGE_KEY, dataStr);
      }
    } catch (error) {
      console.error("Error caching selectedItems:", error);
    }
  }, [selectedItems]);

  // Cache selectedCollection
  useEffect(() => {
    try {
      if (selectedCollection) {
        localStorage.setItem(SELECTED_COLLECTION_STORAGE_KEY, selectedCollection);
      }
    } catch (error) {
      console.error("Error caching selectedCollection:", error);
    }
  }, [selectedCollection]);

  // Cache collections
  useEffect(() => {
    try {
      const dataStr = JSON.stringify(collections);
      if (new Blob([dataStr]).size < 4.5 * 1024 * 1024) {
        localStorage.setItem(COLLECTIONS_STORAGE_KEY, dataStr);
      }
    } catch (error) {
      console.error("Error caching collections:", error);
    }
  }, [collections]);

  useEffect(() => {
    fetchCollections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await api.get("/collections");

      const dataArray = Array.isArray(res.data) ? res.data : res.data.data || [];

      const activeCollections = dataArray
        .filter((c) => c.status === "Active")
        .map((c) => {
          const filteredItems = (c.items || []).filter(
            (i) => i.status === "Available"
          );

          const itemsWithUrls = filteredItems.map((i) => ({
            ...i,
            image_url: fixImageUrl(i.image), 
            collection_id: c.id,
          }));

          return { ...c, items: itemsWithUrls };
        })
        .filter((c) => c.items.length > 0); 

      setCollections(activeCollections);

      if (!selectedCollection && activeCollections.length > 0) {
        setSelectedCollection(activeCollections[0].id.toString());
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleItemToggle = (item) => {
    if (selectedItems.some((i) => i.id === item.id)) {
      setSelectedItems((prev) => prev.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems((prev) => [...prev, item]);
    }
  };

  const handlePlaceOrder = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item.");
      return;
    }

    const orderCode = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    navigate("/confirm-order", {
      state: {
        orderCode,
        items: selectedItems,
      },
    });
  };

  const availableItems =
    collections.find((c) => c.id.toString() === selectedCollection)?.items || [];

  const handleAddCollectionRedirect = () => {
    navigate("/collections", { state: { openAddModal: true } });
  };

  const hasItems = collections.length > 0;

  return (
    <Stack p="xs" spacing="lg">
      <PageHeader title="Add Order" showBack />

      <Paper radius="md" p="xl" style={{ minHeight: "75vh", marginBottom: "1rem" }}>
        {!loading && hasItems && (
          <Group justify="flex-start" mb="md">
            <Select
              placeholder="Select Collection"
              size="sm"
              style={{ width: "260px" }}
              rightSection={<IconChevronDown size={18} stroke={1.5} />}
              rightSectionWidth={36}
              data={collections.map((c) => ({
                value: c.id.toString(),
                label: c.name,
              }))}
              value={selectedCollection}
              onChange={setSelectedCollection}
              clearable={false}
            />
          </Group>
        )}

        {loading ? (
          <Grid gutter="md" mt="lg">
            {[...Array(8)].map((_, idx) => (
              <Grid.Col key={idx} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Skeleton height={350} radius="md" />
              </Grid.Col>
            ))}
          </Grid>
        ) : !hasItems ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "250px",
              height: "100%",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <Text color="#62626279" size="50px" style={{ marginBottom: 32, fontWeight: 400 }}>
              No items available in this collection
            </Text>
            <Button
              color="#232D80"
              radius="12"
              size="lg"
              onClick={handleAddCollectionRedirect}
            >
              Add Collection
            </Button>
          </div>
        ) : (
          <Grid gutter="md" mt="lg">
            {availableItems.length === 0 ? (
              <Text align="center" color="dimmed" size="xl" style={{ width: "100%", marginTop: "2rem" }}>
                No available items in this collection.
              </Text>
            ) : (
              availableItems.map((item) => {
                const selected = selectedItems.some((i) => i.id === item.id);
                return (
                  // UPDATED GRID: xl: 2 for large screens, xs: 6 for mobile
                  <Grid.Col key={item.id} span={{ base: 12, xs: 6, sm: 4, md: 3, xl: 2 }}>
                    <Card
                      shadow="md"
                      radius="lg"
                      withBorder
                      padding="sm"
                      onClick={() => handleItemToggle(item)}
                      style={{
                        height: "100%",
                        borderColor: selected ? "#A5976B" : "#e0e0e0",
                        backgroundColor: selected ? "#F1F0ED" : "white",
                        cursor: "pointer",
                        transition: "0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Card.Section>
                        {/* UPDATED: AspectRatio 1080/1350 */}
                        <AspectRatio ratio={1080 / 1350}>
                          {item.image_url && (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fit="cover"
                              width="100%"
                              height="100%"
                              onError={(e) => {
                                console.error("Failed to load:", item.image_url);
                              }}
                            />
                          )}
                        </AspectRatio>
                      </Card.Section>

                      <Stack pt="sm" gap={4} style={{ textAlign: "center", flexGrow: 1 }}>
                        <Group gap="xs" justify="center" wrap="wrap" style={{ minHeight: "2.5em" }}>
                          <Text
                            fw={600}
                            transform="uppercase"
                            style={{
                              fontFamily: "'League Spartan', sans-serif",
                              fontSize: "clamp(12px, 1.2vw, 15px)",
                            }}
                          >
                            {item.item_code || item.code}
                          </Text>
                          <Text
                            c="dimmed"
                            style={{
                              fontSize: "clamp(12px, 1.2vw, 15px)",
                            }}
                          >
                            |
                          </Text>
                          <Text
                            fw={500}
                            transform="uppercase"
                            style={{
                              fontFamily: "'League Spartan', sans-serif",
                              fontSize: "clamp(12px, 1.2vw, 15px)",
                            }}
                          >
                            {item.name}
                          </Text>
                        </Group>

                        {/* Price centered at bottom */}
                        <Text
                          color="#A6976B"
                          mt="auto"
                          style={{
                            fontSize: "clamp(16px, 1.8vw, 20px)",
                            fontWeight: 400,
                            marginTop: "auto",
                          }}
                        >
                          ₱{item.price}
                        </Text>
                      </Stack>
                    </Card>
                  </Grid.Col>
                );
              })
            )}
          </Grid>
        )}

        {selectedItems.length > 0 && !loading && (
          <Group
            position="right"
            style={{ position: "fixed", bottom: 60, right: 80, zIndex: 10 }}
          >
            <Button
              size="md"
              style={{
                borderRadius: "15px",
                paddingTop: "3px",
                backgroundColor: "#AB8262",
                fontFamily: "'League Spartan', sans-serif",
                fontWeight: 500,
              }}
              onClick={handlePlaceOrder}
            >
              Place Order ({selectedItems.length})
            </Button>
          </Group>
        )}

      </Paper>

      <CancelOrderModal
        opened={cancelModalOpened}
        onClose={() => setCancelModalOpened(false)}
        onResetItems={() => setSelectedItems([])}
        onConfirm={() => navigate("/orders")}
      />
    </Stack>
  );
};

export default AddOrder;