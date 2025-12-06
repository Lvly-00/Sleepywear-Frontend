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

  const searchParams = new URLSearchParams(location.search);
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const searchFromUrl = searchParams.get("search") || "";

  const preloadedCollections = location.state?.preloadedCollections || [];

  const [search, setSearch] = useState(searchFromUrl);
  const [collections, setCollections] = useState(
    Array.isArray(preloadedCollections) ? preloadedCollections : []
  );
  const [page, setPage] = useState(pageFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(!preloadedCollections.length);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState(null);

  const cacheRef = useRef({});



  const sortCollections = (list) => {
    const sorted = [...list].sort((a, b) => {
      const order = { Active: 0, "Sold Out": 1 };
      return order[a.status] - order[b.status];
    });
    return sorted;
  };

  const fetchCollections = useCallback(
    async (targetPage, searchTerm, useLoading = true) => {
      const key = searchTerm.trim().toLowerCase();

      // Check cache first
      if (cacheRef.current[key]?.[targetPage]) {
        setCollections(cacheRef.current[key][targetPage].data);
        setTotalPages(cacheRef.current[key][targetPage].last_page);
        setLoading(false);
        return;
      }

      if (useLoading) setLoading(true);

      try {
        const res = await api.get("/collections", {
          params: {
            page: targetPage,
            per_page: 10,
            search: searchTerm || undefined,
          },
        });

        const data = Array.isArray(res.data?.data)
          ? sortCollections(res.data.data)
          : [];

        const lastPage = res.data?.last_page || 1;

        // Store in cache
        if (!cacheRef.current[key]) cacheRef.current[key] = {};
        cacheRef.current[key][targetPage] = {
          data,
          last_page: lastPage,
        };

        setCollections(data);
        setTotalPages(lastPage);
      } catch (err) {
        console.error("Fetch error:", err);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initialize load or use preloaded
  useEffect(() => {
    const trimmed = search.trim().toLowerCase();

    // Save preloaded to cache
    if (preloadedCollections.length > 0) {
      if (!cacheRef.current[trimmed]) cacheRef.current[trimmed] = {};

      cacheRef.current[trimmed][pageFromUrl] = {
        data: sortCollections(preloadedCollections),
        last_page: totalPages,
      };

      setCollections(sortCollections(preloadedCollections));
      setLoading(false);
      return;
    }

    // Otherwise fetch
    fetchCollections(pageFromUrl, trimmed, true);
  }, []);

  const handlePageChange = (newPage) => {
    setPage(newPage);

    const params = new URLSearchParams(location.search);
    params.set("page", newPage);
    if (search.trim()) params.set("search", search.trim());
    else params.delete("search");

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });

    fetchCollections(newPage, search.trim(), true);
  };

  const performSearch = () => {
    const trimmed = search.trim();
    const key = trimmed.toLowerCase();

    setPage(1);

    const params = new URLSearchParams(location.search);
    params.set("page", 1);
    if (trimmed) params.set("search", trimmed);
    else params.delete("search");

    navigate(`${location.pathname}?${params.toString()}`, { replace: true });

    // Load from cache if available
    if (cacheRef.current[key]?.[1]) {
      setCollections(cacheRef.current[key][1].data);
      setTotalPages(cacheRef.current[key][1].last_page);
      setLoading(false);
      return;
    }

    fetchCollections(1, trimmed, true);
  };

  const handleDelete = async () => {
    if (!collectionToDelete) return;
    try {
      await api.delete(`/collections/${collectionToDelete.id}`);
      NotifySuccess.deleted();
      setDeleteModalOpen(false);

      // Clear cache so data refreshes
      cacheRef.current = {};

      fetchCollections(page, search.trim(), true);
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleAddSuccess = () => {
    setAddModalOpen(false);
    NotifySuccess.addedCollection();

    cacheRef.current = {}; // reset cache
    performSearch();
  };

  const handleEditSuccess = () => {
    setOpenedEdit(false);
    NotifySuccess.editedCollection();

    cacheRef.current = {}; // reset cache
    fetchCollections(page, search.trim(), true);
  };

  const skeletonRowCount = Math.max(collections.length, MIN_SKELETON_ROWS);
  const renderSkeletonRows = (rows) =>
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

  return (
    <Stack p="xs" spacing="lg">
      <PageHeader
        title="Inventory"
        showSearch
        search={search}
        setSearch={setSearch}
        onSearchEnter={performSearch}
        addLabel="Add Collection"
        onAdd={() => setAddModalOpen(true)}
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
        }}
      >
        <ScrollArea scrollbarSize={8} style={{ flex: 1 }}>
          <Table
            highlightOnHover
            styles={{
              tr: { borderBottom: "1px solid #D8CBB8", fontSize: "20px" },
              th: { fontFamily: "'League Spartan', sans-serif", fontSize: "20px" },
              td: { fontFamily: "'League Spartan', sans-serif", fontSize: "16px" },
            }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Collection Name</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Release Date</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>QTY</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Stock QTY</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Capital</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Revenue</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Status</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Manage</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody key={page}>
              {loading
                ? renderSkeletonRows(skeletonRowCount)
                : collections.length > 0
                  ? collections.map((col) => (
                    <Table.Tr
                      key={col.id}
                      onClick={() => navigate(`/collections/${col.id}/items`)}
                      style={{
                        cursor: "pointer",
                        borderBottom: "1px solid #D8CBB8",
                      }}
                    >
                      <Table.Td>{col.name || "—"}</Table.Td>

                      <Table.Td style={{ textAlign: "center" }}>
                        {col.release_date
                          ? new Date(col.release_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                          : "—"}
                      </Table.Td>

                      <Table.Td style={{ textAlign: "center" }}>
                        {col.qty ?? 0}
                      </Table.Td>

                      <Table.Td style={{ textAlign: "center" }}>
                        {Array.isArray(col.items)
                          ? col.items.filter((item) => item.status === "Available").length
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
                          size="28"
                          variant="filled"
                          style={{
                            backgroundColor:
                              col.status === "Active" ? "#A5BDAE" : "#D9D9D9",
                            color: col.status === "Active" ? "#FFFFFF" : "#7A7A7A",
                            width: "130px",
                            fontWeight: 400,
                            paddingTop: "5px",
                            borderRadius: "16px",
                            fontSize: "16px",
                          }}
                        >
                          {col.status
                            .toLowerCase()
                            .replace(/\b\w/g, (char) => char.toUpperCase())}
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
                            <Icons.Edit size={26} />
                          </Button>

                          <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            p={3}
                            onClick={() => {
                              setCollectionToDelete(col);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <Icons.Trash size={26} />
                          </Button>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                  : (
                    <Table.Tr style={{ borderBottom: "1px solid #D8CBB8" }}>
                      <Table.Td
                        colSpan={8}
                        style={{ textAlign: "center", padding: "1.5rem" }}
                      >
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
            onChange={handlePageChange}
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

      <AddCollectionModal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

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
