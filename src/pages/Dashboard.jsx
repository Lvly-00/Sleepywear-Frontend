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
import api from "../api/axios";
import PageHeader from "../components/PageHeader";
import SleepyLoader from "../components/SleepyLoader";
import { Icons } from "../components/Icons";

function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get("/dashboard-summary");
        console.log("Dashboard summary API response:", response.data);  // Debug log
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      }
    };

    fetchSummary();
  }, []);

  if (!summary) return <SleepyLoader />;

  // console.log("totalCustomers:", summary.totalCustomers); 

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

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return Math.round(num).toLocaleString();
  };

  const collectionSalesData = summary.collectionSales.map((collection) => ({
    collection_name: collection.collection_name,
    total_sales: collection.total_sales,
  }));

  const COLORS = ["#944E1B", "#54361C", "#F0BB78", "#8B4513", "#B5651D"];

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
              <Text weight={400} style={{ fontSize: "14px" }}>
                Net Income
              </Text>
              <Icons.Coins size={46} />
              <Text
                color="#5D4324"
                style={{ fontSize: "25px", fontWeight: 600 }}
              >
                ₱{formatNumber(summary.netIncome)}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={3}>
            <Card style={cardStyle}>
              <Text weight={400} style={{ fontSize: "14px" }}>
                Gross Income
              </Text>
              <Icons.Coin size={46} />
              <Text
                color="#5D4324"
                style={{ fontSize: "25px", fontWeight: 600 }}
              >
                ₱{formatNumber(summary.grossIncome)}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={3}>
            <Card style={cardStyle}>
              <Text weight={400} style={{ fontSize: "14px" }}>
                Total Items Sold
              </Text>
              <Icons.Tag size={46} />
              <Text
                color="#5D4324"
                style={{ fontSize: "25px", fontWeight: 600 }}
              >
                {formatNumber(summary.totalItemsSold)}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={3}>
            <Card style={cardStyle}>
              <Text weight={400} style={{ fontSize: "14px" }}>
                Total Customers
              </Text>
              <Icons.EyeOff size={46} />
              <Text
                color="#5D4324"
                style={{ fontSize: "25px", fontWeight: 600 }}
              >
                {formatNumber(summary.totalCustomers)}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Collection Sales Line Chart */}
      <Paper p="xl" style={{ backgroundColor: "#FAF8F3" }}>
        <Card p="lg">
          <Text
            fw={700}
            mb="sm"
            align="center"
            fz={20}
            style={{ color: "#05004E" }}
          >
            Collection Sales Totals
          </Text>

          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={collectionSalesData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="collection_name" />
              <YAxis />
              <Tooltip formatter={(value) => `₱${formatNumber(value)}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_sales"
                stroke={COLORS[0]}
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
                name="Total Sales"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </Paper>
    </Stack>
  );
}

export default Dashboard;
