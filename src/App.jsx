import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./assets/layouts/Layout";
import Login from "./assets/pages/auth/Login";
import PasswordResetRequest from "./assets/pages/auth/PasswordResetRequest";
import PasswordResetNew from "./assets/pages/auth/PasswordResetNew";
import Dashboard from "./assets/pages/dashboard/Dashboard";
import Orders from "./assets/pages/orders/Order";
import OrderDetails from "./assets/pages/orders/OrderDetails";
import CustomerOrderHistory from "./assets/pages/orders/CustomerOrderHistory";
import AddOrderShipping from "./assets/pages/add-order/AddOrderShipping";
import AddOrderPayment from "./assets/pages/add-order/AddOrderPayment";
import AddOrderInvoice from "./assets/pages/add-order/AddOrderInvoice";
import CollectionOverview from "./assets/pages/collections/CollectionOverview";
import NewCollection from "./assets/pages/collections/NewCollection";
import EditCollection from "./assets/pages/collections/EditCollection";
import Inventory from "./assets/pages/item/Inventory";
import NewItem from "./assets/pages/item/NewItem";
import EditItem from "./assets/pages/item/EditItem";
import ItemDetails from "./assets/pages/item/ItemDetails";
import Invoices from "./assets/pages/invoices/Invoice";
import InvoiceDetails from "./assets/pages/invoices/InvoiceDetails";
import Settings from "./assets/pages/account/Settings";

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/password-reset" element={<PasswordResetRequest />} />
        <Route path="/password-reset/new" element={<PasswordResetNew />} />

        <Route element={<Layout />}>
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
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/inventory/new" element={<NewItem />} />
          <Route path="/inventory/:id/edit" element={<EditItem />} />
          <Route path="/inventory/:id/details" element={<ItemDetails />} />

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
