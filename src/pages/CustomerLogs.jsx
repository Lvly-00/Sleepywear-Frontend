import { useState, useEffect, useRef, useCallback } from "react";
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
} from "@mantine/core";
import PageHeader from "../components/PageHeader";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";

import { motion, AnimatePresence } from "framer-motion";

const CACHE_KEY = "customer_logs_cache";

function CustomerLogs() {
  const [customers, setCustomers] = useState(() => {
    // Initialize state from sessionStorage if present
    const cached = sessionStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  });
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState({ opened: false, customer: null });
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef(null);

  // Save customers to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(customers));
  }, [customers]);

  const fetchCustomers = useCallback(
    async (searchTerm, noDebounce = false) => {
      if (!noDebounce) setLoading(true);
      try {
        // Add timestamp to bypass browser cache on backend call
        const res = await api.get(
          `/customers?search=${encodeURIComponent(searchTerm)}&t=${Date.now()}`
        );
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setCustomers([]);
      } finally {
        if (!noDebounce) setLoading(false);
      }
    },
    []
  );

  // Only fetch from backend if no cached data yet or when search changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // If no cached data or search is not empty, fetch fresh
      if (!customers.length || search.trim() !== "") {
        fetchCustomers(search);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [search, fetchCustomers, customers.length]);

  const handleDelete = async (customer) => {
    try {
      setLoading(true);
      await api.delete(`/customers/${customer.id}`);
      setDeleteModal({ opened: false, customer: null });
      // Refresh data after delete and update cache
      fetchCustomers(search, true);
    } catch (err) {
      console.error("Error deleting customer:", err);
    } finally {
      setLoading(false);
    }
  };

  const skeletonRows = 6;

  // Animation variants for rows
  const rowVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  return (
    <div style={{ padding: "1rem" }}>
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
        }}
      >
        <ScrollArea
          scrollbars="x"
          style={{
            background: "white",
            minHeight: "70vh",
            marginBottom: ".5rem",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Table highlightOnHover>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Customer Name</th>
                  <th style={{ textAlign: "center" }}>Address</th>
                  <th style={{ textAlign: "center" }}>Contact Number</th>
                  <th style={{ textAlign: "center" }}>Social Media Account</th>
                  <th style={{ textAlign: "center" }}>Date Created</th>
                  <th style={{ textAlign: "center" }}>Manage</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: skeletonRows }).map((_, idx) => (
                  <tr
                    key={idx}
                    style={{ height: 50, padding: "0.5rem 0" }} // add height and padding to space out rows
                  >
                    <td>
                      <Skeleton height={20} width="80%" />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Skeleton height={20} width="70%" />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Skeleton height={20} width="50%" />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Skeleton height={20} width="90%" />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Skeleton height={20} width="60%" />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Skeleton height={20} width="30px" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Table
              highlightOnHover
              styles={{
                tr: { borderBottom: "1px solid #D8CBB8" },
              }}
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Customer Name</th>
                  <th style={{ textAlign: "center" }}>Address</th>
                  <th style={{ textAlign: "center" }}>Contact Number</th>
                  <th style={{ textAlign: "center" }}>Social Media Account</th>
                  <th style={{ textAlign: "center" }}>Date Created</th>
                  <th style={{ textAlign: "center" }}>Manage</th>
                </tr>
              </thead>

              <tbody>
                <AnimatePresence>
                  {customers.length === 0 ? (
                    <motion.tr
                      key="no-data"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                        <Text c="dimmed">No customers found</Text>
                      </td>
                    </motion.tr>
                  ) : (
                    customers.map((c) => (
                      <motion.tr
                        key={c.id}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <td style={{ textAlign: "left" }}>
                          {`${c.first_name} ${c.last_name}`}
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                            maxWidth: "250px",
                          }}
                        >
                          {c.address || "—"}
                        </td>
                        <td style={{ textAlign: "center" }}>{c.contact_number}</td>
                        <td
                          style={{
                            textAlign: "center",
                            maxWidth: "200px",
                            wordBreak: "break-word",
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
                              }}
                              title={c.social_handle}
                            >
                              {c.social_handle}
                            </Anchor>
                          ) : (
                            <span>-</span>
                          )}
                        </td>

                        <td style={{ textAlign: "center" }}>
                          {c.created_at
                            ? new Date(c.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"}
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <Group gap={4} justify="center">
                            <Button
                              size="xs"
                              variant="subtle"
                              color="red"
                              p={3}
                              aria-label={`Delete customer ${c.first_name} ${c.last_name}`}
                              onClick={() => setDeleteModal({ opened: true, customer: c })}
                            >
                              <Icons.Trash size={24} />
                            </Button>
                          </Group>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </Table>
          )}
        </ScrollArea>
      </Paper>

      {/* Delete Modal */}
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
    </div>
  );
}

export default CustomerLogs;
