import React, { useState, useEffect } from "react";
import {
  Button,
  Group,
  Title,
  Modal,
  Stack,
  Table,
  Text,
  Badge,
  ScrollArea,
  Image,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import AddPaymentModal from "../../components/AddPaymentModal";
import InvoicePreview from "../../components/InvoicePreview";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders");
      let ordersArray = [];
      if (Array.isArray(res.data)) ordersArray = res.data;
      else if (Array.isArray(res.data.orders)) ordersArray = res.data.orders;
      else if (Array.isArray(res.data.data)) ordersArray = res.data.data;

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

  return (
    <Stack p="lg" spacing="lg">
      <Group position="apart" align="center">
        <Title order={2}>Orders</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => navigate("/add-order")}
        >
          Add Order
        </Button>
      </Group>

      <ScrollArea>
        <Table
          highlightOnHover
          verticalSpacing="md"
          sx={(theme) => ({
            border: `1px solid ${theme.colors.gray[3]}`,
            borderRadius: theme.radius.md,
            overflow: "hidden",
          })}
        >
          <thead style={{ backgroundColor: "#f5f5f5" }}>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total Qty</th>
              <th>Delivery Status</th>
              <th>Order Date</th>
              <th>Total Price</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => {
                const fullName = `${order.first_name} ${order.last_name}`;
                const totalQty =
                  order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                const totalPrice =
                  order.total ||
                  order.items?.reduce(
                    (sum, i) => sum + i.price * i.quantity,
                    0
                  );

                return (
                  <React.Fragment key={order.id}>
                    <tr
                      style={{ cursor: "pointer" }}
                      onClick={() => toggleExpand(order.id)}
                    >
                      <td>{order.id}</td>
                      <td>{fullName}</td>
                      <td>{totalQty}</td>
                      <td>
                        <Badge
                          color={
                            order.delivery_status === "delivered"
                              ? "green"
                              : order.delivery_status === "processing"
                              ? "blue"
                              : "yellow"
                          }
                          variant="filled"
                        >
                          {order.delivery_status || "Pending"}
                        </Badge>
                      </td>
                      <td>{new Date(order.order_date).toLocaleDateString()}</td>
                      <td>₱{totalPrice.toFixed(2)}</td>
                      <td>
                        <Badge
                          color={
                            order.payment_status === "paid"
                              ? "green"
                              : order.payment_status === "pending"
                              ? "yellow"
                              : "gray"
                          }
                          variant="filled"
                        >
                          {order.payment_status || "Pending"}
                        </Badge>
                      </td>
                      <td>
                        <Group spacing="xs" position="right">
                          {order.payment_status !== "paid" && (
                            <Button
                              size="xs"
                              padding="md"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setAddPaymentOpen(true);
                              }}
                            >
                              Add Payment
                            </Button>
                          )}
                          <Button
                            size="xs"
                            color="teal"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInvoiceData(order);
                              setInvoiceModal(true);
                            }}
                          >
                            Invoice
                          </Button>
                          <Button
                            size="xs"
                            padding="md"
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

                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan={8}>
                          <div
                            style={{
                              backgroundColor: "#f9f9f9",
                              padding: "1rem",
                              borderRadius: "0 0 8px 8px",
                            }}
                          >
                            <Group spacing="xl" align="flex-start">
                              <Stack spacing="xs" style={{ flex: 1 }}>
                                <Text>
                                  <strong>Address:</strong> {order.address}
                                </Text>
                                <Text>
                                  <strong>Social Media:</strong>{" "}
                                  {order.social_handle}
                                </Text>
                                {order.payment_status === "paid" && (
                                  <>
                                    <Text>
                                      <strong>Payment Method:</strong>{" "}
                                      {order.payment_method}
                                    </Text>
                                    {order.payment_image && (
                                      <div>
                                        <Text>
                                          <strong>Payment Proof:</strong>
                                        </Text>
                                        {order.payment_image_url ? (
                                          <Image
                                            src={order.payment_image_url}
                                            alt="Payment Proof"
                                            fit="cover"
                                            radius="sm"
                                            style={{ width: 150, height: 150 }}
                                          />
                                        ) : (
                                          <Text size="sm" color="dimmed">
                                            No payment proof
                                          </Text>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </Stack>

                              <ScrollArea style={{ maxHeight: 150, flex: 2 }}>
                                {order.items && order.items.length ? (
                                  <Table
                                    highlightOnHover
                                    verticalSpacing="xs"
                                    fontSize="sm"
                                  >
                                    <thead>
                                      <tr>
                                        <th>Item</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {order.items.map((item) => (
                                        <tr key={item.id}>
                                          <td>
                                            {item.item?.name || "Unknown"}
                                          </td>
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
                            </Group>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={8}>
                  <Text align="center" color="dimmed">
                    No orders found
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </ScrollArea>

      {/* Add Payment Modal */}
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

      {/* Invoice Modal */}
      <InvoicePreview
        opened={invoiceModal}
        onClose={() => setInvoiceModal(false)}
        invoiceData={invoiceData}
      />
    </Stack>
  );
};

export default Order;
