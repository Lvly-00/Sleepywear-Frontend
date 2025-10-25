import React, { Suspense, lazy } from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "boxicons/css/boxicons.min.css";

import MainLayout from "./layouts/Layout";
import PrivateRoute from "./components/PrivateRoute";
import SleepyLoader from "./components/SleepyLoader";
import NotFound from "./pages/NotFound";


// Lazy load pages
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Order"));
const AddOrder = lazy(() => import("./pages/AddOrder"));
const CollectionOverview = lazy(() => import("./pages/CollectionOverview"));
const EditCollection = lazy(() => import("./pages/EditCollection"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Settings = lazy(() => import("./pages/Settings"));
const CustomerLogs = lazy(() => import("./pages/CustomerLogs"));
const ConfirmOrder = lazy(() => import("./pages/ConfirmOrder"));


function App() {
  return (
    <Router>
      {/* Suspense shows a fallback while each page loads */}
      <Suspense fallback={<SleepyLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

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
            <Route path="*" element={<NotFound />} />

          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
