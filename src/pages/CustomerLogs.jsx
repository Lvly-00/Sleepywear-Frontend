import React, { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import {
  Table,
  Button,
  Group,
  Anchor,
  Paper,
  ScrollArea,
  Text,
  Stack,
  Center,
  Skeleton,
  Pagination,
} from "@mantine/core";
import PageHeader from "../components/PageHeader";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";
import { motion, AnimatePresence } from "framer-motion";

const rowVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, ease: "easeOut" },
  }),
  exit: { opacity: 0, y: 10 },
};

export default function CustomerLogs() {
  const [customers, setCustomers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ opened: false, customer: null });

  // Fetch customers with page & search params
  const fetchCustomers = useCallback(async (pageNumber = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const res = await api.get("/customers", {
        params: {
          page: pageNumber,
          per_page: 10,
          search: searchTerm || undefined,
        },
      });

      setCustomers(res.data.data || []);
      setTotalPages(res.data.last_page || 1);
      setPage(res.data.current_page || 1);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setCustomers([]);
      setTotalPages(1);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch customers when page or search changes
  useEffect(() => {
    fetchCustomers(page, search);
  }, [page, search, fetchCustomers]);

  // Delete customer handler
  const handleDelete = async (customer) => {
    try {
      setLoading(true);
      await api.delete(`/customers/${customer.id}`);
      setDeleteModal({ opened: false, customer: null });
      // Refresh current page after delete
      fetchCustomers(page, search);
      NotifySuccess.deleted();
    } catch (error) {
      console.error("Failed to delete customer:", error);
      setLoading(false);
    }
  };

  const SkeletonRows = () => (
    <Table.Tbody>
      {Array.from({ length: 6 }).map((_, i) => (
        <Table.Tr key={i}>
          <Table.Td><Skeleton height={18} width="70%" /></Table.Td>
          <Table.Td style={{ textAlign: "center" }}><Skeleton height={18} width="60%" /></Table.Td>
          <Table.Td style={{ textAlign: "center" }}><Skeleton height={18} width="40%" /></Table.Td>
          <Table.Td style={{ textAlign: "center" }}><Skeleton height={18} width="50%" /></Table.Td>
          <Table.Td style={{ textAlign: "center" }}><Skeleton height={18} width="30%" /></Table.Td>
          <Table.Td style={{ textAlign: "center" }}><Skeleton height={18} width="20%" /></Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  );

  return (
    <Stack p="xs" spacing="lg" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      <PageHeader
        title="Customers"
        showSearch
        search={search}
        setSearch={(val) => {
          setSearch(val);
          setPage(1); // Reset page on new search
        }}
        rightSection={<Button size="xs" onClick={() => fetchCustomers(page, search)}>Refresh</Button>}
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
          {loading ? (
            <Table
              highlightOnHover
              styles={{
                tr: { borderBottom: "1px solid #D8CBB8", fontSize: "20px" },
                th: { fontFamily: "'League Spartan', sans-serif", fontSize: "20px" },
                td: { fontFamily: "'League Spartan', sans-serif" },
              }}
            >              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Customer Name</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Address</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Contact Number</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Social Media Account</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Date Created</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Manage</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <SkeletonRows />
            </Table>
          ) : customers.length === 0 ? (
            <Table.Tr style={{ borderBottom: "1px solid #D8CBB8" }}>
              <Table.Td colSpan={8} style={{ textAlign: "center", padding: "1.5rem" }}>
                <Text c="dimmed" size="20px">
                  No Customers found
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            <Table highlightOnHover styles={{ tr: { borderBottom: "1px solid #D8CBB8", fontSize: "18px" } }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Customer Name</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Address</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Contact Number</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Social Media Account</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Date Created</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Manage</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                <AnimatePresence>
                  {customers.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      style={{ borderBottom: "1px solid #D8CBB8", cursor: "default" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Table.Td style={{ textAlign: "left" , fontSize: "16px" }}>{`${c.first_name} ${c.last_name}`}</Table.Td>
                      <Table.Td style={{ textAlign: "center" , fontSize: "16px" }}>{c.address || "—"}</Table.Td>
                      <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>{c.contact_number}</Table.Td>
                      <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                        {c.social_handle && /^https?:\/\//.test(c.social_handle) ? (
                          <Anchor
                            href={c.social_handle}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            style={{ color: "#4455f0ff", fontSize: "17px" }}
                          >
                            {c.social_handle}
                          </Anchor>
                        ) : "-"}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                        <Group gap={4} justify="center">
                          <Button size="xs" variant="subtle" color="red" p={3} onClick={() => setDeleteModal({ opened: true, customer: c })}>
                            <Icons.Trash size={22} />
                          </Button>
                        </Group>
                      </Table.Td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </Table.Tbody>
            </Table>
          )}
        </ScrollArea>

        <Center mt="md">
          <Pagination page={page} onChange={setPage} total={totalPages} color="#0A0B32" size="md" radius="md" />
        </Center>
      </Paper>

      <DeleteConfirmModal
        opened={deleteModal.opened}
        onClose={() => setDeleteModal({ opened: false, customer: null })}
        name={deleteModal.customer ? `${deleteModal.customer.first_name} ${deleteModal.customer.last_name}` : ""}
        onConfirm={() => deleteModal.customer && handleDelete(deleteModal.customer)}
      />
    </Stack>
  );
}
