import { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  Table,
  TextInput,
  Button,
  Modal,
  Group,
  Stack,
  Anchor,
  Paper,
  ScrollArea,
  Text,
} from "@mantine/core";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { Icons } from "../../components/Icons";

function CustomerLogs() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [opened, setOpened] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ opened: false, customer: null });
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await api.get(`/api/customers?search=${search}`);
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleSave = async () => {
    await api.put(`/api/customers/${selected.id}`, selected);
    setOpened(false);
    fetchCustomers();
  };

  const handleDelete = async (customer) => {
    try {
      await api.delete(`/api/customers/${customer.id}`);
      setDeleteModal({ opened: false, customer: null });
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  if (loading) return <SleepyLoader />;

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader
        title="Customers"
        showSearch
        search={search}
        setSearch={setSearch}
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
        <ScrollArea scrollbars="x"
          style={{
            background: "white",
            minHeight: "70vh",
            marginBottom: ".5rem",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
          }}>
          <Table
            highlightOnHover
            styles={{
              tr: { borderBottom: "1px solid #D8CBB8" },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ textAlign: "left" }}>Customer Name</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Address</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Contact Number</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Social Media Account</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Date Created</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Manage</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {customers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                    <Text c="dimmed">No customers found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                customers.map((c) => (
                  <Table.Tr key={c.id}>
                    <Table.Td style={{ textAlign: "left" }}>
                      {`${c.first_name} ${c.last_name}`}
                    </Table.Td>
                    <Table.Td
                      style={{
                        textAlign: "center",
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                        maxWidth: "250px",
                      }}
                    >
                      {c.address || "—"}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>{c.contact_number}</Table.Td>
                    <Table.Td
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
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center" }}>
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
                          onClick={() => setDeleteModal({ opened: true, customer: c })}
                        >
                          <Icons.Trash size={24} />
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>



      {/* Delete Modal */}
      <DeleteConfirmModal
        opened={deleteModal.opened}
        onClose={() => setDeleteModal({ opened: false, customer: null })}
        name={deleteModal.customer ? `${deleteModal.customer.first_name} ${deleteModal.customer.last_name}` : ""}
        onConfirm={() => handleDelete(deleteModal.customer)}
      />
    </div>
  );
}

export default CustomerLogs;
