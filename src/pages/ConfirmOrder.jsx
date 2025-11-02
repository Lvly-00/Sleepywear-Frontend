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

const ConfirmOrder = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    contact_number: "",
    social_handle: "",
  });
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [errors, setErrors] = useState({});

  const orderItems = state?.items || [];
  const total = orderItems.reduce(
    (sum, item) => sum + parseFloat(item.price),
    0
  );

  // Fetch customers locally
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
      // Clear form if cleared selection
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

    try {
      // Prepare customer payload
      const customerPayload = { ...form };
      let customerId = selectedCustomer;

      if (selectedCustomer) {
        await api.put(`/customers/${selectedCustomer}`, customerPayload);
      } else {
        const res = await api.post("/customers", customerPayload);
        customerId = res.data.id;
      }

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

      const response = await api.post("/orders", payload);

      if (response.status === 200 || response.status === 201) {
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
      } else {
        alert("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Order creation failed:", err.response?.data || err.message);
      alert("Order failed: " + (err.response?.data?.message || "Check console."));
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
                  navigate("/add-order", {
                    state: {
                      selectedItems: orderItems, // pass current items
                    },
                  });
                }}
              >
                Edit
              </Button>
            </Group>

            <Divider mb="sm" color="#C1A287" />

            {/* Scrollable table area */}
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
                  <Table.Tbody>
                    {orderItems.map((item) => (
                      <Table.Tr
                        key={item.id}
                        style={{
                          backgroundColor: "#FAF8F3",
                          borderRadius: "12px",
                          overflow: "hidden",
                        }}
                      >
                        <Table.Td
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
                        </Table.Td>
                        <Table.Td
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
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </ScrollArea>

            {/* Fixed total */}
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
                    label={
                      <span
                        style={{
                          fontWeight: "400",
                        }}
                      >
                        First Name
                      </span>
                    }
                    required
                    value={form.first_name}
                    size="md"
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                    error={errors.first_name}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label={
                      <span
                        style={{
                          fontWeight: "400",
                        }}
                      >
                        Last Name
                      </span>
                    }
                    required
                    value={form.last_name}
                    size="md"
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                    error={errors.last_name}
                  />
                </Grid.Col>
              </Grid>

              <TextInput
                pb={20}
                label={
                  <span
                    style={{
                      fontWeight: "400",
                    }}
                  >
                    Address
                  </span>
                }
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
                    label={
                      <span
                        style={{
                          fontWeight: "400",
                        }}
                      >
                        Contact Number
                      </span>
                    }
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
                    label={
                      <span
                        style={{
                          fontWeight: "400",
                        }}
                      >
                        Social Media Link
                      </span>
                    }
                    required
                    value={form.social_handle}
                    size="md"
                    onChange={(e) =>
                      setForm({ ...form, social_handle: e.target.value })
                    }
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
                // No orderStore here, so we don't fetchOrders()
                navigate("/orders");
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
