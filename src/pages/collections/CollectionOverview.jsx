import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Table,
  Button,
  Group,
  Modal,
  Text,
  Badge,
  Paper,
  ScrollArea,
} from "@mantine/core";
import PageHeader from "../../components/PageHeader";
import AddCollectionModal from "../../components/AddCollectionModal";
import EditCollectionModal from "../../components/EditCollectionModal";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import { Icons } from "../../components/Icons";

export default function CollectionOverview() {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [openedNew, setOpenedNew] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [search, setSearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
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
        console.error("Error fetching collections:", err);
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


  const fetchCollections = async () => {
    try {
      const response = await api.get("/api/collections");
      setCollections(response.data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  // Example button
  <Button onClick={() => setAddModalOpen(true)}>Add Collection</Button>;


  const handleCollectionUpdated = (updatedCollection) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === updatedCollection.id ? updatedCollection : c))
    );
    setFilteredCollections((prev) =>
      prev.map((c) => (c.id === updatedCollection.id ? updatedCollection : c))
    );
  };

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    try {
      await api.delete(`api/collections/${collectionToDelete.id}`);
      const updated = collections.filter(
        (c) => c.id !== collectionToDelete.id
      );
      setCollections(updated);
      setFilteredCollections(updated);
      setDeleteModalOpen(false);
      setCollectionToDelete(null);
    } catch (err) {
      console.error("Error deleting collection:", err);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <PageHeader
        title="Collections"
        showSearch
        search={search}
        setSearch={setSearch}
        addLabel="New Collection"
        onAdd={() => setAddModalOpen(true)}
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
        <ScrollArea scrollbarSize={8}>
          <Table
            highlightOnHover
            withTableBorder={false}
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
                <Table.Th style={{ textAlign: "center" }}>Capital</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Revenue</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Status</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredCollections.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                    <Text c="dimmed">No collections found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                filteredCollections.map((col) => (
                  <Table.Tr
                    key={col.id}
                    onClick={() => navigate(`/collections/${col.id}/items`)}
                    style={{
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Table.Td>{col.name}</Table.Td>
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
                      {col.capital
                        ? new Intl.NumberFormat("en-PH", {
                          maximumFractionDigits: 0,
                        }).format(Math.floor(col.capital))
                        : "0"}
                    </Table.Td>
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
                          backgroundColor:
                            col.status === "Active" ? "#A5BDAE" : "#D9D9D9",
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
                    <Table.Td
                      style={{ textAlign: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Group gap={4} justify="center">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            setCollectionToDelete(col);
                            setDeleteModalOpen(true);
                          }}
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
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        name={collectionToDelete?.name || ""}
        onConfirm={handleDelete}
      />

      {/* Add New Collection Modal */}
      <AddCollectionModal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchCollections}
      />


      {/* Edit Collection Modal */}
      {selectedCollection && (
        <Modal
          opened={openedEdit}
          onClose={() => setOpenedEdit(false)}
          title="Edit Collection"
          size="sm"
          centered
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
