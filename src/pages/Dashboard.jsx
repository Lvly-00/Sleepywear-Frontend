import React, { useEffect, useState } from "react";
import { Stack, Card, Text, Grid, Paper, Skeleton } from "@mantine/core";
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
import TopLoadingBar from "../components/TopLoadingBar";
import { Icons } from "../components/Icons";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const response = await api.get("/dashboard-summary");
        setSummary(response.data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
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

  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num)) return "0";
    return Math.round(num).toLocaleString();
  };

  if (loading)
    return (
      <Stack p="xs" spacing="lg">
        <PageHeader title="Dashboard" />
        <Grid gutter="xl" justify="center">
          {[...Array(4)].map((_, idx) => (
            <Grid.Col key={idx} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Card style={cardStyle}>
                <Skeleton height={25} width="60%" mb="sm" />
                <Skeleton height={66} circle mb="sm" />
                <Skeleton height={45} width="50%" mb="sm" />
                <Skeleton height={30} width="40%" />
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Paper p="xl" style={{ backgroundColor: "#FAF8F3" }}>
          <Card p="lg" style={{ height: 400 }}>
            <Skeleton height="100%" />
          </Card>
        </Paper>
      </Stack>
    );

  const collectionSalesData = summary.collectionSales.map((collection) => ({
    collection_name: collection.collection_name,
    total_sales: collection.total_sales,
  }));

  const COLORS = ["#944E1B", "#54361C", "#F0BB78", "#8B4513", "#B5651D"];

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
            <Grid.Col key={idx} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
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

      {/* Collection Sales Line Chart */}
      <Paper p="xl" style={{ backgroundColor: "#FAF8F3" }}>
        <Card p="lg">
          <Text fw={700} mb="sm" align="center" fz={20} style={{ color: "#05004E" }}>
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

//------------------------------------
//---------Dummy Data Ver. -----------
//------------------------------------


// import React, { useState } from "react";
// import { Stack, Card, Text, Grid, Paper } from "@mantine/core";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
// } from "recharts";
// import PageHeader from "../components/PageHeader";
// import { Icons } from "../components/Icons";

// function Dashboard() {
//   // Dummy daily sales data for November (3 collections)
//   // Each day from 1 to 30 with random-ish sales
//   const dummyDailySales = [];

//   // Generate dummy data for 3 collections for 30 days
//   const collections = ["Autumn Vibes", "Winter Warmers", "Holiday Specials"];

//   for (let day = 1; day <= 30; day++) {
//     const dayLabel = `Nov ${day}`;
//     const dayData = { date: dayLabel };

//     // Random daily sales for each collection
//     dayData["Autumn Vibes"] = Math.floor(20000 + Math.random() * 50000);
//     dayData["Winter Warmers"] = Math.floor(25000 + Math.random() * 60000);
//     dayData["Holiday Specials"] = Math.floor(15000 + Math.random() * 40000);

//     dummyDailySales.push(dayData);
//   }

//   const cardStyle = {
//     borderRadius: "28px",
//     border: "1px solid #C2C2C2",
//     boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
//     width: "100%",
//     maxWidth: "300px",
//     height: "250px",
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "center",
//     alignItems: "center",
//     textAlign: "center",
//     margin: "0 auto",
//   };

//   const formatNumber = (num) => {
//     if (num === null || num === undefined || isNaN(num)) return "0";
//     return Math.round(num).toLocaleString();
//   };

//   // Summary totals calculated from dummyDailySales
//   const netIncome = dummyDailySales.reduce(
//     (acc, day) =>
//       acc +
//       day["Autumn Vibes"] * 0.8 +
//       day["Winter Warmers"] * 0.85 +
//       day["Holiday Specials"] * 0.75,
//     0
//   );
//   const grossIncome = dummyDailySales.reduce(
//     (acc, day) =>
//       acc + day["Autumn Vibes"] + day["Winter Warmers"] + day["Holiday Specials"],
//     0
//   );
//   const totalItemsSold = dummyDailySales.reduce(
//     (acc, day) => acc + 50 + 60 + 40, // example fixed items sold per day per collection
//     0
//   );
//   const totalCustomers = 140; // fixed number for demo

//   const COLORS = ["#944E1B", "#54361C", "#F0BB78"];

//   return (
//     <Stack p="xs" spacing="lg">
//       <PageHeader title="Dashboard" />

//       {/* Summary Cards */}
//       <Paper p="lg" style={{ backgroundColor: "#FAF8F3" }}>
//         <Text
//           style={{
//             fontSize: "clamp(24px, 4vw, 30px)",
//             fontWeight: 600,
//             color: "#05004E",
//             marginBottom: "1rem",
//           }}
//         >
//           Summary
//         </Text>

//         <Grid gutter="xl" justify="center">
//           {[
//             {
//               label: "Net Income",
//               icon: <Icons.Coins size={66} />,
//               value: `₱${formatNumber(netIncome)}`,
//               extraText: null,
//             },
//             {
//               label: "Gross Income",
//               icon: <Icons.Coin size={66} />,
//               value: `₱${formatNumber(grossIncome)}`,
//               extraText: null,
//             },
//             {
//               label: "Total Items Sold",
//               icon: <Icons.Tag size={66} />,
//               value: formatNumber(totalItemsSold),
//               extraText: "pieces",
//             },
//             {
//               label: "Customers",
//               icon: <Icons.Customers size={66} />,
//               value: formatNumber(totalCustomers),
//               extraText: "total",
//             },
//           ].map(({ label, icon, value, extraText }, idx) => (
//             <Grid.Col key={idx} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
//               <Card style={{ ...cardStyle, maxWidth: 300, width: "100%" }}>
//                 <Text
//                   weight={400}
//                   style={{ fontSize: "clamp(18px, 2.5vw, 20px)", marginBottom: 6 }}
//                 >
//                   {label}
//                 </Text>
//                 {icon}
//                 <Text
//                   color="#5D4324"
//                   style={{
//                     fontSize: "clamp(32px, 2vw, 50px)",
//                     fontWeight: 500,
//                     marginTop: 6,
//                     wordBreak: "break-word",
//                   }}
//                 >
//                   {value}
//                 </Text>
//                 {extraText && (
//                   <Text
//                     color="#7a6f58"
//                     style={{
//                       fontSize: "clamp(18px, 3vw, 25px)",
//                       marginTop: 1,
//                       fontWeight: 400,
//                     }}
//                   >
//                     {extraText}
//                   </Text>
//                 )}
//               </Card>
//             </Grid.Col>
//           ))}
//         </Grid>
//       </Paper>

//       {/* Collection Sales Line Chart */}
//       <Paper p="xl" style={{ backgroundColor: "#FAF8F3" }}>
//         <Card p="lg">
//           <Text
//             fw={700}
//             mb="sm"
//             align="center"
//             fz={20}
//             style={{ color: "#05004E" }}
//           >
//             Daily Collection Sales (November)
//           </Text>

//           <ResponsiveContainer width="100%" height={350}>
//             <LineChart
//               data={dummyDailySales}
//               margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
//             >
//               <XAxis
//                 dataKey="date"
//                 interval={4} // show tick every 5 days approx
//                 angle={-45}
//                 textAnchor="end"
//                 height={60}
//                 tick={{ fontSize: 12 }}
//               />
//               <YAxis
//                 tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
//                 width={70}
//               />
//               <Tooltip formatter={(value) => `₱${formatNumber(value)}`} />
//               <Legend verticalAlign="top" height={36} />
//               {collections.map((collection, idx) => (
//                 <Line
//                   key={collection}
//                   type="monotone"
//                   dataKey={collection}
//                   stroke={COLORS[idx]}
//                   strokeWidth={2.5}
//                   dot={false}
//                   name={collection}
//                 />
//               ))}
//             </LineChart>
//           </ResponsiveContainer>
//         </Card>
//       </Paper>
//     </Stack>
//   );
// }

// export default Dashboard;
