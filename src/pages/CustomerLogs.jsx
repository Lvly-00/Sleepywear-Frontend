import React, { useState, useEffect } from "react";
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
} from "@mantine/core";
import PageHeader from "../components/PageHeader";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import NotifySuccess from "../components/notifysuccess";

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
  const location = useLocation();
  const preloadedCustomers = location.state?.preloadedCustomers || null;

  const [customers, setCustomers] = useState(preloadedCustomers || []);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState({ opened: false, customer: null });
  const [loading, setLoading] = useState(!preloadedCustomers);

  // Fetch customers if not preloaded
  useEffect(() => {
    if (!preloadedCustomers) {
      const fetchCustomers = async () => {
        setLoading(true);
        try {
          const res = await api.get("/customers");
          setCustomers(res.data);
        } catch (err) {
          console.error("Error fetching customers:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchCustomers();
    }
  }, [preloadedCustomers]);

  // Delete a customer with skeleton reload effect and notification
  const handleDelete = async (customer) => {
    try {
      setLoading(true);
      await api.delete(`/customers/${customer.id}`);
      const res = await api.get("/customers");
      setCustomers(res.data);
      
      // Show deleted notification here
      NotifySuccess.deleted();
    } catch (err) {
      console.error("Error deleting customer:", err);
    } finally {
      setLoading(false);
      setDeleteModal({ opened: false, customer: null });
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  // Skeleton placeholder rows
  const SkeletonRows = () => (
    <Table.Tbody>
      {Array.from({ length: 6 }).map((_, i) => (
        <Table.Tr key={i}>
          <Table.Td>
            <Skeleton height={18} width="70%" />
          </Table.Td>
          <Table.Td style={{ textAlign: "center" }}>
            <Skeleton height={18} width="60%" />
          </Table.Td>
          <Table.Td style={{ textAlign: "center" }}>
            <Skeleton height={18} width="40%" />
          </Table.Td>
          <Table.Td style={{ textAlign: "center" }}>
            <Skeleton height={18} width="50%" />
          </Table.Td>
          <Table.Td style={{ textAlign: "center" }}>
            <Skeleton height={18} width="30%" />
          </Table.Td>
          <Table.Td style={{ textAlign: "center" }}>
            <Skeleton height={18} width="20%" />
          </Table.Td>
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
        setSearch={setSearch}
        rightSection={
          <Button size="xs" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        }
      />

      <Paper
        radius="md"
        p="xl"
        style={{
          minHeight: "70vh",
          background: "white",
          overflow: "hidden",
        }}
      >
        <ScrollArea>
          {loading ? (
            <Table
              highlightOnHover
              styles={{
                tr: { borderBottom: "1px solid #D8CBB8", fontSize: "18px" },
              }}
            >
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
              <SkeletonRows />
            </Table>
          ) : filteredCustomers.length === 0 ? (
            <Center py="lg">
              <Text c="dimmed" size="lg">
                No customers found.
              </Text>
            </Center>
          ) : (
            <Table
              highlightOnHover
              styles={{
                tr: { borderBottom: "1px solid #D8CBB8", fontSize: "18px" },
                th: {
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: "20px",
                },
                td: {
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: "16px",
                },
              }}
            >
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
                  {filteredCustomers.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      style={{
                        borderBottom: "1px solid #D8CBB8",
                        cursor: "default",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8f9fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <Table.Td>{`${c.first_name} ${c.last_name}`}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {c.address || "—"}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {c.contact_number}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
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
                        ) : (
                          "-"
                        )}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        <Group gap={4} justify="center">
                          <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            p={3}
                            onClick={() =>
                              setDeleteModal({ opened: true, customer: c })
                            }
                          >
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
    </Stack>
  );
}
