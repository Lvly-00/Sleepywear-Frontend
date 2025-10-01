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
  TextInput,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash, IconSearch } from "@tabler/icons-react";
import AddPaymentModal from "../../components/AddPaymentModal";
import InvoicePreview from "../../components/InvoicePreview";
import { openDeleteConfirmModal } from "../../components/DeleteConfirmModal";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";
import { useNavigate } from "react-router-dom";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/orders");
      let ordersArray = [];
      if (Array.isArray(res.data)) ordersArray = res.data;
      else if (Array.isArray(res.data.orders)) ordersArray = res.data.orders;
      else if (Array.isArray(res.data.data)) ordersArray = res.data.data;

      const sortedOrders = ordersArray.sort((a, b) => {
        if (a.payment_status === "pending" && b.payment_status === "paid")
          return -1;
        if (a.payment_status === "paid" && b.payment_status === "pending")
          return 1;
        return new Date(b.order_date) - new Date(a.order_date);
      });

      setOrders(sortedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = (order) => {
    openDeleteConfirmModal({
      title: "Delete Order",
      name: `Order #${order.id}`,
      onConfirm: async () => {
        try {
          await api.delete(`/api/orders/${order.id}`);
          fetchOrders();
        } catch (err) {
          console.error("Error deleting order:", err);
        }
      },
    });
  };

  // ✅ Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.first_name} ${order.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  if (loading) {
    return <SleepyLoader />;
  }

  return (
    <Stack p="lg" spacing="lg">
      <PageHeader
        title="Orders"
        showSearch
        search={search}
        setSearch={setSearch}
        addLabel="New Order"
        addLink="/add-order"
      />

      <ScrollArea>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Total Qty</Table.Th>
              <Table.Th>Order Date</Table.Th>
              <Table.Th>Total Price</Table.Th>
              <Table.Th>Payment Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
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
                  <Table.Tr
                    key={order.id}
                    onClick={() => {
                      setInvoiceData(order);
                      setInvoiceModal(true);
                    }}
                    style={{ cursor: "pointer" }} // <-- shows pointer cursor for UX
                  >
                    <Table.Td>{order.id}</Table.Td>
                    <Table.Td>{fullName}</Table.Td>
                    <Table.Td>{totalQty}</Table.Td>

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
                            onClick={(e) => {
                              e.stopPropagation(); // prevent row click from firing
                              setSelectedOrder(order);
                              setAddPaymentOpen(true);
                            }}
                          >
                            Add Payment
                          </Button>
                        )}
                        <Button
                          size="xs"
                          color="red"
                          leftIcon={<IconTrash size={14} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(order);
                          }}
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
