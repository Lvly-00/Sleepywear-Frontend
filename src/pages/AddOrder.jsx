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
} from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import CancelOrderModal from "../components/CancelOrderModal";

const ORDER_ITEMS_STORAGE_KEY = "orderItemsCache";
const SELECTED_COLLECTION_STORAGE_KEY = "selectedCollectionCache";
const COLLECTIONS_STORAGE_KEY = "collectionsCache";

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

  // Cache selectedItems to localStorage
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

  // Cache selectedCollection to localStorage
  useEffect(() => {
    try {
      if (selectedCollection) {
        localStorage.setItem(SELECTED_COLLECTION_STORAGE_KEY, selectedCollection);
      }
    } catch (error) {
      console.error("Error caching selectedCollection:", error);
    }
  }, [selectedCollection]);

  // Cache collections to localStorage
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

      // Filter active collections and only include collections with items available or selected
      const activeCollections = res.data
        .filter((c) => c.status === "Active")
        .map((c) => {
          // Filter items to available or selected
          const filteredItems = (c.items || []).filter(
            (i) =>
              i.status === "Available" || selectedItems.some((si) => si.id === i.id)
          );

          // Map items to add image_url and collection_id
          const itemsWithUrls = filteredItems.map((i) => ({
            ...i,
            image_url:
              i.image_url ||
              (i.image ? `${import.meta.env.VITE_API_URL}/storage/${i.image}` : null),
            collection_id: c.id,
          }));

          return {
            ...c,
            items: itemsWithUrls,
          };
        })
        // Only keep collections with at least one item
        .filter((c) => c.items.length > 0);

      setCollections(activeCollections);

      // Set default selectedCollection if none selected
      if (!selectedCollection) {
        if (selectedItems.length > 0) {
          const firstCollectionId =
            selectedItems[0].collection_id?.toString() ||
            activeCollections[0]?.id.toString();
          setSelectedCollection(firstCollectionId);
        } else if (activeCollections.length > 0) {
          setSelectedCollection(activeCollections[0].id.toString());
        }
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

  // Items for selected collection
  const availableItems =
    collections.find((c) => c.id.toString() === selectedCollection)?.items || [];

  const handleAddCollectionRedirect = () => {
    navigate("/collections", { state: { openAddModal: true } });
  };

  const handleBack = () => {
    const from = locationState?.from || "/orders";
    navigate(from);
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
              searchable
              nothingFound="No collections found"
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
                  <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                    <Card
                      shadow="md"
                      radius="lg"
                      withBorder
                      padding="lg"
                      onClick={() => handleItemToggle(item)}
                      style={{
                        aspectRatio: "1080 / 1350",
                        borderColor: selected ? "#A5976B" : "#e0e0e0",
                        backgroundColor: selected ? "#F1F0ED" : "white",
                        cursor: "pointer",
                        transition: "0.2s ease",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        overflow: "hidden",
                      }}
                    >
                      {item.image_url && (
                        <div
                          style={{
                            width: "100%",
                            aspectRatio: "1080 / 1350",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#f9f9f9",
                            borderRadius: "10px",
                            overflow: "hidden",
                          }}
                        >
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fit="cover"
                            width="100%"
                            height="100%"
                          />
                        </div>
                      )}

                      <div style={{ textAlign: "center", padding: "8px 0" }}>
                        <Group gap="xs" justify="center" wrap="nowrap">
                          <Text
                            fw={500}
                            transform="uppercase"
                            style={{
                              fontFamily: "'League Spartan', sans-serif",
                              fontSize: "clamp(14px, 2.5vw, 24px)",
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
                              fontSize: "clamp(14px, 2.5vw, 24px)",
                            }}
                          >
                            {item.name}
                          </Text>
                        </Group>

                        <Text
                          color="#A6976B"
                          style={{
                            fontSize: "clamp(14px, 1.8vw, 20px)",
                            fontWeight: 400,
                            marginTop: "4px",
                          }}
                        >
                          ₱{item.price}
                        </Text>
                      </div>
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
                backgroundColor: "#9E2626",
                fontFamily: "'League Spartan', sans-serif",
                fontWeight: 500,
              }}
              onClick={() => setCancelModalOpened(true)}
            >
              Cancel Order ({selectedItems.length})
            </Button>

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
