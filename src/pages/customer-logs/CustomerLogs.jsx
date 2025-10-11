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
} from "@mantine/core";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";
import { openDeleteConfirmModal } from "../../components/DeleteConfirmModal";

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

      <Table striped highlightOnHover withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Contact Number</Table.Th>
            <Table.Th>Social Handle</Table.Th>
            <Table.Th>Address</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {customers.map((c) => (
            <Table.Tr key={c.id}>
              <Table.Td>{`${c.first_name} ${c.last_name}`}</Table.Td>
              <Table.Td>{c.contact_number}</Table.Td>
              <Table.Td>
                {c.social_handle && /^https?:\/\//.test(c.social_handle) ? (
                  <Anchor
                    href={c.social_handle}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    {c.social_handle}
                  </Anchor>
                ) : (
                  <span>-</span>
                )}
              </Table.Td>
              <Table.Td>{c.address}</Table.Td>
              <Table.Td>{new Date(c.created_at).toLocaleDateString()}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button
                    size="xs"
                    onClick={() => {
                      setSelected(c);
                      setOpened(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    onClick={() => handleDelete(c)}
                  >
                    Delete
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

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
    </div>
  );
}

export default CustomerLogs;
