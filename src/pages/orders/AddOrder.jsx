import React, { useState, useEffect } from "react";
import { Select, Card, Image, Text, Button, Grid, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";

const AddOrder = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await api.get("/api/collections");
      const activeCollections = res.data
        .filter((c) => c.status === "Active")
        .map((c) => ({
          ...c,
          items: c.items.filter((i) => i.status === "available"),
        }))
        .filter((c) => c.items.length > 0);
      setCollections(activeCollections);
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

    // Generate a random order code
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

  return (
    <div style={{ padding: 20 }}>
      <PageHeader title="Add Order" showBack />

      <Select
        placeholder="Select Collection"
        data={collections.map((c) => ({
          value: c.id.toString(),
          label: c.name,
        }))}
        value={selectedCollection}
        onChange={(val) => {
          setSelectedCollection(val);
          setSelectedItems([]);
        }}
        mt="md"
      />

      {/* Item Cards */}
      {selectedCollection && (
        <Grid mt="lg">
          {availableItems.map((item) => {
            const selected = selectedItems.some((i) => i.id === item.id);
            return (
              <Grid.Col key={item.id} span={3}>
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    borderColor: selected ? "#228be6" : "#e0e0e0",
                    backgroundColor: selected ? "#f0f9ff" : "white",
                    cursor: "pointer",
                    transition: "0.2s ease",
                  }}
                  onClick={() => handleItemToggle(item)}
                >
                  {item.image_url && (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      height={120}
                      fit="contain"
                    />
                  )}
                  <Text fw={600} mt="sm">
                    {item.name}
                  </Text>
                  <Text size="sm" color="dimmed">
                    ₱{item.price}
                  </Text>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      )}

      {/* Floating Place Order Button */}
      {selectedItems.length > 0 && (
        <Group
          position="right"
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 10,
          }}
        >
          <Button size="md" onClick={handlePlaceOrder}>
            Place Order ({selectedItems.length})
          </Button>
        </Group>
      )}
    </div>
  );
};

export default AddOrder;
