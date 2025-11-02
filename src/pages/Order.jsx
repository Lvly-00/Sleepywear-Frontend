import React, { useEffect, useState } from "react";
import {
  Button,
  Group,
  Stack,
  Table,
  Text,
  Badge,
  ScrollArea,
  Paper,
} from "@mantine/core";
import AddPaymentModal from "../components/AddPaymentModal";
import InvoicePreview from "../components/InvoicePreview";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import PageHeader from "../components/PageHeader";
import SleepyLoader from "../components/SleepyLoader";
import { Icons } from "../components/Icons";
import api from "../api/axios";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Fetch orders from backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Remove order from local state after delete
  const removeOrder = (orderId) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = (order) => {
    setOrderToDelete(order);
    setDeleteModalOpen(true);
  };

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.first_name} ${order.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  if (loading) return <SleepyLoader />;

  return (
    <Stack p="lg" spacing="lg">
      <PageHeader
        title="Orders"
        showSearch
        search={search}
        setSearch={setSearch}
        addLabel="Add Order"
        addLink="/add-order"
      />

      <Paper
        radius="md"
        p="xl"
        style={{
          background: "white",
          minHeight: "70vh",
          marginBottom: "1rem",
          position: "relative",
        }}
      >
        <ScrollArea scrollbars="x" style={{ minHeight: "70vh" }}>
          <Table
            highlightOnHover
            styles={{
              tr: { borderBottom: "1px solid #D8CBB8" },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ textAlign: "center" }}>Order ID</Table.Th>
                <Table.Th style={{ textAlign: "left" }}>Customer Name</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Qty</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Order Date</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Price</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>
                  Payment Status
                </Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Manage</Table.Th>
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
                      style={{ cursor: "pointer" }}
                    >
                      <Table.Td style={{ textAlign: "center" }}>{order.id}</Table.Td>
                      <Table.Td style={{ textAlign: "left" }}>{fullName}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>{totalQty}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {new Date(order.order_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        ₱{Math.round(totalPrice)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge
                          size="lg"
                          variant="filled"
                          style={{
                            backgroundColor:
                              order.payment?.payment_status === "Paid"
                                ? "#A5BDAE"
                                : "#D9D9D9",
                            color:
                              order.payment?.payment_status === "Paid"
                                ? "#FFFFFF"
                                : "#7A7A7A",
                            width: "100px",
                            textAlign: "center",
                            fontWeight: 600,
                            borderRadius: "13px",
                            textTransform: "capitalize",
                          }}
                        >
                          {order.payment?.payment_status?.toLowerCase() || "unpaid"}
                        </Badge>
                      </Table.Td>

                      <Table.Td style={{ textAlign: "center" }}>
                        <Group gap="4" justify="center">
                          {order.payment?.payment_status !== "Paid" && (
                            <Button
                              size="xs"
                              color="#276D58"
                              variant="subtle"
                              p={3}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(order);
                                setAddPaymentOpen(true);
                              }}
                            >
                              <Icons.AddPayment size={24} />
                            </Button>
                          )}

                          <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            p={3}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(order);
                            }}
                          >
                            <Icons.Trash size={24} />
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
      </Paper>

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        name={orderToDelete ? `Order #${orderToDelete.id}` : ""}
        onConfirm={async () => {
          if (!orderToDelete) return;
          try {
            await api.delete(`/orders/${orderToDelete.id}`);
            removeOrder(orderToDelete.id);
            setDeleteModalOpen(false);
          } catch (err) {
            console.error("Error deleting order:", err);
          }
        }}
      />

      {/* Add Payment */}
      {addPaymentOpen && selectedOrder && (
        <AddPaymentModal
          opened={addPaymentOpen}
          onClose={() => setAddPaymentOpen(false)}
          order={selectedOrder}
          onOrderUpdated={(updatedOrder) => {
            // Update the local order in the list after payment update
            setOrders((prev) =>
              prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
            );
          }}
        />
      )}

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
