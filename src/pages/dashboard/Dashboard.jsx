import React, { useState } from "react";
import { Title, Group, Button, Stack, Card, Text, Grid } from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  // Dummy data for dashboard
  const [ordersStats] = useState([
    { status: "pending", count: 5 },
    { status: "shipped", count: 8 },
    { status: "delivered", count: 12 },
  ]);

  const [invoiceStats] = useState([
    { sent: true, count: 10 },
    { sent: false, count: 15 },
  ]);

  const [monthlySales] = useState([
    { month: "Jan", total: 15000 },
    { month: "Feb", total: 18000 },
    { month: "Mar", total: 12000 },
    { month: "Apr", total: 22000 },
    { month: "May", total: 17000 },
    { month: "Jun", total: 25000 },
  ]);
  return (
    <Stack p="lg" spacing="xl">
      <Title order={1}>Dashboard</Title>

      {/* Dashboard Cards */}
      <Grid mt="lg">
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg">
            <Text>Total Orders</Text>
            <Text weight={700} size="xl">
              {ordersStats.reduce((sum, o) => sum + o.count, 0)}
            </Text>
            <Text size="sm" color="dimmed">
              Pending:{" "}
              {ordersStats.find((o) => o.status === "pending")?.count || 0} |
              Shipped:{" "}
              {ordersStats.find((o) => o.status === "shipped")?.count || 0} |
              Delivered:{" "}
              {ordersStats.find((o) => o.status === "delivered")?.count || 0}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg">
            <Text>Total Invoices</Text>
            <Text weight={700} size="xl">
              {invoiceStats.reduce((sum, i) => sum + i.count, 0)}
            </Text>
            <Text size="sm" color="dimmed">
              Sent: {invoiceStats.find((i) => i.sent)?.count || 0} | Not Sent:{" "}
              {invoiceStats.find((i) => !i.sent)?.count || 0}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={4}>
          <Card shadow="sm" padding="lg">
            <Text>Total Sales</Text>
            <Text weight={700} size="xl">
              ₱
              {monthlySales
                .reduce((sum, s) => sum + s.total, 0)
                .toLocaleString()}
            </Text>
            <Text size="sm" color="dimmed">
              Monthly Overview
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Sales Bar Chart */}
      <Card shadow="sm" padding="lg">
        <Text weight={600} mb="sm">
          Monthly Sales
        </Text>
        {monthlySales.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={monthlySales}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" name="Sales (₱)" fill="#4c6ef5" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Text>No sales data available</Text>
        )}
      </Card>
    </Stack>
  );
}

export default Dashboard;
