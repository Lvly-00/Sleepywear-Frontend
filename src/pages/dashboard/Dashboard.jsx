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

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get("/api/dashboard-summary");
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      }
    };

    fetchSummary();
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
    // backend data should include daily sales with date + total
    (collection.dailySales || []).forEach((sale) => {
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
              <Text weight={400}
                style={{
                  fontSize: "14 px"
                }}>
                Net Income
              </Text>
              <Icons.Coins size={46} />

              <Text color="#5D4324" style={{
                fontSize: "25px",
                fontWeight: 600
              }}>
                ₱{formatNumber(summary.netIncome)}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={3}>
            <Card style={cardStyle}>
              <Text weight={400}
                style={{
                  fontSize: "14 px"
                }}>
                Gross Income
              </Text>
              <Icons.Coin size={46} />
              <Text color="#5D4324" style={{
                fontSize: "25px",
                fontWeight: 600
              }}>
                ₱{formatNumber(summary.grossIncome)}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={3}>
            <Card style={cardStyle}>
              <Text weight={400}
                style={{
                  fontSize: "10 px"
                }}>
                Total Items Sold
              </Text>
              <Icons.Tag size={46} />
              <Text color="#5D4324" style={{
                fontSize: "25px",
                fontWeight: 600
              }}>
                {formatNumber(summary.totalItemsSold)}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={3}>
            <Card style={cardStyle}>
              <Text weight={400}
                style={{
                  fontSize: "14 px"
                }}>
                Total Invoices
              </Text>
              <Icons.Invoice size={46} />
              <Text color="#5D4324" style={{
                fontSize: "25px",
                fontWeight: 600
              }}>
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
                    month: "long",
                    day: "numeric",
                    year: "numeric",
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
