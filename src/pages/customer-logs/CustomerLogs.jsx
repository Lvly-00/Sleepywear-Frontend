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

} from "@mantine/core";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";
import { openDeleteConfirmModal } from "../../components/DeleteConfirmModal";
import { Icons } from "../../components/Icons";


function CustomerLogs() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [opened, setOpened] = useState(false);
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

  const handleDelete = (customer) => {
    openDeleteConfirmModal({
      title: "Delete Customer",
      name: `${customer.first_name} ${customer.last_name}`,
      onConfirm: async () => {
        try {
          await api.delete(`/api/customers/${customer.id}`);
          fetchCustomers();
        } catch (err) {
          console.error("Error deleting customer:", err);
        }
      },
    });
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
      <ScrollArea>

        <Paper radius="md" p="xl" style={{
          minHeight: "70vh",
          marginBottom: "1rem",
          boxSizing: "border-box",
          position: "relative"
        }}>
          <Table highlightOnHover
            styles={{
              tr: { borderBottom: "1px solid #D8CBB8" },
            }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ textAlign: "left" }}>Name</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Contact Number</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Social Handle</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Address</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Created</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {customers.map((c) => (
                <Table.Tr key={c.id}>
                  <Table.Td style={{ textAlign: "left" }}>{`${c.first_name} ${c.last_name}`}</Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>{c.contact_number}</Table.Td>
                  <Table.Td style={{ textAlign: "center", maxWidth: "200px", wordBreak: "break-word" }}>
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
                        }}
                        title={c.social_handle} // shows full link on hover
                      >
                        {c.social_handle}
                      </Anchor>
                    ) : (
                      <span>-</span>
                    )}
                  </Table.Td>

                  <Table.Td
                    style={{
                      textAlign: "left",
                      wordWrap: "break-word",
                      whiteSpace: "normal",
                      maxWidth: "250px",
                    }}
                  >
                    {c.address || "—"}
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
                    <Group gap="{4}" justify="center">
                      {/* <Button
                        size="xs"
                        onClick={() => {
                          setSelected(c);
                          setOpened(true);
                        }}
                      >
                        Edit
                      </Button> */}
                      <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        p={3}
                        onClick={() => handleDelete(c)}
                      >
                        <Icons.Trash size={24} />
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </ScrollArea>


      {/* Edit Modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title="Edit Customer">
        {selected && (
          <Stack>
            <TextInput
              label="First Name"
              value={selected.first_name}
              onChange={(e) =>
                setSelected({ ...selected, first_name: e.target.value })
              }
            />
            <TextInput
              label="Last Name"
              value={selected.last_name}
              onChange={(e) =>
                setSelected({ ...selected, last_name: e.target.value })
              }
            />
            <TextInput
              label="Contact Number"
              value={selected.contact_number}
              onChange={(e) =>
                setSelected({ ...selected, contact_number: e.target.value })
              }
            />
            <TextInput
              label="Social Handle"
              value={selected.social_handle || ""}
              onChange={(e) =>
                setSelected({ ...selected, social_handle: e.target.value })
              }
            />
            <TextInput
              label="Address"
              value={selected.address}
              onChange={(e) =>
                setSelected({ ...selected, address: e.target.value })
              }
            />
            <Group justify="flex-end" mt="md">
              <Button onClick={handleSave}>Save</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div >
  );
}

export default CustomerLogs;
