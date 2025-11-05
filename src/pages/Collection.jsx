import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Group,
  Text,
  Badge,
  Paper,
  ScrollArea,
} from "@mantine/core";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../components/PageHeader";
import AddCollectionModal from "../components/AddCollectionModal";
import EditCollectionModal from "../components/EditCollectionModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";
import api from "../api/axios";

export default function Collection() {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Fetch with caching
  const fetchCollections = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const cachedData = localStorage.getItem("collections_cache");
      const cacheTimestamp = localStorage.getItem("collections_cache_time");
      const cacheTTL = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();

      if (cachedData && cacheTimestamp && now - cacheTimestamp < cacheTTL) {
        const parsed = JSON.parse(cachedData);
        setCollections(parsed);
        if (showLoader) setLoading(false);
        return;
      }

      const res = await api.get("/collections");
      const sorted = sortCollections(res.data);

      setCollections(sorted);
      localStorage.setItem("collections_cache", JSON.stringify(sorted));
      localStorage.setItem("collections_cache_time", now.toString());
    } catch (err) {
      console.error("Error fetching collections:", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const sortCollections = (data) =>
    data.sort((a, b) => {
      if (a.status === "Active" && b.status !== "Active") return -1;
      if (a.status !== "Active" && b.status === "Active") return 1;
      return 0;
    });

  useEffect(() => {
    fetchCollections(true);
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredCollections(collections);
    } else {
      const lower = search.toLowerCase();
      setFilteredCollections(
        collections.filter((col) =>
          col?.name?.toLowerCase().includes(lower)
        )
      );
    }
  }, [search, collections]);

  // Delete handler
  const handleDelete = async () => {
    if (!collectionToDelete) return;
    try {
      await api.delete(`/collections/${collectionToDelete.id}`);
      setCollections((prev) =>
        prev.filter((c) => c.id !== collectionToDelete.id)
      );
      setDeleteModalOpen(false);
      setCollectionToDelete(null);

      // Clear cache and revalidate
      localStorage.removeItem("collections_cache");
      localStorage.removeItem("collections_cache_time");
      fetchCollections(false);
    } catch (err) {
      console.error("Error deleting collection:", err);
    }
  };

  // Optimistic Add
  const handleAddSuccess = async (newCollection) => {
    setAddModalOpen(false);

    // Show instantly
    setCollections((prev) => [newCollection, ...prev]);

    // Clear cache and revalidate silently
    localStorage.removeItem("collections_cache");
    localStorage.removeItem("collections_cache_time");
    fetchCollections(false);
  };

  // Update after edit
  const handleEditSuccess = async (updatedCollection) => {
    setOpenedEdit(false);
    setSelectedCollection(null);

    // Optimistically update
    setCollections((prev) =>
      prev.map((c) => (c.id === updatedCollection.id ? updatedCollection : c))
    );

    // Refresh cache
    localStorage.removeItem("collections_cache");
    localStorage.removeItem("collections_cache_time");
    fetchCollections(false);
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
        style={{ minHeight: "70vh", marginBottom: "1rem" }}
      >
        <ScrollArea scrollbarSize={8}>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Collection Name</Table.Th>
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
              {loading ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    <Text c="dimmed">Loading...</Text>
                  </Table.Td>
                </Table.Tr>
              ) : filteredCollections.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={8}
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    <Text c="dimmed">No collections found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                <AnimatePresence>
                  {filteredCollections.map((col) => (
                    <motion.tr
                      key={col.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      onClick={() =>
                        navigate(`/collections/${col.id}/items`)
                      }
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8f9fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <Table.Td>{col.name || "—"}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {col.release_date
                          ? new Date(col.release_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "—"}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {col.qty ?? 0}
                      </Table.Td>

                      <Table.Td style={{ textAlign: "center" }}>
                        {col.items
                          ? col.items.filter(
                              (item) => item.status === "Available"
                            ).length
                          : 0}
                      </Table.Td>

                      <Table.Td style={{ textAlign: "center" }}>
                        ₱
                        {col.capital
                          ? new Intl.NumberFormat("en-PH").format(
                              Math.floor(col.capital)
                            )
                          : "0"}
                      </Table.Td>

                      <Table.Td style={{ textAlign: "center" }}>
                        ₱
                        {col.total_sales
                          ? new Intl.NumberFormat("en-PH").format(
                              Math.floor(col.total_sales)
                            )
                          : "0"}
                      </Table.Td>

                      <Table.Td style={{ textAlign: "center" }}>
                        <Badge
                          size="md"
                          variant="filled"
                          style={{
                            backgroundColor:
                              col.status === "Active"
                                ? "#A5BDAE"
                                : "#D9D9D9",
                            color:
                              col.status === "Active" ? "#FFFFFF" : "#7A7A7A",
                            width: "100px",
                            padding: "13px",
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
                    </motion.tr>
                  ))}
                </AnimatePresence>
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

      {/* Add Modal */}
      <AddCollectionModal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Modal */}
      {selectedCollection && (
        <EditCollectionModal
          opened={openedEdit}
          onClose={() => setOpenedEdit(false)}
          collection={selectedCollection}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
