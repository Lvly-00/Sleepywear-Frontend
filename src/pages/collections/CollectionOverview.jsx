import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import {
  Table,
  Button,
  Group,
  Modal,
  Text,
  Anchor,
  Badge,
  TextInput,
} from "@mantine/core";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";

export default function CollectionOverview() {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true); // start loader
      try {
        const res = await api.get("api/collections");
        // Sort so Active comes first, then Sold Out
        const sorted = res.data.sort((a, b) => {
          if (a.status === "Active" && b.status !== "Active") return -1;
          if (a.status !== "Active" && b.status === "Active") return 1;
          return 0;
        });
        setCollections(sorted);
        setFilteredCollections(sorted);
      } catch (err) {
        console.error("Error fetching collections:", err);
      } finally {
        setLoading(false); // stop loader
      }
    };
    fetchCollections();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredCollections(collections);
    } else {
      const lower = search.toLowerCase();
      setFilteredCollections(
        collections.filter((col) => col.name.toLowerCase().includes(lower))
      );
    }
  }, [search, collections]);

  const handleDelete = async () => {
    await api.delete(`api/collections/${deleteId}`);
    const updated = collections.filter((c) => c.id !== deleteId);
    setCollections(updated);
    setFilteredCollections(updated);
    setOpened(false);
  };

  // Helper: Return badge for status
  const getStatusBadge = (status) => {
    if (status === "Active") {
      return <Badge color="green">Active</Badge>;
    } else if (status === "Sold Out") {
      return <Badge color="red">Sold Out</Badge>;
    }
    return <Badge color="gray">{status}</Badge>;
  };

  if (loading) return <SleepyLoader />;
  return (
    <>
      <PageHeader
        title="Collections"
        showSearch
        search={search}
        setSearch={setSearch}
        addLabel="Add Collection"
        addLink="/collections/new"
      />

      {/* Collections Table */}
      <Table striped highlightOnHover withBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Release Date</Table.Th>
            <Table.Th>QTY</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Total Sales</Table.Th>
            <Table.Th>Stock QTY</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredCollections.map((col) => (
            <Table.Tr key={col.id}>
              <Table.Td>{col.id}</Table.Td>

              {/* ✅ Clicking Name redirects to Inventory */}
              <Table.Td>
                <Anchor
                  component="button"
                  onClick={() => navigate(`/collections/${col.id}/items`)}
                >
                  {col.name}
                </Anchor>
              </Table.Td>

              <Table.Td>{col.release_date}</Table.Td>
              <Table.Td>{col.qty}</Table.Td>

              {/* ✅ Status Badge */}
              <Table.Td>{getStatusBadge(col.status)}</Table.Td>

              <Table.Td>{col.total_sales}</Table.Td>
              <Table.Td>{col.stock_qty}</Table.Td>

              {/* Actions */}
              <Table.Td>
                <Group>
                  <Button
                    size="xs"
                    component={Link}
                    to={`/collections/${col.id}/edit`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    onClick={() => {
                      setDeleteId(col.id);
                      setOpened(true);
                    }}
                  >
                    Delete
                  </Button>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Delete Modal */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Delete Collection"
      >
        <Text>Are you sure you want to delete this collection?</Text>
        <Group mt="md">
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setOpened(false)}>
            Cancel
          </Button>
        </Group>
      </Modal>
    </>
  );
}
