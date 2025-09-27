import React, { useEffect, useState } from "react";
import { Title, Stack, Card, Text, Grid } from "@mantine/core";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";

function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api
      .get("/api/dashboard-summary")
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err));
  }, []);

  if (!summary) return <Text>Loading...</Text>;

  return (
    <Stack p="lg" spacing="xl">
      <PageHeader title="Dashboard" />

      {/* Summary Cards */}
      <Grid mt="lg">
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Text>Total Sales</Text>
            <Text weight={700} size="xl">
              ₱{summary.totalSales.toLocaleString()}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Text>Total Items Sold</Text>
            <Text weight={700} size="xl">
              {summary.totalItemsSold}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Text>Total Collections</Text>
            <Text weight={700} size="xl">
              {summary.totalCollections}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={3}>
          <Card shadow="sm" padding="lg">
            <Text>Total Invoices</Text>
            <Text weight={700} size="xl">
              {summary.totalInvoices}
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Collection Sales per Month (Line Chart) */}
      <Card shadow="sm" padding="lg">
        <Text weight={600} mb="sm">
          Collection Sales per Month
        </Text>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={summary.collectionSales}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#4c6ef5" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Sales Comparison (Area Chart) */}
      <Card shadow="sm" padding="lg">
        <Text weight={600} mb="sm">
          Sales Comparison
        </Text>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={[
              { month: "Last Month", sales: summary.salesComparison.lastMonth },
              { month: "This Month", sales: summary.salesComparison.thisMonth },
            ]}
          >
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#82ca9d"
              fill="#82ca9d"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </Stack>
  );
}

export default Dashboard;
