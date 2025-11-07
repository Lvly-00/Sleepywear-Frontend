import React, { useEffect, useState } from "react";
import { Table, Paper, ScrollArea, Text, Skeleton, Stack } from "@mantine/core";
import api from "../api/axios";

const FastCollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get("/collections");
        setCollections(res.data);
      } catch (err) {
        console.error("Failed to fetch collections:", err);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  if (loading) {
    return (
      <Paper p="xl" shadow="sm" style={{ minHeight: "60vh" }}>
        <Stack spacing="sm">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height={30} width="100%" radius="sm" />
          ))}
        </Stack>
      </Paper>
    );
  }

  if (collections.length === 0) {
    return (
      <Paper p="xl" shadow="sm" style={{ minHeight: "60vh" }}>
        <Text align="center" color="dimmed" size="lg">
          No collections found.
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="xl" shadow="sm" style={{ minHeight: "60vh" }}>
      <ScrollArea style={{ maxHeight: "70vh" }}>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Release Date</th>
              <th>Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((col) => (
              <tr key={col.id}>
                <td>{col.name || "—"}</td>
                <td>
                  {col.release_date
                    ? new Date(col.release_date).toLocaleDateString()
                    : "—"}
                </td>
                <td>{col.qty ?? 0}</td>
                <td>{col.status || "Unknown"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
};

export default FastCollectionsPage;
