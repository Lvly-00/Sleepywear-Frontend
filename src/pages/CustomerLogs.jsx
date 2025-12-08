import React, { useEffect, useState, useCallback, useRef } from "react";
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
  const pageFromUrl = parseInt(queryParams.get("page") || "1", 10);
  const searchFromUrl = queryParams.get("search") || "";
  const preloadedCustomers = location.state?.preloadedCustomers || [];

  const isInitialMount = useRef(true);

  const [customersCache, setCustomersCache] = useState(
    preloadedCustomers.length > 0 ? { [pageFromUrl]: preloadedCustomers } : {}
  );

  const [page, setPage] = useState(pageFromUrl);
  const [search, setSearch] = useState(searchFromUrl);
  const [searchValue, setSearchValue] = useState(searchFromUrl);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(!preloadedCustomers.length);

  const [deleteModal, setDeleteModal] = useState({
    opened: false,
    customer: null,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page);
    if (search.trim()) params.set("search", search.trim());

    navigate(
      { pathname: location.pathname, search: params.toString() },
      { replace: true }
    );
  }, [page, search, navigate, location.pathname]);

  const fetchCustomers = useCallback(
    async (targetPage, searchTerm = search, showLoader = true) => {
      if (showLoader) setLoading(true);

      try {
        const res = await api.get("/customers", {
          params: {
            page: targetPage,
            per_page: CUSTOMERS_PER_PAGE,
            search: searchTerm.trim() || undefined,
          },
        });

        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const lastPage = res.data?.last_page || 1;

        setCustomersCache((prev) => ({
          ...prev,
          [targetPage]: data,
        }));

        setTotalPages(lastPage);
      } catch (err) {
        console.error("Fetch error:", err);
        setCustomersCache((prev) => ({
          ...prev,
          [targetPage]: [],
        }));
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    if (isInitialMount.current && preloadedCustomers.length > 0) {
      isInitialMount.current = false;
      return;
    }
    isInitialMount.current = false;
    fetchCustomers(page, search);
  }, [page, search, fetchCustomers, preloadedCustomers.length]);

  const handleSearchTrigger = () => {
    const trimmed = searchValue.trim();
    setSearch(trimmed);
    setPage(1);
    setCustomersCache({});
  };

  const handleDelete = async () => {
    if (!deleteModal.customer) return;

    try {
      setLoading(true);
      await api.delete(`/customers/${deleteModal.customer.id}`);

      setCustomersCache({});
      await fetchCustomers(page, search);

      NotifySuccess.deleted();
      setDeleteModal({ opened: false, customer: null });
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentCustomers = Array.isArray(customersCache[page])
    ? customersCache[page]
    : [];

  const skeletonRows = Math.max(currentCustomers.length, MIN_SKELETON_ROWS);

  const renderSkeletonRows = () =>
    Array.from({ length: skeletonRows }).map((_, i) => (
      <Table.Tr key={i}>
        {Array(6)
          .fill(null)
          .map((_, j) => (
            <Table.Td key={j} style={{ textAlign: j === 0 ? "left" : "center" }}>
              <Skeleton height={20} width={j === 0 ? "40%" : "70%"} />
            </Table.Td>
          ))}
      </Table.Tr>
    ));

  return (
    <Stack p="xs" spacing="lg">
      <PageHeader
        title="Customers"
        showSearch
        search={searchValue}
        setSearch={setSearchValue}
        onSearchEnter={handleSearchTrigger}
      />

      <Paper
        radius="md"
        p="xl"
        style={{
          minHeight: "70vh",
          background: "white",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'League Spartan', sans-serif",
        }}
      >
        <ScrollArea scrollbarSize={8} style={{ flex: 1 }}>
          <Table highlightOnHover
            styles={{
              tr: { borderBottom: "1px solid #D8CBB8", fontSize: "20px" },
              th: { fontFamily: "'League Spartan', sans-serif", fontSize: "20px" },
              td: { fontFamily: "'League Spartan', sans-serif", fontSize: "16px" },
            }}>
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
              {loading
                ? renderSkeletonRows()
                : currentCustomers.length === 0
                  ? (
                    <Table.Tr>
                      <Table.Td colSpan={6} style={{ textAlign: "center", padding: "1.5rem" }}>
                        <Text c="dimmed" size="20px">
                          No customers found.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )
                  : currentCustomers.map((c) => (
                    <Table.Tr key={c.id}>
                      <Table.Td>{c.first_name} {c.last_name}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>{c.address || "—"}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>{c.contact_number}</Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
                        {c.social_handle && /^https?:\/\//.test(c.social_handle)
                          ? (
                            <Anchor href={c.social_handle} target="_blank" underline="hover">
                              {c.social_handle}
                            </Anchor>
                          )
                          : "-"}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "center" }}>
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
                  ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        <Center mt="md">
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
        opened={deleteModal.opened}
        onClose={() => setDeleteModal({ opened: false, customer: null })}
        name={
          deleteModal.customer
            ? `${deleteModal.customer.first_name} ${deleteModal.customer.last_name}`
            : ""
        }
        onConfirm={handleDelete}
      >
        {/* THIS IS THE CUSTOM TEXT SPECIFICALLY FOR CUSTOMERS */}
        <Text
            align="center"
            color="#6B6B6B"
            style={{
              width: "100%",
              fontWeight: "400",
              fontSize: "18px",
              paddingBottom: "5px",
            }}
          >
            This will <Text span fw={700} style={{ textTransform: "uppercase" }}>permanently delete</Text> all past orders for{" "}
            <Text span fw={700} style={{ textTransform: "uppercase" }}>
              {deleteModal.customer
                ? `${deleteModal.customer.first_name} ${deleteModal.customer.last_name}`
                : "this customer"}
            </Text>
            . Are you sure you want to delete?
          </Text>
      </DeleteConfirmModal>
    </Stack>
  );
}