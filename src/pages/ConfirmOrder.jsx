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
import InvoicePreview from "../components/InvoicePreview";
import PageHeader from "../components/PageHeader";
import NotifySuccess from "../components/NotifySuccess"; 


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
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [errors, setErrors] = useState({});
  const [createdOrder, setCreatedOrder] = useState(null);

  const total = orderItems.reduce(
    (sum, item) => sum + parseFloat(item.price),
    0
  );

  // Fetch customers once
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers");
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };
    fetchCustomers();
  }, []);

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

  // NEW: Update item by fetching current item then PUT full updated data
  const updateItemStatus = async (itemId, newStatus) => {
    try {
      const { data: currentItem } = await api.get(`/items/${itemId}`);

      // Remove fields that backend expects to be files or immutable
      const {
        image,
        image_url,
        created_at,
        updated_at,
        collection,
        collection_name,
        ...rest
      } = currentItem;

      const updatedItem = {
        ...rest,
        status: newStatus,
      };

      await api.put(`/items/${itemId}`, updatedItem);
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
          newErrors[field] = `${field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())} is required`;
        }
        if (field === "social_handle" && !/^https?:\/\/.+/.test(value)) {
          newErrors[field] =
            "Social handle must be a valid URL starting with http or https";
        }
      }
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Show loading notification with fixed ID
    NotifySuccess.addedOrderLoading();

    // Check stock
    const unavailableItems = orderItems.filter((item) => item.status !== "Available");

    if (unavailableItems.length > 0) {
      updateNotification({
        id: "order-submit",
        title: "Stock Error",
        message: `Cannot place order. Insufficient stock for: ${unavailableItems
          .map((i) => i.name)
          .join(", ")}`,
        color: "red",
        autoClose: 4000,
        loading: false,
        disallowClose: false,
      });
      return;
    }

    try {
      // Save or update customer
      const customerPayload = { ...form };
      let customerId = selectedCustomer;

      if (selectedCustomer) {
        await api.put(`/customers/${selectedCustomer}`, customerPayload);
      } else {
        const res = await api.post("/customers", customerPayload);
        customerId = res.data.id;
      }

      // Create order payload
      const payload = {
        customer: {
          id: customerId,
          ...customerPayload,
        },
        items: orderItems.map((item) => ({
          item_id: item.id,
          item_name: item.name,
          price: item.price,
          quantity: 1,
        })),
      };

      // Create order
      const response = await api.post("/orders", payload);

      if (response.status === 200 || response.status === 201) {
        const createdOrder = response.data;
        setCreatedOrder(createdOrder);

        // Update inventory (mark items Sold Out)
        try {
          await Promise.all(
            orderItems.map(async (item) => {
              await updateItemStatus(item.id, "Sold Out");
            })
          );
        } catch (inventoryErr) {
          console.error("Failed to update inventory:", inventoryErr);
          alert("Warning: Order placed but failed to update some item statuses.");
        }

        // Prepare invoice data
        const invoice = {
          customer_name: `${form.first_name} ${form.last_name}`,
          address: form.address,
          contact_number: form.contact_number,
          social_handle: form.social_handle,
          items: orderItems.map((i) => ({
            item_name: i.name,
            quantity: 1,
            price: i.price,
          })),
          total,
        };

        setInvoiceData(invoice);
        setInvoiceModal(true);

        // Clear order items and storage
        setOrderItems([]);
        sessionStorage.removeItem("orderItems");
        sessionStorage.removeItem("customerForm");
        localStorage.removeItem("orderItemsCache");
        localStorage.removeItem("collections_cache");
        localStorage.removeItem("collections_cache_time");
        window.dispatchEvent(new Event("collectionsUpdated"));

        // Update notification to success
        NotifySuccess.addedOrder();

      } else {
        updateNotification({
          id: "order-submit",
          title: "Error",
          message: "Unexpected response from server.",
          color: "red",
          autoClose: 4000,
          loading: false,
          disallowClose: false,
        });
      }
    } catch (err) {
      console.error("Order creation failed:", err.response?.data || err.message);
      updateNotification({
        id: "order-submit",
        title: "Order Failed",
        message: err.response?.data?.message || "Check console for details.",
        color: "red",
        autoClose: 4000,
        loading: false,
        disallowClose: false,
      });
    }
  };


  return (
    <div style={{ padding: 20 }}>
      <PageHeader title="Confirm Order" showBack />

      <Grid gutter="xl" align="flex-start" mt="md">
        {/* LEFT SIDE - Summary Order */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card
            shadow="sm"
            padding="xl"
            radius="lg"
            withBorder
            style={{
              height: "580px",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Group justify="space-between" mb="sm">
              <Text
                fw={500}
                color="#0D0F66"
                style={{
                  fontSize: "30px",
                }}
              >
                Summary Order
              </Text>

              <Button
                variant="filled"
                size="md"
                style={{
                  backgroundColor: "#B59276",
                  borderRadius: "10px",
                  color: "white",
                  fontWeight: 600,
                  width: "80px",
                  height: "28px",
                }}
                onClick={() => {
                  sessionStorage.setItem("orderItems", JSON.stringify(orderItems));
                  sessionStorage.setItem("customerForm", JSON.stringify(form));
                  navigate("/add-order", {
                    state: {
                      selectedItems: orderItems,
                    },
                  });
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
                <Table
                  highlightOnHover={false}
                  style={{
                    borderCollapse: "separate",
                    borderSpacing: "0 8px",
                    width: "100%",
                  }}
                >
                  <tbody>
                    {orderItems.map((item) => (
                      <tr
                        key={item.id}
                        style={{
                          backgroundColor: "#FAF8F3",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <td
                          style={{
                            padding: "10px 14px",
                            border: "none",
                            borderTopLeftRadius: "12px",
                            borderBottomLeftRadius: "12px",
                          }}
                        >
                          <Text fw={400}>
                            {item.code && (
                              <span style={{ fontWeight: 400 }}>{item.code}</span>
                            )}
                            <span style={{ marginLeft: "25px" }}>{item.name}</span>
                          </Text>
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            border: "none",
                            borderTopRightRadius: "12px",
                            borderBottomRightRadius: "12px",
                            padding: "10px 14px",
                          }}
                        >
                          ₱
                          {Number(item.price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
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

        {/* RIGHT SIDE - Customer Info */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper
            shadow="sm"
            p="xl"
            radius="md"
            withBorder
            style={{
              height: "580px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: "#FFFFFF",
            }}
          >
            <div>
              <Text
                fw={500}
                mb="md"
                color="#0D0F66"
                style={{
                  fontSize: "30px",
                }}
              >
                Customer Information
              </Text>

              <Select
                placeholder="Search Customer"
                data={customers.map((c) => ({
                  value: c.id.toString(),
                  label: `${c.first_name} ${c.last_name}`,
                }))}
                onChange={handleCustomerSelect}
                clearable
                rightSectionPointerEvents="none"
                mb="md"
                styles={{
                  input: {
                    height: 42,
                    borderRadius: 8,
                  },
                }}
                value={selectedCustomer ? selectedCustomer.toString() : ""}
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

            <Group justify="flex-end" mt="md">
              <Button
                style={{
                  backgroundColor: "#B59276",
                  borderRadius: "10px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: 600,
                  height: "42px",
                  width: "120px",
                }}
                onClick={handlePlaceOrder}
              >
                Generate
              </Button>
            </Group>

            <InvoicePreview
              opened={invoiceModal}
              onClose={() => {
                setInvoiceModal(false);
                if (createdOrder) {
                  navigate("/orders", {
                    state: { reloadOrders: true, newOrder: createdOrder },
                  });
                  setCreatedOrder(null);
                }
              }}
              invoiceData={invoiceData}
            />
          </Paper>
        </Grid.Col>
      </Grid>
    </div>
  );
};

export default ConfirmOrder;
