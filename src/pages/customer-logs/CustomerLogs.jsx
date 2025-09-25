import { useState, useEffect } from "react";
import api from "../../api/axios";
import {
  Table,
  TextInput,
  Button,
  Modal,
  Group,
  Title,
  Stack,
} from "@mantine/core";

function CustomerLogs() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [opened, setOpened] = useState(false);

  // Fetch customers
  const fetchCustomers = async () => {
    const res = await api.get(`/api/customers?search=${search}`);
    setCustomers(res.data);
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  // Update customer info
  const handleSave = async () => {
    await api.put(`/api/customers/${selected.id}`, selected);
    setOpened(false);
    fetchCustomers();
  };

  // Delete customer
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      await api.delete(`/api/customers/${id}`);
      fetchCustomers();
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <Title order={2}>Customer Logs</Title>
      <TextInput
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mt="md"
        mb="md"
      />

      <Table highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact Number</th>
            <th>Social Handle</th>
            <th>Address</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td>{`${c.first_name} ${c.last_name}`}</td>
              <td>{c.contact_number}</td>
              <td>{c.social_handle || "-"}</td>
              <td>{c.address}</td>
              <td>{new Date(c.created_at).toLocaleDateString()}</td>
              <td>
                <Group spacing="xs">
                  <Button size="xs" onClick={() => { setSelected(c); setOpened(true); }}>
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    onClick={() => handleDelete(c.id)}
                  >
                    Delete
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Modal */}
      <Modal opened={opened} onClose={() => setOpened(false)} title="Edit Customer">
        {selected && (
          <Stack>
            <TextInput
              label="First Name"
              value={selected.first_name}
              onChange={(e) => setSelected({ ...selected, first_name: e.target.value })}
            />
            <TextInput
              label="Last Name"
              value={selected.last_name}
              onChange={(e) => setSelected({ ...selected, last_name: e.target.value })}
            />
            <TextInput
              label="Contact Number"
              value={selected.contact_number}
              onChange={(e) => setSelected({ ...selected, contact_number: e.target.value })}
            />
            <TextInput
              label="Social Handle"
              value={selected.social_handle || ""}
              onChange={(e) => setSelected({ ...selected, social_handle: e.target.value })}
            />
            <TextInput
              label="Address"
              value={selected.address}
              onChange={(e) => setSelected({ ...selected, address: e.target.value })}
            />

            <Group position="right" mt="md">
              <Button onClick={handleSave}>Save</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}

export default CustomerLogs;
