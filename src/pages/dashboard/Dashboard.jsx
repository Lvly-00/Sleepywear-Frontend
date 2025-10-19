import React, { useEffect, useState } from "react";
import { Stack, Card, Text, Grid, Paper } from "@mantine/core";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import SleepyLoader from "../../components/SleepyLoader";
import { Icons } from "../../components/Icons";

function Dashboard() {
  const [summary, setSummary] = useState(null);

  const dummySummary = {
    grossIncome: 180000,
    netIncome: 95000,
    totalItemsSold: 420,
    totalInvoices: 85,
    totalCollections: 3,
    collectionSales: [
      {
        collection_name: "Sleepywear Summer 2025",
        dailySales: Array.from({ length: 31 }, (_, i) => ({
          date: `2025-10-${String(i + 1).padStart(2, "0")}`,
          total: 3000 + Math.round(Math.random() * 4000), // random 3000–7000
        })),
      },
      {
        collection_name: "Autumn Cozy",
        dailySales: Array.from({ length: 31 }, (_, i) => ({
          date: `2025-10-${String(i + 1).padStart(2, "0")}`,
          total: 2500 + Math.round(Math.random() * 3000), // random 2500–5500
        })),
      },
      {
        collection_name: "Winter Warmth",
        dailySales: Array.from({ length: 31 }, (_, i) => ({
          date: `2025-10-${String(i + 1).padStart(2, "0")}`,
          total: 2000 + Math.round(Math.random() * 2500), // random 2000–4500
        })),
      },
    ],
  };


  useEffect(() => {
    setTimeout(() => {
      setSummary(dummySummary);
    }, 1000);
  }, []);

  if (!summary) return <SleepyLoader />;

  const cardStyle = {
    borderRadius: "16px",
    border: "1px solid #C2C2C2",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    height: "150px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  };

  const formatNumber = (num) => Math.round(num).toLocaleString();

  // 🔹 Prepare chart data for current month only
  const chartData = {};
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  summary.collectionSales.forEach((collection) => {
    collection.dailySales.forEach((sale) => {
      const saleDate = new Date(sale.date);
      if (
        saleDate.getMonth() === currentMonth &&
        saleDate.getFullYear() === currentYear
      ) {
        if (!chartData[sale.date]) chartData[sale.date] = { date: sale.date };
        chartData[sale.date][collection.collection_name] = sale.total;
      }
    });
  });

  const chartArray = Object.values(chartData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const COLORS = ["#944E1B", "#54361C", "#F0BB78"];

  return (
    <Stack p="lg" spacing="xl">
      <PageHeader title="Dashboard" />

      {/* Summary Cards */}
      <Paper p="lg" style={{ backgroundColor: "#FAF8F3" }}>
        <Text
          style={{
            fontSize: "23px",
            fontWeight: "500",
            color: "#05004E",
            marginBottom: "1rem",
          }}
        >
          Summary
        </Text>

        <Grid>
          <Grid.Col span={3}>
            <Card style={cardStyle}>
              <Icons.Coins size={36} />
              <Text mt="sm" weight={500}>
                Net Income
              </Text>
              <Text weight={700} size="xl">
                ₱{formatNumber(summary.netIncome)}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={3}>
            <Card style={cardStyle}>
              <Icons.Coin size={36} />
              <Text mt="sm" weight={500}>
                Gross Income
              </Text>
              <Text weight={700} size="xl">
                ₱{formatNumber(summary.grossIncome)}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={3}>
            <Card style={cardStyle}>
              <Icons.Tag size={36} />
              <Text mt="sm" weight={500}>
                Total Items Sold
              </Text>
              <Text weight={700} size="xl">
                {formatNumber(summary.totalItemsSold)}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={3}>
            <Card style={cardStyle}>
              <Icons.Invoice size={36} />
              <Text mt="sm" weight={500}>
                Total Invoices
              </Text>
              <Text weight={700} size="xl">
                {formatNumber(summary.totalInvoices)}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Daily Sales per Collection */}
      <Paper p="xl" style={{ backgroundColor: "#FAF8F3" }}>
        <Card p="lg">
          <Text
            fw={700}
            mb="sm"
            align="center"
            fz={20}
            style={{ color: "#05004E" }}
          >
            Collection Sales for the Month of{" "}
            {new Date().toLocaleString("default", { month: "long" })}
          </Text>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartArray}>
              <XAxis
                dataKey="date"
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis />
              <Tooltip
                formatter={(value) => `₱${formatNumber(value)}`}
                labelFormatter={(label) => {
                  const d = new Date(label);
                  return d.toLocaleDateString("en-US", {
                    month: "long", // full month name
                    day: "numeric",
                    year: "numeric", // optional — remove if you want only month+day
                  });
                }}
              />
              <Legend />
              {summary.collectionSales.map((collection, idx) => (
                <Line
                  key={collection.collection_name}
                  type="monotone"
                  dataKey={collection.collection_name}
                  stroke={COLORS[idx % COLORS.length]}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

        </Card>
      </Paper>
    </Stack>
  );
}

export default Dashboard;
