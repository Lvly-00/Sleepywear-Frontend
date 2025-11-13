import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  Pagination,
  Center,
} from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";

import AddPaymentModal from "../components/AddPaymentModal";
import InvoicePreview from "../components/InvoicePreview";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import PageHeader from "../components/PageHeader";
import { Icons } from "../components/Icons";
import api from "../api/axios";
import NotifySuccess from "@/components/NotifySuccess";

const MIN_SKELETON_ROWS = 6;

const rowVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, ease: "easeOut" },
  }),
  exit: { opacity: 0, y: 10 },
};

const ORDERS_PER_PAGE = 10;

export default function Order() {
  const navigate = useNavigate();
  const location = useLocation();
  const preloadedOrders = location.state?.preloadedOrders || null;

  const [ordersCache, setOrdersCache] = useState({}); // cache per page
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(!preloadedOrders);

  const [search, setSearch] = useState("");
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const ordersRef = useRef(ordersCache);
  ordersRef.current = ordersCache;

const fetchOrdersPage = useCallback(
  async (page) => {
    setLoading(true);
    try {
      const res = await api.get("/orders", {
        params: {
          page,
          per_page: ORDERS_PER_PAGE,
          search: search.trim() || undefined, // pass search term
        },
      });

      setOrdersCache((prev) => ({
        ...prev,
        [page]: res.data.data,
      }));

      setTotalPages(res.data.last_page || 1);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  },
  [search]
);


  const handleSearchEnter = () => {
    setCurrentPage(1);
    fetchOrdersPage(1);
  };

const handleSearchKeyPress = (e) => {
  if (e.key === "Enter") {
    setCurrentPage(1);        
    fetchOrdersPage(1);      
  }
};



  // Load initial page
  useEffect(() => {
    fetchOrdersPage(currentPage);
  }, [currentPage, fetchOrdersPage]);

  // Merge cached pages for display (filter/search only applies to current page)
  const currentOrders = ordersCache[currentPage] || [];

  const filteredOrders = currentOrders.filter((order) => {
    const fullName = `${order.first_name} ${order.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  const skeletonRowCount = Math.max(currentOrders.length, MIN_SKELETON_ROWS);

  const renderSkeletonRows = (rows = 5) =>
    Array.from({ length: rows }).map((_, i) => (
      <Table.Tr key={i}>
        <Table.Td><Skeleton height={20} width="40%" /></Table.Td>
        <Table.Td><Skeleton height={20} width="70%" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}><Skeleton height={20} width="30%" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}><Skeleton height={20} width="40%" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}><Skeleton height={20} width="30%" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}><Skeleton height={30} width="80px" radius="xl" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Group justify="center">
            <Skeleton height={24} circle />
            <Skeleton height={24} circle />
          </Group>
        </Table.Td>
      </Table.Tr>
    ));

  // Handle page change
  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <Stack p="xs" spacing="lg">
      <PageHeader
        title="Orders"
        showSearch
        search={search}
        setSearch={setSearch}
        onSearchEnter={handleSearchEnter}
        addLabel="Add Order"
        addLink="/add-order"
      />


      <Paper
        radius="md"
        p="xl"
        style={{
          minHeight: "70vh",
          marginBottom: "1rem",
          background: "white",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'League Spartan', sans-serif",
        }}
      >
        {/* Table + ScrollArea */}
        <ScrollArea
          scrollbarSize={8}
          style={{ flex: 1, minHeight: "0" }} // flex:1 makes it take remaining space
        >
          <Table highlightOnHover
            styles={{
              tr: { borderBottom: "1px solid #D8CBB8", fontSize: "20px" },
              th: {
                fontFamily: "'League Spartan', sans-serif",
                fontSize: "20px",
              },
              td: { fontFamily: "'League Spartan', sans-serif" },
            }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Order ID</Table.Th>
                <Table.Th>Customer Name</Table.Th>
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
                <Table.Tr>
                  <Table.Td colSpan={7} style={{ textAlign: "center", padding: "1.5rem" }}>
                    <Text c="dimmed" size="20px">No orders found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                <AnimatePresence>
                  {filteredOrders.map((order, i) => {
                    const fullName = `${order.first_name} ${order.last_name}`;
                    const totalQty = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                    const totalPrice = order.total || order.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0;

                    return (
                      <motion.tr
                        key={order.id}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        onClick={() => { setInvoiceData(order); setInvoiceModal(true); }}
                        style={{ cursor: "pointer", borderBottom: "1px solid #D8CBB8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <Table.Td style={{ textAlign: "left", fontSize: "16px" }}>
                          {order.id}</Table.Td>
                        <Table.Td style={{ textAlign: "left", fontSize: "16px" }}>
                          {fullName}</Table.Td>
                        <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                          {totalQty}</Table.Td>
                        <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>

                          {new Date(order.order_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                          ₱{Math.round(totalPrice).toLocaleString()}</Table.Td>
                        <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>

                          <Badge
                            size="27"
                            variant="filled"
                            style={{
                              backgroundColor: order.payment?.payment_status === "Paid" ? "#A5BDAE" : "#D9D9D9",
                              color: order.payment?.payment_status === "Paid" ? "#FFF" : "#7A7A7A",
                              width: "115px",
                              fontWeight: 400,
                              paddingTop: "5px",
                              borderRadius: "16px",
                              fontSize: "16px",
                            }}
                          >
                            {order.payment?.payment_status || "Unpaid"}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>

                          <Group gap="4" justify="center">
                            {order.payment?.payment_status !== "Paid" && (
                              <Button size="xs" color="#276D58" variant="subtle" p={3}
                                onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setAddPaymentOpen(true); }}>
                                <Icons.AddPayment size={26} />
                              </Button>
                            )}
                            <Button size="xs" variant="subtle" color="red" p={3}
                              onClick={(e) => { e.stopPropagation(); setOrderToDelete(order); setDeleteModalOpen(true); }}>
                              <Icons.Trash size={26} />
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
        <Center>
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="#0A0B32"
            size="md"
            radius="md"
          />
        </Center>
      </Paper>


      {/*  Delete Confirmation */}
      <DeleteConfirmModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        name={orderToDelete ? `Order #${orderToDelete.id}` : ""}
        onConfirm={async () => {
          if (!orderToDelete) return;
          try {
            await api.delete(`/orders/${orderToDelete.id}`);
            setOrdersCache((prev) => {
              const newCache = { ...prev };
              Object.keys(newCache).forEach((page) => {
                newCache[page] = newCache[page].filter(o => o.id !== orderToDelete.id);
              });
              return newCache;
            });
            NotifySuccess.deleted();
            setDeleteModalOpen(false);
          } catch (err) {
            console.error("Error deleting order:", err);
          }
        }}
      />

      {/*  Add Payment */}
      {addPaymentOpen && selectedOrder && (
        <AddPaymentModal
          opened={addPaymentOpen}
          onClose={() => setAddPaymentOpen(false)}
          order={selectedOrder}
          onOrderUpdated={(updatedOrder) => {
            setOrdersCache((prev) => {
              const newCache = { ...prev };
              Object.keys(newCache).forEach((page) => {
                newCache[page] = newCache[page].map(o =>
                  o.id === updatedOrder.id ? updatedOrder : o
                );
              });
              return newCache;
            });
            NotifySuccess.addedPayment();
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
}
