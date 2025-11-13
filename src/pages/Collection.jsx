import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Table,
  Button,
  Group,
  Text,
  Badge,
  Paper,
  ScrollArea,
  Stack,
  Skeleton,
  Pagination,
  Center,
} from "@mantine/core";
import { motion } from "framer-motion";

import NotifySuccess from "@/components/NotifySuccess";
import PageHeader from "../components/PageHeader";
import AddCollectionModal from "../components/AddCollectionModal";
import EditCollectionModal from "../components/EditCollectionModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";
import api from "../api/axios";

const MIN_SKELETON_ROWS = 6;

export default function Collection() {
  const navigate = useNavigate();
  const location = useLocation();
  const preloadedCollections = location.state?.preloadedCollections || [];

  const [collections, setCollections] = useState(Array.isArray(preloadedCollections) ? preloadedCollections : []);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(!preloadedCollections || preloadedCollections.length === 0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [openedEdit, setOpenedEdit] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const hasFetchedRef = useRef(false);

  // ✅ Fetch collections from API with pagination + backend search
  const fetchCollections = useCallback(
    async (targetPage = 1, showLoader = false) => {
      if (showLoader) setLoading(true);
      try {
        const res = await api.get("/collections", {
          params: {
            page: targetPage,
            per_page: 10,
            search: search.trim() || undefined, // 👈 include search term if exists
          },
        });

        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setCollections(data);
        setTotalPages(res.data?.last_page || 1);
        setPage(res.data?.current_page || 1);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setCollections([]);
      } finally {
        setLoading(false);
        hasFetchedRef.current = true;
      }
    },
    [search]
  );

  // Initial and paginated fetch
  useEffect(() => {
    fetchCollections(page, true);
  }, [page, fetchCollections]);

  ///  Trigger search only when Enter is pressed
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      setPage(1);
      fetchCollections(1, true);
    }
  };


  // Delete collection
  const handleDelete = async () => {
    if (!collectionToDelete) return;
    try {
      await api.delete(`/collections/${collectionToDelete.id}`);
      setDeleteModalOpen(false);
      setCollectionToDelete(null);
      NotifySuccess.deleted();
      fetchCollections(page, true);
    } catch (err) {
      console.error("Error deleting collection:", err);
    }
  };

  // Add success
  const handleAddSuccess = async () => {
    setAddModalOpen(false);
    NotifySuccess.addedCollection();
    setPage(1);
    fetchCollections(1, true);
  };

  // Edit success
  const handleEditSuccess = async () => {
    setOpenedEdit(false);
    setSelectedCollection(null);
    NotifySuccess.editedCollection();
    fetchCollections(page, true);
  };

  const skeletonRowCount = Math.max(collections.length, MIN_SKELETON_ROWS);
  const renderSkeletonRows = (rows = 5) =>
    Array.from({ length: rows }).map((_, i) => (
      <Table.Tr key={i} style={{ borderBottom: "1px solid #D8CBB8" }}>
        {Array(8)
          .fill()
          .map((_, j) => (
            <Table.Td key={j} style={{ textAlign: "center" }}>
              <Skeleton height={20} width={`${50 + j * 5}%`} />
            </Table.Td>
          ))}
      </Table.Tr>
    ));

  useEffect(() => {
    if (location.state?.openAddModal) {
      setAddModalOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <Stack p="xs" spacing="lg">
      <PageHeader
        title="Inventory"
        showSearch
        search={search}
        setSearch={setSearch}
        onSearchEnter={() => {
          setPage(1);
          fetchCollections(1, true);
        }}
        addLabel="Add Collection"
        onAdd={() => setAddModal(true)}
      />


      <Paper
        radius="md"
        p="xl"
        style={{
          minHeight: "70vh",
          marginBottom: "1rem",
          background: "white",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'League Spartan', sans-serif",
        }}
      >
        <ScrollArea scrollbarSize={8} style={{ flex: 1, minHeight: "0" }}>
          <Table
            highlightOnHover
            styles={{
              tr: { borderBottom: "1px solid #D8CBB8", fontSize: "20px" },
              th: { fontFamily: "'League Spartan', sans-serif", fontSize: "20px" },
              td: { fontFamily: "'League Spartan', sans-serif" },
            }}
          >
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

            <Table.Tbody key={page}>
              {loading
                ? renderSkeletonRows(skeletonRowCount)
                : Array.isArray(collections) && collections.length > 0
                  ? collections.map((col, i) => (
                    <motion.tr
                      key={col.id}
                      initial={{ opacity: 0, y: -25 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 25 }}
                      transition={{ delay: i * 0.07, duration: 0.35, ease: "easeOut" }}
                      layout
                      onClick={() => navigate(`/collections/${col.id}/items`)}
                      style={{ cursor: "pointer", borderBottom: "1px solid #D8CBB8" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <Table.Td style={{ textAlign: "left", fontSize: "16px" }}>
                        {col.name || "—"}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                        {col.release_date
                          ? new Date(col.release_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "—"}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                        {col.qty ?? 0}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                        {Array.isArray(col.items)
                          ? col.items.filter((item) => item.status === "Available").length
                          : 0}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                        ₱
                        {col.capital
                          ? new Intl.NumberFormat("en-PH").format(Math.floor(col.capital))
                          : "0"}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                        ₱
                        {col.total_sales
                          ? new Intl.NumberFormat("en-PH").format(Math.floor(col.total_sales))
                          : "0"}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                        <Badge
                          size="27"
                          variant="filled"
                          style={{
                            backgroundColor: col.status === "Active" ? "#A5BDAE" : "#D9D9D9",
                            color: col.status === "Active" ? "#FFFFFF" : "#7A7A7A",
                            width: "130px",
                            fontWeight: 400,
                            paddingTop: "5px",
                            borderRadius: "16px",
                            fontSize: "16px",
                          }}
                        >
                          {col.status === "Active" ? "Active" : "Sold Out"}
                        </Badge>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
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
                            <Icons.Edit size={26} />
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
                            <Icons.Trash size={26} />
                          </Button>
                        </Group>
                      </Table.Td>
                    </motion.tr>
                  ))
                  : (
                    <Table.Tr style={{ borderBottom: "1px solid #D8CBB8" }}>
                      <Table.Td colSpan={8} style={{ textAlign: "center", padding: "1.5rem" }}>
                        <Text c="dimmed" size="20px">
                          No collections found
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Center mt="md" style={{ marginTop: "auto" }}>
          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
            color="#0A0B32"
            size="md"
            radius="md"
          />
        </Center>
      </Paper>

      <DeleteConfirmModal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        name={collectionToDelete?.name || ""}
        onConfirm={handleDelete}
      />

      <AddCollectionModal opened={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={handleAddSuccess} />

      {selectedCollection && (
        <EditCollectionModal
          opened={openedEdit}
          onClose={() => setOpenedEdit(false)}
          collection={selectedCollection}
          onSuccess={handleEditSuccess}
        />
      )}
    </Stack>
  );
}
