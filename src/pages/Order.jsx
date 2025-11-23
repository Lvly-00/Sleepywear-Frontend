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

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get("page") || "1", 10);
  const initialSearch = queryParams.get("search") || "";

  const preloadedOrders = location.state?.preloadedOrders || null;
  const newOrder = location.state?.newOrder || null;
  const openInvoiceOnLoad = location.state?.openInvoice || false;

  const [ordersCache, setOrdersCache] = useState({});
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(!preloadedOrders);

  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage);
    if (search.trim() !== "") params.set("search", search.trim());
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  }, [currentPage, search, navigate, location.pathname]);


  const fetchOrdersPage = useCallback(
    async (page, searchTerm = search) => {
      setLoading(true);
      try {
        const res = await api.get("/orders", {
          params: {
            page,
            per_page: ORDERS_PER_PAGE,
            search: searchTerm.trim() || undefined,
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

  // Handle Enter press for search
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      const trimmed = searchValue.trim();
      setSearch(trimmed);  // triggers fetch
      setCurrentPage(1);   // reset pagination
    }
  };



  // Pagination change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchOrdersPage(page, search);
  };


  // Initial fetch
  useEffect(() => {
    fetchOrdersPage(currentPage, search);
  }, [currentPage, search]);


  const currentOrders = ordersCache[currentPage] || [];

  // SORT and filter logic
  const sortedOrders = [...currentOrders].sort((a, b) => {
    const aPaid = a.payment?.payment_status === "Paid";
    const bPaid = b.payment?.payment_status === "Paid";

    if (aPaid !== bPaid) return aPaid ? 1 : -1;

    const aDate = new Date(a.order_date);
    const bDate = new Date(b.order_date);

    return aPaid ? aDate - bDate : bDate - aDate;
  });

  const filteredOrders = sortedOrders.filter((order) => {
    const fullName = `${order.first_name} ${order.last_name}`.toLowerCase();
    const id = String(order.id);
    const formattedId = order.formatted_id?.toLowerCase?.() || "";

    const s = search.toLowerCase();

    return (
      fullName.includes(s) ||
      id.includes(s) ||
      formattedId.includes(s)
    );
  });

  const skeletonRowCount = Math.max(currentOrders.length, MIN_SKELETON_ROWS);

  const renderSkeletonRows = (rows = 5) =>
    Array.from({ length: rows }).map((_, i) => (
      <Table.Tr key={i}>
        <Table.Td>
          <Skeleton height={20} width="40%" />
        </Table.Td>
        <Table.Td>
          <Skeleton height={20} width="70%" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Skeleton height={20} width="30%" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Skeleton height={20} width="40%" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Skeleton height={20} width="30%" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Skeleton height={30} width="80px" radius="xl" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Group justify="center">
            <Skeleton height={24} circle />
            <Skeleton height={24} circle />
          </Group>
        </Table.Td>
      </Table.Tr>
    ));

  useEffect(() => {
    if (newOrder && openInvoiceOnLoad) {
      setInvoiceData(newOrder);
      setInvoiceModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [newOrder, openInvoiceOnLoad]);

  return (
    <Stack p="xs" spacing="lg">
      <PageHeader
        title="Orders"
        showSearch
        search={searchValue}
        setSearch={setSearchValue}
        onSearchEnter={() => {
          const trimmedSearch = searchValue.trim();
          setSearch(trimmedSearch);
          setCurrentPage(1);
          fetchOrdersPage(1, trimmedSearch);
        }}
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
        <ScrollArea scrollbarSize={8} style={{ flex: 1, minHeight: "0" }}>
          <Table
            highlightOnHover
            styles={{
              tr: { borderBottom: "1px solid #D8CBB8", fontSize: "20px" },
              th: { fontFamily: "'League Spartan', sans-serif", fontSize: "20px" },
              td: { fontFamily: "'League Spartan', sans-serif" },
            }}
          >
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
                    <Text c="dimmed" size="20px">
                      No orders found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                <AnimatePresence>
                  {filteredOrders.map((order, i) => {
                    const fullName = `${order.first_name} ${order.last_name}`;
                    const totalQty = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
                    const totalPrice =
                      order.total ||
                      order.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) ||
                      0;

                    return (
                      <motion.tr
                        key={order.id}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        onClick={() => {
                          setInvoiceData(order);
                          setInvoiceModal(true);
                        }}
                        style={{ cursor: "pointer", borderBottom: "1px solid #D8CBB8" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "transparent")
                        }
                      >
                        <Table.Td style={{ textAlign: "left", fontSize: "16px" }}>
                          {order.formatted_id}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "left", fontSize: "16px" }}>{fullName}</Table.Td>
                        <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>{totalQty}</Table.Td>
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
                            size="27"
                            variant="filled"
                            style={{
                              backgroundColor:
                                order.payment?.payment_status === "Paid"
                                  ? "#A5BDAE"
                                  : "#D9D9D9",
                              color:
                                order.payment?.payment_status === "Paid" ? "#FFF" : "#7A7A7A",
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
                                <Icons.AddPayment size={26} />
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

        <Center mt="md" style={{ marginTop: "auto" }}>
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={(page) => setCurrentPage(page)}
            color="#0A0B32"
            size="md"
            radius="md"
          />
        </Center>


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
            setOrdersCache((prev) => {
              const newCache = { ...prev };
              Object.keys(newCache).forEach((page) => {
                newCache[page] = newCache[page].filter((o) => o.id !== orderToDelete.id);
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

      {/* Add Payment Modal */}
      {addPaymentOpen && selectedOrder && (
        <AddPaymentModal
          opened={addPaymentOpen}
          onClose={() => setAddPaymentOpen(false)}
          order={selectedOrder}
          onOrderUpdated={(updatedOrder) => {
            setOrdersCache((prev) => {
              const newCache = { ...prev };
              Object.keys(newCache).forEach((page) => {
                newCache[page] = newCache[page].map((o) =>
                  o.id === updatedOrder.id ? updatedOrder : o
                );
              });
              return newCache;
            });

            // Refresh the CURRENT PAGE instead of jumping to last page
            const current = currentPage;
            fetchOrdersPage(current, search);

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
