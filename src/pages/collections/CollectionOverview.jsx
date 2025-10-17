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
  ScrollArea,
} from "@mantine/core";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";
import AddCollectionModal from "../../components/AddCollectionModal";
import EditCollectionModal from "../../components/EditCollectionModal";
import { openDeleteConfirmModal } from "../../components/DeleteConfirmModal";
import { Icons } from "../../components/Icons";


export default function CollectionOverview() {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [openedNew, setOpenedNew] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  // const [activePage, setActivePage] = useState(1);
  // const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      // setLoading(true);
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
        // setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  useEffect(() => {
    if (!search.trim()) setFilteredCollections(collections);
    else {
      const lower = search.toLowerCase();
      setFilteredCollections(
        collections.filter((col) => col.name.toLowerCase().includes(lower))
      );
    }
  }, [search, collections]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`api/collections/${id}`);
      const updated = collections.filter((c) => c.id !== id);
      setCollections(updated);
      setFilteredCollections(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCollectionUpdated = (updatedCollection) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === updatedCollection.id ? updatedCollection : c))
    );
    setFilteredCollections((prev) =>
      prev.map((c) => (c.id === updatedCollection.id ? updatedCollection : c))
    );
  };

  const getStatusBadge = (status) => {
    if (status === "Active") return <Badge color="green">Active</Badge>;
    if (status === "Sold Out") return <Badge color="red">Sold Out</Badge>;
    return <Badge color="gray">{status}</Badge>;
  };

  // Pagination
  // const startIndex = (activePage - 1) * itemsPerPage;
  // const filteredCollections = filteredCollections.slice(startIndex, startIndex + itemsPerPage);
  // const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);

  // if (loading) return <SleepyLoader />;
  // console.log(totalPages)

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader
        title="Collections"
        showSearch
        search={search}
        setSearch={setSearch}
        addLabel="New Collection"
        onAdd={() => setOpenedNew(true)}
      />
      <ScrollArea>

        <Paper radius="md" p="xl" style={{
          minHeight: "70vh",
          marginBottom: "1rem",
          boxSizing: "border-box",
          position: "relative"
        }}>
          {filteredCollections.length === 0 ? (
            <Center py="lg">
              <Text>No collections found.</Text>
            </Center>
          ) : (
            <Table
              highlightOnHover
              styles={{
                tr: { borderBottom: "1px solid #D8CBB8" },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th style={{ textAlign: "left" }}>Collection Name</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Release Date</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Qty</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Stock QTY</Table.Th>
                  {/* <Table.Th style={{ textAlign: "center" }}>Capital</Table.Th> */}
                  <Table.Th style={{ textAlign: "center" }}>Revenue</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Collection Status</Table.Th>
                  <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredCollections.map((col) => (
                  <Table.Tr key={col.id}>
                    <Table.Td >
                      <Anchor
                        component="button"
                        style={{ textAlign: "left" }}
                        onClick={() => navigate(`/collections/${col.id}/items`)}
                      >
                        {col.name}
                      </Anchor>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {col.release_date
                        ? new Date(col.release_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                        : "—"}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>{col.qty}</Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>{col.stock_qty}</Table.Td>

                    <Table.Td style={{ textAlign: "center" }}>
                      ₱
                      {col.total_sales
                        ? new Intl.NumberFormat("en-PH", {
                          maximumFractionDigits: 0,
                        }).format(Math.floor(col.total_sales))
                        : "0"}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge
                        size="md"
                        variant="filled"
                        style={{
                          backgroundColor: col.status === "Active" ? "#A5BDAE" : "#D9D9D9",
                          color: col.status === "Active" ? "#FFFFFF" : "#7A7A7A",
                          width: "100px",
                          padding: "13px",
                          textAlign: "center",
                          justifyContent: "center",
                          textTransform: "capitalize",
                          fontWeight: "600",
                          fontSize: "14px",
                          borderRadius: "13px",
                        }}
                      >
                        {col.status === "Active" ? "Active" : "Sold Out"}
                      </Badge>
                    </Table.Td>


                    <Table.Td style={{ textAlign: "center" }}>
                      <Group gap="{4}" justify="center">
                        <Button
                          size="xs"
                          color="#276D58"
                          variant="subtle"
                          p={3}
                          onClick={() => {
                            setSelectedCollection(col);
                            setOpenedEdit(true);
                          }}
                        >
                          <Icons.Edit size={24} />
                        </Button>
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          p={3}
                          onClick={() => {
                            openDeleteConfirmModal({
                              name: col.name,
                              onConfirm: async () => handleDelete(col.id),
                            });
                          }}
                        >
                          <Icons.Trash size={24} />
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

          )}

        </Paper>
      </ScrollArea>


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

      {/* Edit Collection Modal */}
      {selectedCollection && (
        <Modal
          opened={openedEdit}
          onClose={() => setOpenedEdit(false)}
          title="Edit Collection"
          size="sm"
        >
          <EditCollectionModal
            collection={selectedCollection}
            onCollectionUpdated={handleCollectionUpdated}
            onClose={() => setOpenedEdit(false)}
          />
        </Modal>
      )}
    </div>
  );
}
