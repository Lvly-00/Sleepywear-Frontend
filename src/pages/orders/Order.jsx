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
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Total Qty</Table.Th>
              <Table.Th>Delivery Status</Table.Th>
              <Table.Th>Order Date</Table.Th>
              <Table.Th>Total Price</Table.Th>
              <Table.Th>Payment Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
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
                  <Table.Tr key={order.id}>
                    <Table.Td>{order.id}</Table.Td>
                    <Table.Td>{fullName}</Table.Td>
                    <Table.Td>{totalQty}</Table.Td>
                    <Table.Td>
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
                    </Table.Td>
                    <Table.Td>
                      {new Date(order.order_date).toLocaleDateString()}
                    </Table.Td>
                    <Table.Td>₱{totalPrice.toFixed(2)}</Table.Td>
                    <Table.Td>
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
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {order.payment_status !== "paid" && (
                          <Button
                            size="xs"
                            onClick={() => {
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
                          onClick={() => {
                            setInvoiceData(order);
                            setInvoiceModal(true);
                          }}
                        >
                          Invoice
                        </Button>
                        <Button
                          size="xs"
                          color="blue"
                          leftIcon={<IconEdit size={14} />}
                          onClick={() => navigate(`/edit-order/${order.id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          leftIcon={<IconTrash size={14} />}
                          onClick={() => handleDelete(order.id)}
                        >
                          Delete
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text align="center" color="dimmed">
                    No orders found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
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
