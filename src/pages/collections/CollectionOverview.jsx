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
} from "@mantine/core";
import CollectionBreadcrumbs from "../../components/CollectionBreadcrumbs";

export default function CollectionOverview() {
  const [collections, setCollections] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("api/collections").then((res) => {
      // Sort so Active comes first, then Sold Out
      const sorted = res.data.sort((a, b) => {
        if (a.status === "Active" && b.status !== "Active") return -1;
        if (a.status !== "Active" && b.status === "Active") return 1;
        return 0;
      });
      setCollections(sorted);
    });
  }, []);

  const handleDelete = async () => {
    await api.delete(`api/collections/${deleteId}`);
    setCollections(collections.filter((c) => c.id !== deleteId));
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

  return (
    <>
      {/* Breadcrumbs */}
      <CollectionBreadcrumbs
        items={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Collections" },
        ]}
      />

      {/* Header with add button */}
      <Group justify="space-between" mb="md">
        <h1>Collections</h1>
        <Button component={Link} to="/collections/new">
          + Add Collection
        </Button>
      </Group>

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
          {collections.map((col) => (
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
