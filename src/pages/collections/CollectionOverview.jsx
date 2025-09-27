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
  Paper,
  Center,
} from "@mantine/core";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";
import AddCollectionModal from "../../components/AddCollectionModal";
import { openDeleteConfirmModal } from "../../components/DeleteConfirmModal";

export default function CollectionOverview() {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [openedDelete, setOpenedDelete] = useState(false);
  const [openedNew, setOpenedNew] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch collections once (totals come from backend)
  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      try {
        const res = await api.get("api/collections");
        const sorted = res.data.sort((a, b) => {
          if (a.status === "Active" && b.status !== "Active") return -1;
          if (a.status !== "Active" && b.status === "Active") return 1;
          return 0;
        });
        setCollections(sorted);
        setFilteredCollections(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  // Search filter
  useEffect(() => {
    if (!search.trim()) setFilteredCollections(collections);
    else {
      const lower = search.toLowerCase();
      setFilteredCollections(
        collections.filter((col) => col.name.toLowerCase().includes(lower))
      );
    }
  }, [search, collections]);

  // Delete collection
  const handleDelete = async () => {
    try {
      await api.delete(`api/collections/${deleteId}`);
      const updated = collections.filter((c) => c.id !== deleteId);
      setCollections(updated);
      setFilteredCollections(updated);
      setOpenedDelete(false);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "Active") return <Badge color="green">Active</Badge>;
    if (status === "Sold Out") return <Badge color="red">Sold Out</Badge>;
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
        onAdd={() => setOpenedNew(true)}
      />

      <Paper withBorder shadow="sm" p="md" radius="md">
        {filteredCollections.length === 0 ? (
          <Center py="lg">
            <Text>No collections found.</Text>
          </Center>
        ) : (
          <Table striped highlightOnHover withColumnBorders>
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
                  <Table.Td>{getStatusBadge(col.status)}</Table.Td>
                  <Table.Td>
                    ₱
                    {col.total_sales
                      ? new Intl.NumberFormat("en-PH", {
                          maximumFractionDigits: 0,
                        }).format(Math.floor(col.total_sales))
                      : "0"}
                  </Table.Td>
                  <Table.Td>{col.stock_qty}</Table.Td>
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
                          openDeleteConfirmModal({
                            name: col.name,
                            onConfirm: async () => {
                              try {
                                await api.delete(`api/collections/${col.id}`);
                                const updated = collections.filter(
                                  (c) => c.id !== col.id
                                );
                                setCollections(updated);
                                setFilteredCollections(updated);
                              } catch (err) {
                                console.error(err);
                              }
                            },
                          });
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
        )}
      </Paper>

      {/* Delete Modal */}
      <Modal
        opened={openedDelete}
        onClose={() => setOpenedDelete(false)}
        title="Delete Collection"
      >
        <Text>Are you sure you want to delete this collection?</Text>
        <Group mt="md">
          <Button color="red" onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="outline" onClick={() => setOpenedDelete(false)}>
            Cancel
          </Button>
        </Group>
      </Modal>

      {/* Add Collection Modal */}
      <Modal
        opened={openedNew}
        onClose={() => setOpenedNew(false)}
        title="Add New Collection"
        size="sm"
      >
        <AddCollectionModal
          onClose={() => setOpenedNew(false)}
          onCollectionAdded={(newCollection) => {
            setCollections((prev) => {
              const updated = [newCollection, ...prev];
              setFilteredCollections(updated);
              return updated;
            });
            setOpenedNew(false);
          }}
        />
      </Modal>
    </>
  );
}
