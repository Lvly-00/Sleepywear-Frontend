import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Container,
  Title,
  Text,
  Image,
  Loader,
  Center,
  Paper,
  Button,
  Group,
} from "@mantine/core";
import SleepyLoader from "../../components/SleepyLoader";

export default function ItemDetails() {
  const { id } = useParams(); // item ID
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/api/items/${id}`)
      .then((res) => {
        setItem(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching item details:", err);
        setLoading(false);
      });
  }, [id]);

 if (loading) {
    return <SleepyLoader />; 
  }

  if (!item) {
    return (
      <Container>
        <Title order={3}>Item not found</Title>
      </Container>
    );
  }

  return (
    <Container>
     

      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group justify="space-between">
          <Title order={2}>{item.name}</Title>
          <Group>
            <Button component={Link} to={`/inventory/${item.id}/edit`}>
              Edit
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Group>
        </Group>

        <Group mt="md" align="flex-start">
          <Image
            src={item.image_url || "https://via.placeholder.com/200"}
            alt={item.name}
            width={200}
            radius="md"
            withPlaceholder
          />
          <div style={{ flex: 1 }}>
            <Text fw={500} mt="sm">
              Item Code: {item.code}
            </Text>
            <Text fw={500} mt="sm">
              Price: ${item.price}
            </Text>
            <Text fw={500} mt="sm">
              Notes:
            </Text>
            <Text>{item.notes || "No additional notes"}</Text>
          </div>
        </Group>
      </Paper>
    </Container>
  );
}
