import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../api/axios";
import {
  Table,
  Button,
  Group,
  Anchor,
  Paper,
  ScrollArea,
  Text,
  Skeleton,
  Stack,
} from "@mantine/core";
import PageHeader from "../components/PageHeader";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";
import { motion, AnimatePresence } from "framer-motion";

const CACHE_KEY = "customer_logs_cache";

function isSameData(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((c1, idx) => {
    const c2 = arr2[idx];
    return c1.id === c2.id && c1.updated_at === c2.updated_at;
  });
}

function CustomerLogs() {
  const cachedCustomers = sessionStorage.getItem(CACHE_KEY);
  const initialCustomers = cachedCustomers ? JSON.parse(cachedCustomers) : [];

  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState({ opened: false, customer: null });
  const [loading, setLoading] = useState(initialCustomers.length === 0);

  const debounceRef = useRef(null);
  const customersRef = useRef(customers);
  const firstFetchDone = useRef(false);

  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  useEffect(() => {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(customers));
  }, [customers]);

  const fetchCustomers = useCallback(
    async (searchTerm, noDebounce = false, silent = false) => {
      if (!silent && !noDebounce && !firstFetchDone.current && customersRef.current.length === 0) {
        setLoading(true);
      }
      try {
        const res = await api.get(
          `/customers?search=${encodeURIComponent(searchTerm)}&t=${Date.now()}`
        );

        if (!isSameData(customersRef.current, res.data)) {
          setCustomers(res.data);
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setCustomers([]);
      } finally {
        if (!firstFetchDone.current) {
          firstFetchDone.current = true;
          setLoading(false);
        } else if (!silent && !noDebounce) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCustomers(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, fetchCustomers]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCustomers(search, true, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchCustomers, search]);

  const handleDelete = async (customer) => {
    try {
      setLoading(true);
      await api.delete(`/customers/${customer.id}`);
      setDeleteModal({ opened: false, customer: null });
      await fetchCustomers(search, true);
    } catch (err) {
      console.error("Error deleting customer:", err);
    } finally {
      setLoading(false);
    }
  };

  const skeletonRows = 6;

  // Animation variants (up to down fade in)
  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <Stack
      p="xs"
      spacing="lg"
      style={{ fontFamily: "'League Spartan', sans-serif" }}
    >
      <PageHeader
        title="Customers"
        showSearch
        search={search}
        setSearch={setSearch}
        rightSection={
          <Button
            size="xs"
            onClick={() => fetchCustomers(search, true)}
            aria-label="Refresh customer list"
          >
            Refresh
          </Button>
        }
      />

      <Paper
        radius="md"
        p="xl"
        style={{
          minHeight: "70vh",
          marginBottom: "1rem",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
          background: "white",
          fontFamily: "'League Spartan', sans-serif",
        }}
      >
        <ScrollArea
          scrollbars="x"
          style={{
            minHeight: "70vh",
            marginBottom: ".5rem",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr style={{ borderBottom: "1px solid #D8CBB8" }}>
                  <Table.Th
                    style={{
                      textAlign: "left",
                      fontFamily: "'League Spartan', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                    }}
                  >
                    Customer Name
                  </Table.Th>
                  <Table.Th
                    style={{
                      textAlign: "center",
                      fontFamily: "'League Spartan', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                    }}
                  >
                    Address
                  </Table.Th>
                  <Table.Th
                    style={{
                      textAlign: "center",
                      fontFamily: "'League Spartan', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                    }}
                  >
                    Contact Number
                  </Table.Th>
                  <Table.Th
                    style={{
                      textAlign: "center",
                      fontFamily: "'League Spartan', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                    }}
                  >
                    Social Media Account
                  </Table.Th>
                  <Table.Th
                    style={{
                      textAlign: "center",
                      fontFamily: "'League Spartan', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                    }}
                  >
                    Date Created
                  </Table.Th>
                  <Table.Th
                    style={{
                      textAlign: "center",
                      fontFamily: "'League Spartan', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                    }}
                  >
                    Manage
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {Array.from({ length: skeletonRows }).map((_, idx) => (
                  <Table.Tr
                    key={idx}
                    style={{ height: 50, padding: "0.5rem 0", borderBottom: "1px solid #D8CBB8" }}
                  >
                    <Table.Td>
                      <Skeleton height={20} width="80%" />
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Skeleton height={20} width="70%" />
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Skeleton height={20} width="50%" />
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Skeleton height={20} width="90%" />
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Skeleton height={20} width="60%" />
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Skeleton height={20} width="30px" />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Table
              highlightOnHover
              styles={{
                tr: { borderBottom: "1px solid #D8CBB8" },
                th: { fontFamily: "'League Spartan', sans-serif", fontWeight: 600, fontSize: "20px" },
                td: { fontFamily: "'League Spartan', sans-serif" },
              }}
            >
              <Table.Thead>
                <Table.Tr style={{ borderBottom: "1px solid #D8CBB8" }}>
                  <Table.Th style={{ textAlign: "left" }}>Customer Name</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Address</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Contact Number</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Social Media Account</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Date Created</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Manage</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                <AnimatePresence>
                  {customers.length === 0 ? (
                    <Table.Tr style={{ borderBottom: "1px solid #D8CBB8" }}>
                      <Table.Td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                        <Text c="dimmed">No customers found</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    customers.map((c) => (
                      <motion.tr
                        key={c.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        style={{ borderBottom: "1px solid #D8CBB8" }}
                      >
                        <Table.Td style={{ textAlign: "left", fontSize: "16px" }}>
                          {`${c.first_name} ${c.last_name}`}
                        </Table.Td>
                        <Table.Td
                          style={{
                            textAlign: "center",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            maxWidth: "250px",
                            fontSize: "16px" 
                          }}
                        >
                          {c.address || "—"}
                        </Table.Td>
                        <Table.Td style={{ textAlign: "center", fontSize: "16px"  }}>
                          {c.contact_number}
                          </Table.Td>
                        <Table.Td
                          style={{
                            textAlign: "center",
                            maxWidth: "200px",
                            wordBreak: "break-word",
                            fontSize: "16px" 
                          }}
                        >
                          {c.social_handle && /^https?:\/\//.test(c.social_handle) ? (
                            <Anchor
                              href={c.social_handle}
                              target="_blank"
                              rel="noopener noreferrer"
                              underline="hover"
                              style={{
                                display: "inline-block",
                                maxWidth: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                textAlign: "left",
                                verticalAlign: "middle",
                                color: "#4455f0ff",
                                fontSize: "17px" 
                              }}
                              title={c.social_handle}
                            >
                              {c.social_handle}
                            </Anchor>
                          ) : (
                            <span>-</span>
                          )}
                        </Table.Td>

                        <Table.Td style={{ textAlign: "center", fontSize: "17px"  }}>
                          {c.created_at
                            ? new Date(c.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"}
                        </Table.Td>

                        <Table.Td style={{ textAlign: "center" }}>
                          <Group gap={4} justify="center">
                            <Button
                              size="xs"
                              variant="subtle"
                              color="red"
                              p={3}
                              aria-label={`Delete customer ${c.first_name} ${c.last_name}`}
                              onClick={() => setDeleteModal({ opened: true, customer: c })}
                            >
                              <Icons.Trash size={26} />
                            </Button>
                          </Group>
                        </Table.Td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </Table.Tbody>
            </Table>
          )}
        </ScrollArea>
      </Paper>

      <DeleteConfirmModal
        opened={deleteModal.opened}
        onClose={() => setDeleteModal({ opened: false, customer: null })}
        name={
          deleteModal.customer
            ? `${deleteModal.customer.first_name} ${deleteModal.customer.last_name}`
            : ""
        }
        onConfirm={() => deleteModal.customer && handleDelete(deleteModal.customer)}
      />
    </Stack >
  );
}

export default CustomerLogs;
