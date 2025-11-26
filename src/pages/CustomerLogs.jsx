import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";

import {
  Table,
  Button,
  Group,
  Anchor,
  Paper,
  ScrollArea,
  Text,
  Stack,
  Center,
  Skeleton,
  Pagination,
} from "@mantine/core";

import PageHeader from "../components/PageHeader";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { Icons } from "../components/Icons";
import NotifySuccess from "../components/NotifySuccess";

const MIN_SKELETON_ROWS = 6;
const CUSTOMERS_PER_PAGE = 10;

export default function CustomerLogs() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get("page") || "1", 10);
  const initialSearch = queryParams.get("search") || "";

  const preloadedCustomers = location.state?.preloadedCustomers || null;

  // Prevent refetch on first render if preloaded data exists
  const firstLoad = useRef(true);

  //-----------------------------
  // STATE
  //-----------------------------
  const [customersCache, setCustomersCache] = useState(
    preloadedCustomers ? { [initialPage]: preloadedCustomers } : {}
  );

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(!preloadedCustomers);

  const [deleteModal, setDeleteModal] = useState({
    opened: false,
    customer: null,
  });

  //-----------------------------
  // SYNC URL PARAMS
  //-----------------------------
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage);
    if (search.trim() !== "") params.set("search", search.trim());

    navigate({ pathname: location.pathname, search: params.toString() }, { replace: true });
  }, [currentPage, search]);

  //-----------------------------
  // FETCH CUSTOMERS
  //-----------------------------
  const fetchCustomersPage = useCallback(
    async (page, searchTerm = search, showLoader = true) => {
      if (showLoader) setLoading(true);

      try {
        const res = await api.get("/customers", {
          params: {
            page,
            per_page: CUSTOMERS_PER_PAGE,
            search: searchTerm.trim() || undefined,
          },
        });

        setCustomersCache((prev) => ({
          ...prev,
          [page]: Array.isArray(res.data.data) ? res.data.data : [],
        }));

        setTotalPages(res.data.last_page || 1);
      } catch (err) {
        console.error("Error fetching customers:", err);
        setCustomersCache((prev) => ({
          ...prev,
          [page]: [],
        }));
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [search]
  );

  //-----------------------------
  // FETCH ON FIRST LOAD OR CHANGE
  //-----------------------------
  useEffect(() => {
    // 🛑 Skip fetching if first load AND preloaded data exists
    if (preloadedCustomers && firstLoad.current) {
      firstLoad.current = false;
      return;
    }

    // If we already have cache for the page ➜ don't show skeleton
    const cached = customersCache[currentPage];
    fetchCustomersPage(currentPage, search, !cached);
  }, [currentPage, search]);

  //-----------------------------
  // SEARCH
  //-----------------------------
  const handleSearchEnter = () => {
    const trimmed = searchValue.trim();
    setSearch(trimmed);
    setCurrentPage(1);
    fetchCustomersPage(1, trimmed);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") handleSearchEnter();
  };

  //-----------------------------
  // DELETE CUSTOMER
  //-----------------------------
  const handleDelete = async () => {
    if (!deleteModal.customer) return;

    try {
      setLoading(true);
      await api.delete(`/customers/${deleteModal.customer.id}`);

      // Remove item from ALL cached pages
      setCustomersCache((prev) => {
        const updated = { ...prev };
        for (const page in updated) {
          updated[page] = updated[page].filter(
            (c) => c.id !== deleteModal.customer.id
          );
        }
        return updated;
      });

      setDeleteModal({ opened: false, customer: null });

      // Reload current page from API
      await fetchCustomersPage(currentPage, search);

      NotifySuccess.deleted();
    } catch (err) {
      console.error("Failed to delete customer:", err);
    } finally {
      setLoading(false);
    }
  };

  //-----------------------------
  // SKELETON
  //-----------------------------
  const currentCustomers = customersCache[currentPage] || [];
  const skeletonRowCount = Math.max(currentCustomers.length, MIN_SKELETON_ROWS);

  const renderSkeletonRows = () =>
    Array.from({ length: skeletonRowCount }).map((_, i) => (
      <Table.Tr key={i}>
        <Table.Td><Skeleton height={20} width="70%" /></Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Skeleton height={20} width="60%" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Skeleton height={20} width="40%" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Skeleton height={20} width="50%" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Skeleton height={20} width="30%" />
        </Table.Td>
        <Table.Td style={{ textAlign: "center" }}>
          <Skeleton height={20} width="20%" />
        </Table.Td>
      </Table.Tr>
    ));

  //-----------------------------
  // RENDER
  //-----------------------------
  return (
    <Stack p="xs" spacing="lg" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      <PageHeader
        title="Customers"
        showSearch
        search={searchValue}
        setSearch={setSearchValue}
        onSearchEnter={handleSearchEnter}
      />

      <Paper
        radius="md"
        p="xl"
        style={{
          minHeight: "70vh",
          marginBottom: "1rem",
          background: "white",
          display: "flex",
          flexDirection: "column",
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
                <Table.Th>Customer Name</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Address</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Contact Number</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Social Media Account</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Date Created</Table.Th>
                <Table.Th style={{ textAlign: "center" }}>Manage</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {loading ? (
                renderSkeletonRows()
              ) : currentCustomers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6} style={{ textAlign: "center", padding: "1.5rem" }}>
                    <Text c="dimmed" size="20px">
                      No customers found
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                currentCustomers.map((c) => (
                  <Table.Tr
                    key={c.id}
                    style={{ borderBottom: "1px solid #D8CBB8" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <Table.Td style={{ fontSize: "16px" }}>
                      {c.first_name} {c.last_name}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                      {c.address || "—"}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                      {c.contact_number}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                      {c.social_handle && /^https?:\/\//.test(c.social_handle) ? (
                        <Anchor
                          href={c.social_handle}
                          target="_blank"
                          underline="hover"
                          style={{ color: "#4455f0" }}
                        >
                          {c.social_handle}
                        </Anchor>
                      ) : (
                        "-"
                      )}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center", fontSize: "16px" }}>
                      {new Date(c.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </Table.Td>

                    <Table.Td style={{ textAlign: "center" }}>
                      <Group justify="center">
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          p={3}
                          onClick={() =>
                            setDeleteModal({ opened: true, customer: c })
                          }
                        >
                          <Icons.Trash size={22} />
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Center mt="md">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={(page) => setCurrentPage(page)}
            color="#0A0B32"
            size="md"
            radius="md"
          />
        </Center>
      </Paper>

      <DeleteConfirmModal
        opened={deleteModal.opened}
        onClose={() => setDeleteModal({ opened: false, customer: null })}
        name={
          deleteModal.customer
            ? `${deleteModal.customer.first_name} ${deleteModal.customer.last_name}`
            : ""
        }
        onConfirm={handleDelete}
      />
    </Stack>
  );
}
