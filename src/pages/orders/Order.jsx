import React, { useState, useEffect } from "react";
import {
  Button,
  Group,
  Title,
  Modal,
  Stack,
  Table,
  Text,
  Accordion,
  ScrollArea,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import AddPaymentModal from "../../components/AddPaymentModal";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null); // track expanded row
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");

      let ordersArray = [];
      if (Array.isArray(res.data)) {
        ordersArray = res.data;
      } else if (Array.isArray(res.data.orders)) {
        ordersArray = res.data.orders;
      } else if (Array.isArray(res.data.data)) {
        ordersArray = res.data.data;
      } else {
        console.warn("Unexpected API response structure:", res.data);
      }

      const sortedOrders = ordersArray.sort(
        (a, b) => new Date(b.order_date) - new Date(a.order_date)
      );

      setOrders(sortedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/api/orders/${orderId}`);
      fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const rows = orders.map((order) => {
    const fullName = `${order.first_name} ${order.last_name}`;
    const totalQty = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
    const totalPrice =
      order.total ||
      order.items?.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
      <React.Fragment key={order.id}>
        {/* Main clickable row */}
        <tr
          style={{ cursor: "pointer" }}
          onClick={() => toggleExpand(order.id)}
        >
          <td>{order.id}</td>
          <td>{fullName}</td>
          <td>{totalQty}</td>
          <td>{order.delivery_status}</td>
          <td>{new Date(order.order_date).toLocaleDateString()}</td>
          <td>₱{totalPrice.toFixed(2)}</td>
          <td>{order.payment_status || "Pending"}</td>
          <td>
            <Group spacing="xs">
              <Button
                size="xs"
                onClick={(e) => {
                  e.stopPropagation(); // prevent row click
                  setSelectedOrder(order);
                  setAddPaymentOpen(true);
                }}
              >
                Add Payment
              </Button>
              <Button
                size="xs"
                color="blue"
                leftIcon={<IconEdit size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/edit-order/${order.id}`);
                }}
              >
                Edit
              </Button>
              <Button
                size="xs"
                color="red"
                leftIcon={<IconTrash size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(order.id);
                }}
              >
                Delete
              </Button>
            </Group>
          </td>
        </tr>

        {/* Expanded accordion row */}
        {expandedOrder === order.id && (
          <tr>
            <td colSpan={8}>
              <Accordion
                value="details"
                variant="separated"
                radius="sm"
                multiple
                style={{ width: "100%" }}
              >
                <Accordion.Item value="details" style={{ border: "none" }}>
                  <Accordion.Control style={{ display: "none" }} />
                  <Accordion.Panel style={{ backgroundColor: "#D3DAD9" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "2rem",
                        padding: "1rem",
                        alignItems: "flex-start",
                        color: "#37353E", // for text visibility on dark background
                      }}
                    >
                      {/* Left column */}
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <Text>
                          <strong>Address:</strong> {order.address}
                        </Text>
                        <Text>
                          <strong>Social Media:</strong> {order.social_handle}
                        </Text>
                      </div>

                      {/* Right column */}
                      <div style={{ flex: 2, textAlign: "left" }}>
                        <ScrollArea style={{ maxHeight: 150 }}>
                          {order.items && order.items.length ? (
                            <Table
                              highlightOnHover
                              verticalSpacing="xs"
                              fontSize="sm"
                            >
                              <thead>
                                <tr>
                                  <th style={{ color: "#37353E" }}>Item Name</th>
                                  <th style={{ color: "#37353E" }}>Quantity</th>
                                  <th style={{ color: "#37353E" }}>Price</th>
                                </tr>
                              </thead>
                              <tbody>
                                {order.items.map((item) => (
                                  <tr key={item.id}>
                                    <td>{item.item?.name || "Unknown Item"}</td>
                                    <td>{item.quantity}</td>
                                    <td>₱{item.price.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          ) : (
                            <Text>No items found</Text>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  });

  return (
    <Stack p="lg">
      <Group justify="space-between" align="left">
        <Title order={2}>Orders</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate("/add-order")}
        >
          Add Order
        </Button>
      </Group>

      <Table highlightOnHover verticalSpacing="sm" mt="md">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer Name</th>
            <th>Total Qty</th>
            <th>Delivery Status</th>
            <th>Order Date</th>
            <th>Total Price</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows
          ) : (
            <tr>
              <td colSpan={8}>
                <Text align="left">No orders found</Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal
        opened={addPaymentOpen}
        onClose={() => setAddPaymentOpen(false)}
        title="Add Payment Details"
        size="md"
        centered
      >
        <AddPaymentModal
          order={selectedOrder}
          onClose={() => setAddPaymentOpen(false)}
          refreshOrders={fetchOrders}
        />
      </Modal>
    </Stack>
  );
};

export default Order;
