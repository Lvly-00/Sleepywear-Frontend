import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MainLayout from "./layouts/Layout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Dashboard from "./pages/dashboard/Dashboard";
import Orders from "./pages/orders/Order";
import AddOrder from "./pages/orders/AddOrder";
import CollectionOverview from "./pages/collections/CollectionOverview";
import NewCollection from "./pages/collections/NewCollection";
import EditCollection from "./pages/collections/EditCollection";
import Inventory from "./pages/item/Inventory";
import EditItem from "./pages/item/EditItem";
import ItemDetails from "./pages/item/ItemDetails";
import Settings from "./pages/account/Settings";
import CustomerLogs from "./pages/customer-logs/CustomerLogs";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
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
            path="/collections"
            element={
              <PrivateRoute>
                <CollectionOverview />
              </PrivateRoute>
            }
          />
          <Route
            path="/collections/new"
            element={
              <PrivateRoute>
                <NewCollection />
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
            path="/inventory/:id/edit"
            element={
              <PrivateRoute>
                <EditItem />
              </PrivateRoute>
            }
          />
          <Route
            path="/inventory/:id"
            element={
              <PrivateRoute>
                <ItemDetails />
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
    </Router>
  );
}

export default App;
