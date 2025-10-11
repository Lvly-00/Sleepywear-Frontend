import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "boxicons/css/boxicons.min.css";
import MainLayout from "./layouts/Layout";
import PrivateRoute from "./components/PrivateRoute";
import SleepyLoader from "./components/SleepyLoader";

// Lazy load pages
const Login = lazy(() => import("./pages/auth/Login"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const Orders = lazy(() => import("./pages/orders/Order"));
const AddOrder = lazy(() => import("./pages/orders/AddOrder"));
const CollectionOverview = lazy(() => import("./pages/collections/CollectionOverview"));
const EditCollection = lazy(() => import("./pages/collections/EditCollection"));
const Inventory = lazy(() => import("./pages/item/Inventory"));
const Settings = lazy(() => import("./pages/account/Settings"));
const CustomerLogs = lazy(() => import("./pages/customer-logs/CustomerLogs"));
const ConfirmOrder = lazy(() => import("./pages/orders/ConfirmOrder"));


function App() {
  return (
    <Router>
      {/* Suspense shows a fallback while each page loads */}
      <Suspense fallback={<SleepyLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password-reset/:token" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route
              path="/add-order"
              element={
                <PrivateRoute>
                  <AddOrder />
                </PrivateRoute>
              }
            />

            <Route
              path="/confirm-order"
              element={
                <PrivateRoute>
                  <ConfirmOrder />
                </PrivateRoute>
              }
            />
            <Route
              path="/collections"
              element={
                <PrivateRoute>
                  <CollectionOverview />
                </PrivateRoute>
              }
            />
            <Route
              path="/collections/:id/edit"
              element={
                <PrivateRoute>
                  <EditCollection />
                </PrivateRoute>
              }
            />
            <Route
              path="/collections/:id/items"
              element={
                <PrivateRoute>
                  <Inventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <PrivateRoute>
                  <CustomerLogs />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
