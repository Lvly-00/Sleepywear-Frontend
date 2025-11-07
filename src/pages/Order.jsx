import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Button,
  Group,
  Stack,
  Table,
  Text,
  Badge,
  ScrollArea,
  Paper,
  Skeleton,
} from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";

import AddPaymentModal from "../components/AddPaymentModal";
import InvoicePreview from "../components/InvoicePreview";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import PageHeader from "../components/PageHeader";
import { Icons } from "../components/Icons";
import api from "../api/axios";

const CACHE_KEY = "orders_cache";
const MIN_SKELETON_ROWS = 6;

function isSameOrders(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;

  // Check each order by id and updated_at/order_date (whichever exists)
  return arr1.every((o1, idx) => {
    const o2 = arr2[idx];
    if (o1.id !== o2.id) return false;

    // Use updated_at if present, else order_date
    const date1 = o1.updated_at || o1.order_date || "";
    const date2 = o2.updated_at || o2.order_date || "";
    return date1 === date2;
  });
}

const Order = () => {
  const cachedOrders = sessionStorage.getItem(CACHE_KEY);
  const initialOrders = cachedOrders ? JSON.parse(cachedOrders) : [];

  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(initialOrders.length === 0);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const ordersRef = useRef(orders);
  const firstFetchDone = useRef(false);

  // Keep ordersRef updated
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Persist cache when orders update
  useEffect(() => {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(orders));
  }, [orders]);

  const fetchOrders = useCallback(
    async (silent = false) => {
      if (!silent && !firstFetchDone.current && ordersRef.current.length === 0) {
        setLoading(true);
      }
      try {
        const res = await api.get(`/orders?t=${Date.now()}`);
        // Only update if data changed
        if (!isSameOrders(ordersRef.current, res.data)) {
          setOrders(res.data);
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(res.data));
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setOrders([]);
      } finally {
        if (!firstFetchDone.current) {
          firstFetchDone.current = true;
          setLoading(false);
        } else if (!silent) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Poll every 30 seconds silently
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Remove order from state and update cache
  const removeOrder = (orderId) => {
    setOrders((prev) => {
      const updated = prev.filter((order) => order.id !== orderId);
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.first_name} ${order.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });
  const skeletonRowCount = Math.max(orders.length, MIN_SKELETON_ROWS);

  const renderSkeletonRows = (rows = 5) =>
    Array.from({ length: rows }).map((_, i) => (
      <Table.Tr
        key={idx}
        style={{
          paddingTop: 12,
          paddingBottom: 12,
          minHeight: 50,
          borderBottom: "1px solid #D8CBB8",
        }}
      >
        <Table.Td style={{ textAlign: "left", padding: "12px 0" }}>
          <Skeleton height={30} width={40} radius="sm" />
        </Table.Td>
        <Table.Td style={{ textAlign: "left", padding: "12px 0" }}>
          <Skeleton height={30} width="65%" radius="sm" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center", padding: "12px 0" }}>
          <Skeleton height={30} width={25} radius="sm" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center", padding: "12px 0" }}>
          <Skeleton height={30} width={110} radius="sm" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center", padding: "12px 0" }}>
          <Skeleton height={30} width={60} radius="sm" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center", padding: "12px 0" }}>
          <Skeleton height={34} width={110} radius="sm" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center", padding: "12px 0" }}>
          <Skeleton height={34} width={90} radius="sm" />
        </Table.Td>
      </Table.Tr>
    ));

  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  return (
    <Stack
      p="xs"
      spacing="lg"
    >
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
    fontFamily: "'League Spartan', sans-serif",
  }}
>
  <ScrollArea scrollbars="x" style={{ minHeight: "70vh" }}>
    <Table
      highlightOnHover
      styles={{
        tr: { borderBottom: "1px solid #D8CBB8" },
        th: { fontFamily: "'League Spartan', sans-serif", fontSize: "20px" },
        td: { fontFamily: "'League Spartan', sans-serif" },
      }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th style={{ textAlign: "left" }}>Order ID</Table.Th>
          <Table.Th style={{ textAlign: "left" }}>Customer Name</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Qty</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Order Date</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Price</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Payment Status</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Manage</Table.Th>
        </Table.Tr>
      </Table.Thead>

      <Table.Tbody>
        {loading ? (
          renderSkeletonRows(skeletonRowCount)
        ) : filteredOrders.length === 0 ? (
          <Table.Tr style={{ borderBottom: "1px solid #D8CBB8" }}>
            <Table.Td
              colSpan={8}
              style={{ textAlign: "center", padding: "2rem" }}
            >
              <Text c="dimmed">No orders found</Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const fullName = `${order.first_name} ${order.last_name}`;
              const totalQty =
                order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
              const totalPrice =
                order.total ||
                order.items?.reduce(
                  (sum, i) => sum + i.price * i.quantity,
                  0
                ) ||
                0;

              return (
                <motion.tr
                  key={order.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  onClick={() => {
                    setInvoiceData(order);
                    setInvoiceModal(true);
                  }}
                  style={{
                    cursor: "pointer",
                    borderBottom: "1px solid #D8CBB8",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Table.Td style={{ textAlign: "left", fontSize: "16px" }}>
                    {order.id}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "left", fontSize: "16px" }}>
                    {fullName}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                    {totalQty}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                    {new Date(order.order_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                    ₱{Math.round(totalPrice).toLocaleString()}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                    <Badge
                      size="30"
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
                        width: "120px",
                        textAlign: "center",
                        fontWeight: 400,
                        borderRadius: "16px",
                        textTransform: "capitalize",
                        fontSize: "16px",
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
                          setOrderToDelete(order);
                          setDeleteModalOpen(true);
                        }}
                      >
                        <Icons.Trash size={24} />
                      </Button>
                    </Group>
                  </Table.Td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
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
            setOrders((prev) => {
              const updated = prev.map((o) =>
                o.id === updatedOrder.id ? updatedOrder : o
              );
              sessionStorage.setItem(CACHE_KEY, JSON.stringify(updated));
              return updated;
            });
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
