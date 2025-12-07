import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Stack, Card, Text, Grid, Paper, Skeleton } from "@mantine/core";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Label, // Import Label if needed, but we used the prop on Axis
} from "recharts";
import PageHeader from "../components/PageHeader";
import { Icons } from "../components/Icons";
import api from "../api/axios";

function Dashboard() {
  const location = useLocation();
  const preloadedSummary = location.state?.preloadedSummary;

  const [summary, setSummary] = useState(
    preloadedSummary || {
      totalRevenue: 0,
      grossIncome: 0,
      netIncome: 0,
      totalItemsSold: 0,
      totalCustomers: 0,
      collectionSales: [],
    }
  );

  const [dailySales, setDailySales] = useState([]);
  const [collections, setCollections] = useState([]);

  const [loading, setLoading] = useState(!preloadedSummary);

  const COLORS = ["#944E1B", "#54361C", "#F0BB78", "#AB8262", "#232D80"];
  const monthName = new Date().toLocaleString("default", { month: "long" });

  const formatNumber = (num) =>
    !num || isNaN(num) ? "0" : Math.round(num).toLocaleString();

  const buildChartData = (data) => {
    const monthDays = new Date().getDate();
    const collectionNames = data.collectionSales.map((c) => c.collection_name);

    const chartData = [];

    for (let i = 1; i <= monthDays; i++) {
      const row = { date: i };
      
      // 🔥 Initialize all collections to 0 by default so graph isn't empty/broken
      collectionNames.forEach((name) => (row[name] = 0));

      const dayData = data.dailySales.find((d) => Number(d.date) === i);
      if (dayData) {
        Object.keys(dayData).forEach((key) => {
          if (key !== "date") row[key] = dayData[key];
        });
      }

      chartData.push(row);
    }

    setCollections(collectionNames);
    setDailySales(chartData);
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/dashboard-summary");
      const data = res.data;

      setSummary({
        totalRevenue: data.totalRevenue,
        grossIncome: data.grossIncome,
        netIncome: data.netIncome,
        totalItemsSold: data.totalItemsSold,
        totalCustomers: data.totalCustomers,
        collectionSales: data.collectionSales,
      });

      buildChartData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (preloadedSummary) {
      buildChartData(preloadedSummary);
      return;
    }
    fetchDashboardData();
  }, []);

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

  return (
    <Stack p="xs" spacing="lg">
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
              extraText: "‎     ",
            },
            {
              label: "Gross Income",
              icon: <Icons.Coin size={66} />,
              value: `₱${formatNumber(summary.grossIncome)}`,
              extraText: "‎    ",
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
            <Grid.Col key={idx} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton visible={loading} height={250} radius="xl">
                <Card style={{ ...cardStyle }}>
                  <Text
                    style={{
                      fontWeight: 400,
                      fontSize: "clamp(18px,2.5vw,26px)",
                      marginBottom: 6,
                      fontFamily: "'League Spartan', sans-serif",
                    }}
                  >
                    {label}
                  </Text>
                  {icon}
                  <Text
                    color="#5D4324"
                    style={{
                      fontSize: "clamp(32px,3vw,50px)",
                      margin: 0,
                      padding: 0,
                      lineHeight: 1.1,
                      fontWeight: 500,
                      fontFamily: "'League Spartan', sans-serif",
                    }}
                  >
                    {value}
                  </Text>

                  {extraText && (
                    <Text
                      color="#7a6f58"
                      style={{
                        fontSize: "clamp(18px,2vw,26px)",
                        margin: 0,
                        padding: 0,
                        lineHeight: 1.0,
                        fontWeight: 400,
                        fontFamily: "'League Spartan', sans-serif",
                      }}
                    >
                      {extraText}
                    </Text>
                  )}
                </Card>
              </Skeleton>
            </Grid.Col>
          ))}
        </Grid>
      </Paper>

      {/* Collection Sales Chart */}
      <Paper p="xl" style={{ backgroundColor: "#FAF8F3" }}>
        <Skeleton visible={loading} height={400} radius="xl">
          <Card p="lg">
            <Text
              fw={700}
              mb="sm"
              align="center"
              fz={20}
              style={{ color: "#05004E" }}
            >
              Collection Sales for the Month of {monthName}
            </Text>

            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={dailySales}
                // 🔥 Increased margins to fit the labels
                margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
              >
                <XAxis
                  dataKey="date"
                  interval={0}
                  height={40}
                  tick={{ fontSize: 12 }}
                  // 🔥 Date Label added here
                  label={{ 
                    value: "Date", 
                    position: "insideBottom", 
                    offset: -10,
                    style: { fill: "#666", fontSize: 14, fontWeight: 500 }
                  }}
                />
                <YAxis
                  tickFormatter={(value) => {
                    if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
                    if (value >= 1_000) return `₱${(value / 1_000).toFixed(1)}k`;
                    return `₱${value}`;
                  }}
                  width={70}
                  // 🔥 Forces Y-axis to start at 0 even if data is empty
                  domain={[0, 'auto']} 
                  // 🔥 Profit Label added here
                  label={{ 
                    value: "Profit", 
                    angle: -90, 
                    position: "insideLeft",
                    style: { fill: "#666", fontSize: 14, fontWeight: 500 }
                  }}
                />

                <Tooltip
                  labelFormatter={(value) => `${monthName} ${value}`}
                  formatter={(value) => `₱${formatNumber(value)}`}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #C2C2C2",
                    backgroundColor: "#fff",
                    padding: "10px",
                    fontFamily: "'League Spartan', sans-serif",
                  }}
                />
                <Legend verticalAlign="bottom" height={10} />

                {collections.map((col, idx) => (
                  <Line
                    key={col}
                    type="monotone"
                    dataKey={col}
                    stroke={COLORS[idx % COLORS.length]}
                    strokeWidth={2.5}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Skeleton>
      </Paper>
    </Stack>
  );
}

export default Dashboard;