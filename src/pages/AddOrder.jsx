import React, { useState, useEffect } from "react";
import { Select, Card, Image, Text, Button, Grid, Group, Paper } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import PageHeader from "../components/PageHeader";

const AddOrder = () => {
  const navigate = useNavigate();
  const { state: locationState } = useLocation();

  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (locationState?.selectedItems) {
      setSelectedItems(locationState.selectedItems);
    }
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await api.get("/collections");
      const activeCollections = res.data
        .filter((c) => c.status === "Active")
        .map((c) => ({
          ...c,
          items: (c.items || [])
            .filter((i) => i.status === "Available" || selectedItems.some(si => si.id === i.id))
            .map((i) => ({
              ...i,
              image_url: i.image_url || (i.image ? `${import.meta.env.VITE_API_URL}/storage/${i.image}` : null),
              collection_id: c.id,
            })),
        }))
        .filter((c) => c.items.length > 0);

      setCollections(activeCollections);

      // Set selected collection to first collection of selected items
      if (selectedItems.length > 0) {
        const firstCollectionId = selectedItems[0].collection_id?.toString() || activeCollections[0]?.id.toString();
        setSelectedCollection(firstCollectionId);
      } else if (activeCollections.length > 0) {
        setSelectedCollection(activeCollections[0].id.toString());
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
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

  // Get items from selected collection
  const availableItems =
    collections.find((c) => c.id.toString() === selectedCollection)?.items || [];

  return (
    <div style={{ padding: 20 }}>
      <PageHeader title="Add Order" showBack />
      <Paper radius="md" p="xl" style={{ minHeight: "75vh", marginBottom: "1rem" }}>
        <Group justify="flex-start" mb="md">
          <Select
            placeholder="Select Collection"
            size="sm"
            style={{ width: "260px" }}
            rightSection={<IconChevronDown size={18} stroke={1.5} />}
            rightSectionWidth={36}
            data={collections.map((c) => ({ value: c.id.toString(), label: c.name }))}
            value={selectedCollection}
            onChange={(val) => setSelectedCollection(val)}
          />
        </Group>

        {selectedCollection && (
          <Grid gutter="md" mt="lg">
            {availableItems.map((item) => {
              const selected = selectedItems.some((i) => i.id === item.id);
              return (
                <Grid.Col key={item.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                  <Card
                    shadow="md"
                    radius="md"
                    withBorder
                    padding="md"
                    onClick={() => handleItemToggle(item)}
                    style={{
                      height: "350px",
                      borderColor: selected ? "#0D0F66" : "#e0e0e0",
                      backgroundColor: selected ? "#EAF1FF" : "white",
                      cursor: "pointer",
                      transition: "0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    {item.image_url && (
                      <div
                        style={{
                          width: "100%",
                          height: "220px",
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
                          width={100}
                          height={100}
                          fit="contain"
                          radius="md"
                        />
                      </div>
                    )}

                    <div style={{ textAlign: "center" }}>
                      <Text fw={600} color="#0D0F66">
                        {item.item_code || item.code}
                      </Text>
                      <Text fw={500} mt={2}>{item.name}</Text>
                      <Text size="sm" color="dimmed">₱{item.price}</Text>
                    </div>
                  </Card>
                </Grid.Col>
              );
            })}
          </Grid>
        )}

        {selectedItems.length > 0 && (
          <Group
            position="right"
            style={{ position: "fixed", bottom: 60, right: 80, zIndex: 10 }}
          >
            <Button
              size="md"
              style={{ borderRadius: "15px", backgroundColor: "#AB8262" }}
              onClick={handlePlaceOrder}
            >
              Place Order ({selectedItems.length})
            </Button>
          </Group>
        )}
      </Paper>
    </div>
  );
};

export default AddOrder;
