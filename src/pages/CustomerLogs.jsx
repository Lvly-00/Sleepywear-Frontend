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
import { motion, AnimatePresence } from "framer-motion";

import PageHeader from "../components/PageHeader";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";
import NotifySuccess from "../components/NotifySuccess";

const rowVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, ease: "easeOut" },
  }),
  exit: { opacity: 0, y: 10 },
};

const MIN_SKELETON_ROWS = 6;
const CUSTOMERS_PER_PAGE = 10;

export default function CustomerLogs() {
  const [customers, setCustomers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ opened: false, customer: null });

  const fetchCustomers = useCallback(
    async (pageNumber = 1, searchTerm = "") => {
      setLoading(true);
      try {
        const res = await api.get("/customers", {
          params: {
            page: pageNumber,
            per_page: CUSTOMERS_PER_PAGE,
            search: searchTerm || undefined,
          },
        });

        setCustomers((prev) => ({ ...prev, [pageNumber]: res.data.data || [] }));
        setTotalPages(res.data.last_page || 1);
        setCurrentPage(res.data.current_page || pageNumber);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setCustomers({});
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCustomers(currentPage, search);
  }, [currentPage, search, fetchCustomers]);

  const handleDelete = async (customer) => {
    try {
      setLoading(true);
      await api.delete(`/customers/${customer.id}`);
      setDeleteModal({ opened: false, customer: null });

      // Remove deleted customer from cache
      setCustomers((prev) => {
        const newCache = { ...prev };
        Object.keys(newCache).forEach((page) => {
          newCache[page] = newCache[page].filter((c) => c.id !== customer.id);
        });
        return newCache;
      });

      NotifySuccess.deleted();
    } catch (err) {
      console.error("Failed to delete customer:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentCustomers = customers[currentPage] || [];
  const skeletonRowCount = Math.max(currentCustomers.length, MIN_SKELETON_ROWS);

  const renderSkeletonRows = () =>
    Array.from({ length: skeletonRowCount }).map((_, i) => (
      <Table.Tr key={i}>
        <Table.Td><Skeleton height={18} width="70%" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}><Skeleton height={18} width="60%" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}><Skeleton height={18} width="40%" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}><Skeleton height={18} width="50%" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}><Skeleton height={18} width="30%" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}><Skeleton height={18} width="20%" /></Table.Td>
      </Table.Tr>
    ));

  return (
    <Stack p="xs" spacing="lg" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      <PageHeader
        title="Customers"
        showSearch
        search={search}
        setSearch={(val) => { setSearch(val); setCurrentPage(1); }}
        rightSection={<Button size="xs" onClick={() => fetchCustomers(currentPage, search)}>Refresh</Button>}
      />

      <Paper
        radius="md"
        p="xl"
        style={{
          minHeight: "70vh",
          marginBottom: "1rem",
          background: "white",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ScrollArea scrollbarSize={8} style={{ flex: 1, minHeight: "0" }}>
          <Table highlightOnHover styles={{ tr: { borderBottom: "1px solid #D8CBB8" }, th: { fontSize: "18px" }, td: { fontSize: "16px" } }}>
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
              {loading ? (
                renderSkeletonRows()
              ) : currentCustomers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: "center", padding: "1.5rem" }}>
                    <Text c="dimmed" size="20px">No Customers found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                <AnimatePresence>
                  {currentCustomers.map((c, i) => (
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
                      <Table.Td>{`${c.first_name} ${c.last_name}`}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>{c.address || "—"}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>{c.contact_number}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {c.social_handle && /^https?:\/\//.test(c.social_handle) ? (
                          <Anchor href={c.social_handle} target="_blank" rel="noopener noreferrer" underline="hover" style={{ color: "#4455f0ff" }}>
                            {c.social_handle}
                          </Anchor>
                        ) : "-"}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Group justify="center">
                          <Button size="xs" variant="subtle" color="red" p={3} onClick={() => setDeleteModal({ opened: true, customer: c })}>
                            <Icons.Trash size={22} />
                          </Button>
                        </Group>
                      </Table.Td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Center mt="md">
          <Pagination
            page={currentPage}
            onChange={setCurrentPage}
            total={totalPages}
            color="#0A0B32"
            size="md"
            radius="md"
          />
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
