import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import MainLayout from "./layouts/Layout";
import Login from "./pages/auth/Login";
import PasswordResetRequest from "./pages/auth/PasswordResetRequest";
import PasswordResetNew from "./pages/auth/PasswordResetNew";
import Dashboard from "./pages/dashboard/Dashboard";
import Orders from "./pages/orders/Order";
import OrderDetails from "./pages/orders/OrderDetails";
import CustomerOrderHistory from "./pages/orders/CustomerOrderHistory";
import AddOrderShipping from "./pages/add-order/AddOrderShipping";
import AddOrderPayment from "./pages/add-order/AddOrderPayment";
import AddOrderInvoice from "./pages/add-order/AddOrderInvoice";
import CollectionOverview from "./pages/collections/CollectionOverview";
import NewCollection from "./pages/collections/NewCollection";
import EditCollection from "./pages/collections/EditCollection";
import Inventory from "./pages/item/Inventory";
import NewItem from "./pages/item/NewItem";
import EditItem from "./pages/item/EditItem";
import ItemDetails from "./pages/item/ItemDetails";
import Invoices from "./pages/invoices/Invoice";
import InvoiceDetails from "./pages/invoices/InvoiceDetails";
import Settings from "./pages/account/Settings";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/password-reset/new" element={<PasswordResetNew />} />

        <Route element={<MainLayout />}>
          {/* Main */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Orders */}
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/customer-orders" element={<CustomerOrderHistory />} />

          {/* Add Order */}
          <Route path="/add-order/shipping" element={<AddOrderShipping />} />
          <Route path="/add-order/payment" element={<AddOrderPayment />} />
          <Route path="/add-order/invoice" element={<AddOrderInvoice />} />

          {/* Collections */}
          <Route path="/collections" element={<CollectionOverview />} />
          <Route path="/collections/new" element={<NewCollection />} />
          <Route path="/collections/:id/edit" element={<EditCollection />} />

          {/* Inventory */}
          {/* Inventory Routes */}
          <Route path="/collections/:id/items" element={<Inventory />} />
          <Route path="/collections/:id/items/new" element={<NewItem />} />
          <Route path="/inventory/:id/edit" element={<EditItem />} />
          <Route path="/inventory/:id" element={<ItemDetails />} />

          {/* Invoices */}
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceDetails />} />

          {/* Account */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
