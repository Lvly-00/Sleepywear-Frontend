import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  Button,
  Table,
  Select,
  Card,
  Paper,
  Grid,
  Group,
  Divider,
  ScrollArea,
} from "@mantine/core";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import NotifySuccess from "../components/NotifySuccess.jsx";
import CancelOrderModal from "../components/CancelOrderModal";

const ConfirmOrder = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [orderItems, setOrderItems] = useState(() => {
    if (state?.items) return state.items;
    const saved = sessionStorage.getItem("orderItems");
    return saved ? JSON.parse(saved) : [];
  });

  const [form, setForm] = useState(() => {
    if (state?.form) return state.form;
    const savedForm = sessionStorage.getItem("customerForm");
    return savedForm
      ? JSON.parse(savedForm)
      : {
          first_name: "",
          last_name: "",
          address: "",
          contact_number: "",
          social_handle: "",
        };
  });

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  const [customerSearch, setCustomerSearch] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [cancelModalOpened, setCancelModalOpened] = useState(false);

  const total = orderItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  // Fetch customers when search changes
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const res = await api.get("/customers", {
          params: { search: customerSearch, per_page: 50 },
        });
        setCustomers(Array.isArray(res.data.data) ? res.data.data : []);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetchCustomers();
  }, [customerSearch]);

  useEffect(() => {
    sessionStorage.setItem("orderItems", JSON.stringify(orderItems));
  }, [orderItems]);

  useEffect(() => {
    sessionStorage.setItem("customerForm", JSON.stringify(form));
  }, [form]);

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find((c) => c.id.toString() === customerId);
    if (customer) {
      setSelectedCustomer(customer.id);
      setForm({
        first_name: customer.first_name,
        last_name: customer.last_name,
        address: customer.address,
        contact_number: customer.contact_number,
        social_handle: customer.social_handle,
      });
    } else {
      setSelectedCustomer(null);
      setForm({
        first_name: "",
        last_name: "",
        address: "",
        contact_number: "",
        social_handle: "",
      });
    }
  };

  const updateItemStatus = async (itemId, newStatus) => {
    try {
      const { data: currentItem } = await api.get(`/items/${itemId}`);
      const { image, image_url, created_at, updated_at, collection, collection_name, ...rest } =
        currentItem;
      await api.put(`/items/${itemId}`, { ...rest, status: newStatus });
    } catch (error) {
      console.error(`Failed to update item ${itemId}:`, error.response?.data || error.message);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    const newErrors = {};

    if (orderItems.length === 0) {
      newErrors.orderItems = "Please add at least one item.";
    }

    ["first_name", "last_name", "address", "contact_number", "social_handle"].forEach(
      (field) => {
        const value = form[field];
        if (!value) {
          newErrors[field] = `${field.replace(/_/g, " ").replace(/\b\w/g, (c) =>
            c.toUpperCase()
          )} is required`;
        }
        if (field === "social_handle" && !/^https?:\/\/.+/.test(value)) {
          newErrors[field] = "Social handle must be a valid URL starting with http or https";
        }
      }
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    NotifySuccess.addedOrderLoading();

    const unavailableItems = orderItems.filter((item) => item.status !== "Available");
    if (unavailableItems.length > 0) {
      alert(
        `Cannot place order. Insufficient stock for: ${unavailableItems
          .map((i) => i.name)
          .join(", ")}`
      );
      return;
    }

    try {
      const customerPayload = { ...form };
      let customerId = selectedCustomer;

      if (selectedCustomer) {
        await api.put(`/customers/${selectedCustomer}`, customerPayload);
      } else {
        const res = await api.post("/customers", customerPayload);
        customerId = res.data.id;
      }

      const payload = {
        customer: { id: customerId, ...customerPayload },
        items: orderItems.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: 1,
        })),
      };

      const response = await api.post("/orders", payload);

      if (response.status === 200 || response.status === 201) {
        const createdOrder = response.data;

        try {
          await Promise.all(orderItems.map((item) => updateItemStatus(item.id, "Sold Out")));
        } catch (inventoryErr) {
          console.error("Failed to update inventory:", inventoryErr);
          alert("Warning: Order placed but failed to update some item statuses.");
        }

        // --- CLEAR ALL CACHES ON SUCCESS ---
        setOrderItems([]);
        sessionStorage.removeItem("orderItems");
        sessionStorage.removeItem("customerForm");
        
        // Clear LocalStorage V2 keys
        localStorage.removeItem("orderItemsCache_v2");
        localStorage.removeItem("selectedCollectionCache_v2");
        localStorage.removeItem("collectionsCache_v2"); // optional
        
        window.dispatchEvent(new Event("collectionsUpdated"));

        NotifySuccess.addedOrder();

        // Redirect to Orders page and open invoice modal
        navigate("/orders", {
          state: { reloadOrders: true, newOrder: createdOrder, openInvoice: true },
        });
      } else {
        alert("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Order creation failed:", err.response?.data || err.message);
      alert("Failed to place order. Check console for details.");
    }
  };

  const handleCancelOrder = () => {
    setCancelModalOpened(true);
  };

  const handleConfirmCancel = () => {
    // --- CLEAR ALL CACHES ON CANCEL ---
    setOrderItems([]);
    sessionStorage.removeItem("orderItems");
    sessionStorage.removeItem("customerForm");

    // Clear LocalStorage V2 keys so AddOrder starts fresh next time
    localStorage.removeItem("orderItemsCache_v2");
    localStorage.removeItem("selectedCollectionCache_v2");
    
    navigate("/orders");
  };

  return (
    <div style={{ padding: 20 }}>
      <PageHeader title="Confirm Order" showBack />

      <Grid gutter="xl" align="flex-start" mt="md">
        {/* LEFT SIDE */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card
            shadow="sm"
            padding="xl"
            radius="lg"
            withBorder
            style={{ height: "580px", display: "flex", flexDirection: "column", backgroundColor: "#FFF" }}
          >
            <Group justify="space-between" mb="sm">
              <Text fw={500} color="#0D0F66" style={{ fontSize: "30px" }}>
                Summary Order
              </Text>
              <Button
                variant="filled"
                size="md"
                style={{ backgroundColor: "#B59276", borderRadius: "10px", color: "white", fontWeight: 600, width: "80px", height: "28px" }}
                onClick={() => {
                  sessionStorage.setItem("orderItems", JSON.stringify(orderItems));
                  sessionStorage.setItem("customerForm", JSON.stringify(form));
                  navigate("/add-order", { state: { selectedItems: orderItems } });
                }}
              >
                Edit
              </Button>
            </Group>

            <Divider mb="sm" color="#C1A287" />

            <ScrollArea style={{ flexGrow: 1 }} scrollbarSize={6}>
              {orderItems.length === 0 ? (
                <Text color="dimmed">No items in this order.</Text>
              ) : (
                <Table highlightOnHover={false} style={{ borderCollapse: "separate", borderSpacing: "0 8px", width: "100%" }}>
                  <tbody>
                    {orderItems.map((item) => (
                      <tr key={item.id} style={{ backgroundColor: "#FAF8F3", borderRadius: "12px", overflow: "hidden" }}>
                        <td style={{ padding: "10px 14px", border: "none", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}>
                          <Text fw={400}>
                            {item.code && <span style={{ fontWeight: 400 }}>{item.code}</span>}
                            <span style={{ marginLeft: "25px" }}>{item.name}</span>
                          </Text>
                        </td>
                        <td style={{ textAlign: "right", border: "none", borderTopRightRadius: "12px", borderBottomRightRadius: "12px", padding: "10px 14px" }}>
                          ₱{Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </ScrollArea>

            <Divider mt="sm" mb="xs" color="#C1A287" />
            <Group justify="space-between">
              <Text fw={600} style={{ fontSize: "24px" }}>
                Total:
              </Text>
              <Text fw={700} style={{ fontSize: "24px" }}>
                ₱{total.toFixed(2)}
              </Text>
            </Group>
          </Card>
        </Grid.Col>

        {/* RIGHT SIDE */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper shadow="sm" p="xl" radius="md" withBorder style={{ height: "580px", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#FFF" }}>
            <div>
              <Text fw={500} mb="md" color="#0D0F66" style={{ fontSize: "30px" }}>
                Customer Information
              </Text>

              <Select
                placeholder="Search Customer"
                searchable
                nothingFound="No customer found"
                data={customers.map((c) => ({ value: c.id.toString(), label: c.full_name || `${c.first_name} ${c.last_name}` }))}
                onSearchChange={setCustomerSearch}
                onChange={handleCustomerSelect}
                searchValue={customerSearch}
                value={selectedCustomer ? selectedCustomer.toString() : ""}
                clearable
                loading={loadingCustomers}
                mb="md"
                styles={{ input: { height: 42, borderRadius: 8 } }}
              />

              <Grid pb={20}>
                <Grid.Col span={6}>
                  <TextInput
                    label={<span style={{ fontWeight: "400" }}>First Name</span>}
                    required
                    value={form.first_name}
                    size="md"
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    error={errors.first_name}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label={<span style={{ fontWeight: "400" }}>Last Name</span>}
                    required
                    value={form.last_name}
                    size="md"
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    error={errors.last_name}
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                pb={20}
                label={<span style={{ fontWeight: "400" }}>Address</span>}
                required
                mt="sm"
                size="md"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                error={errors.address}
              />

              <Grid mt="sm">
                <Grid.Col span={6}>
                  <TextInput
                    label={<span style={{ fontWeight: "400" }}>Contact Number</span>}
                    required
                    value={form.contact_number}
                    size="md"
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 11) {
                        setForm({ ...form, contact_number: value });
                      }
                    }}
                    error={errors.contact_number}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label={<span style={{ fontWeight: "400" }}>Social Media Link</span>}
                    required
                    value={form.social_handle}
                    size="md"
                    onChange={(e) => setForm({ ...form, social_handle: e.target.value })}
                    error={errors.social_handle}
                  />
                </Grid.Col>
              </Grid>
            </div>

            {/* BUTTONS: Cancel & Generate */}
            <Group justify="flex-end" mt="md" spacing="sm">
              <Button
                style={{ backgroundColor: "#9E2626", borderRadius: "10px", color: "white", fontSize: "16px", fontWeight: 600, height: "42px" }}
                onClick={handleCancelOrder}
              >
                Cancel Order
              </Button>

              <Button
                style={{ backgroundColor: "#B59276", borderRadius: "10px", color: "white", fontSize: "16px", fontWeight: 600, height: "42px" }}
                onClick={handlePlaceOrder}
              >
                Generate
              </Button>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      <CancelOrderModal
        opened={cancelModalOpened}
        onClose={() => setCancelModalOpened(false)}
        onResetItems={() => setOrderItems([])} // Local state
        onConfirm={handleConfirmCancel}        // Triggers storage cleanup + nav
      />
    </div>
  );
};

export default ConfirmOrder;