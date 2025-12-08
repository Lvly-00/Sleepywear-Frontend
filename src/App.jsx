import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import "boxicons/css/boxicons.min.css";
import { BrowserRouter } from "react-router-dom";

import MainLayout from "./layouts/Layout";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";
import useIdleLogout from "./hooks/useIdleLogout";

import TopLoadingBar from "./components/TopLoadingBar";
import NotFound from "./pages/NotFound";



// Lazy load pages
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Order"));
const AddOrder = lazy(() => import("./pages/AddOrder"));
const Collection = lazy(() => import("./pages/Collection"));
const EditCollection = lazy(() => import("./pages/EditCollection"));
const Item = lazy(() => import("./pages/Item"));
const Settings = lazy(() => import("./pages/Settings"));
const CustomerLogs = lazy(() => import("./pages/CustomerLogs"));
const ConfirmOrder = lazy(() => import("./pages/ConfirmOrder"));


function App() {
  useIdleLogout(60 * 60 * 1000);
  return (
    <BrowserRouter>
      {/* Suspense shows a fallback while each page loads */}
      <Suspense fallback={<TopLoadingBar />}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={<PublicRoute>
              <Login />
            </PublicRoute>
            } />
          <Route path="/passwords/forgot" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/passwords/reset" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          {/* Protected Routes */}
          < Route element={<MainLayout />}>
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
                  <Collection />
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
                  <Item />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
