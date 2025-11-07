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
import SleepyLoader from "../components/TopLoadingBar";
import { Icons } from "../components/Icons";

function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await api.get("/dashboard-summary");
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      }
    };

    fetchSummary();
  }, []);

  if (!summary) return <SleepyLoader />;

  const cardStyle = {
    borderRadius: "28px",
    border: "1px solid #C2C2C2",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "300px",
    height: "250px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    margin: "0 auto",
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
    <Stack
      p="xs"
      spacing="lg"
    >
      <PageHeader title="Dashboard" />

      {/* Summary Cards */}
      <Paper p="lg" style={{ backgroundColor: "#FAF8F3" }}>
        <Text
          style={{
            fontSize: "clamp(24px, 4vw, 30px)",
            fontWeight: 600,
            color: "#05004E",
            marginBottom: "1rem",
          }}
        >
          Summary
        </Text>

        <Grid gutter="xl" justify="center">
          {[
            {
              label: "Net Income",
              icon: <Icons.Coins size={66} />,
              value: `₱${formatNumber(summary.netIncome)}`,
              extraText: null,
            },
            {
              label: "Gross Income",
              icon: <Icons.Coin size={66} />,
              value: `₱${formatNumber(summary.grossIncome)}`,
              extraText: null,
            },
            {
              label: "Total Items Sold",
              icon: <Icons.Tag size={66} />,
              value: formatNumber(summary.totalItemsSold),
              extraText: "pieces",
            },
            {
              label: "Customers",
              icon: <Icons.Customers size={66} />,
              value: formatNumber(summary.totalCustomers),
              extraText: "total",
            },
          ].map(({ label, icon, value, extraText }, idx) => (
            <Grid.Col
              key={idx}
              span={{ base: 12, sm: 6, md: 4, lg: 3 }}
            
            >
          <Card style={{ ...cardStyle, maxWidth: 300, width: "100%" }}>
            <Text
              weight={400}
              style={{ fontSize: "clamp(18px, 2.5vw, 20px)", marginBottom: 6 }}
            >
              {label}
            </Text>
            {icon}
            <Text
              color="#5D4324"
              style={{
                fontSize: "clamp(32px, 2vw, 50px)",
                fontWeight: 500,
                marginTop: 6,
                wordBreak: "break-word",
              }}
            >
              {value}
            </Text>
            {extraText && (
              <Text
                color="#7a6f58"
                style={{
                  fontSize: "clamp(18px, 3vw, 25px)",
                  marginTop: 1,
                  fontWeight: 400,
                }}
              >
                {extraText}
              </Text>
            )}
          </Card>
        </Grid.Col>
          ))}
      </Grid>

    </Paper>

      {/* Collection Sales Line Chart */ }
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
    </Stack >
  );
}

export default Dashboard;
