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
  Paper,
  Pagination,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash, IconSearch } from "@tabler/icons-react";
import AddPaymentModal from "../../components/AddPaymentModal";
import InvoicePreview from "../../components/InvoicePreview";
import { openDeleteConfirmModal } from "../../components/DeleteConfirmModal";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";
import { useNavigate } from "react-router-dom";
import { Icons } from "../../components/Icons";


const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [search, setSearch] = useState("");
  const [activePage, setActivePage] = useState(1);
  const itemsPerPage = 10;
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
        if (a.payment_status === "unpaid" && b.payment_status === "paid")
          return -1;
        if (a.payment_status === "paid" && b.payment_status === "unpaid")
          return 1;
        return new Date(b.order_date) - new Date(a.order_date);
      });

      setOrders(sortedOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      // setLoading(false);
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

  // Filter orders based on search term
  const filteredOrders = orders.filter((order) => {
    const fullName = `${order.first_name} ${order.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  // Pagination
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  // if (loading) {
  //   return <SleepyLoader />;
  // }

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

      <ScrollArea>
        <Paper radius="md" p="xl" style={{
          minHeight: "70vh",
          marginBottom: "1rem",
          boxSizing: "border-box",
          position: "relative"
        }}>
          <Table
            highlightOnHover
            styles={{
              tr: {
                borderBottom: "1px solid #D8CBB8",
              },
            }}
          >       
             <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ textAlign: "center" }}>Order ID</Table.Th>
                <Table.Th style={{ textAlign: "left" }}>Customer Name</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Qty</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Order Date</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Price</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Payment Status</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Manage</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => {
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
                      <Table.Td style={{ textAlign: "center" }}>{order.id}</Table.Td>
                      <Table.Td style={{ textAlign: "left" }}>{fullName}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>{totalQty}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {new Date(order.order_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        ₱{Math.round(totalPrice)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge
                          variant="filled"
                          style={{
                            backgroundColor:
                              order.payment_status === "paid" ? "#A5BDAE" : "#D9D9D9",
                            color: order.payment_status === "paid" ? "#FFFFFF" : "#7A7A7A",
                            width: "80px",
                            textAlign: "center",
                            justifyContent: "center",
                            textTransform: "capitalize",
                            fontWeight: "700",
                          }}
                        >
                          {order.payment_status || "unpaid"}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Group gap="{4}" justify="center">
                          {order.payment_status !== "paid" && (
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
          {totalPages > 1 && (
            <Group
              justify="center"
              style={{
                position: "absolute",
                bottom: "1rem",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >              <Pagination
                total={totalPages}
                value={activePage}
                onChange={setActivePage}
                color="#232D80" ng
                radius="md"
              />
            </Group>
          )}
        </Paper>
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
