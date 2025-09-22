import React, { useState, useEffect } from "react";
import { Modal, TextInput, Button, Select, Group, Table, Title } from "@mantine/core";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const AddOrder = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    address: "",
    contact_number: "",
    social_handle: ""
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const navigate = useNavigate();

  // Fetch collections from backend
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await api.get("/api/collections");
        setCollections(res.data);
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };
    fetchCollections();
  }, []);

  // Add selected item to order list
  const handleAddItem = () => {
    if (!selectedItem) return;
    const item = collections
      .flatMap(c => c.items)
      .find(i => i.id.toString() === selectedItem); // match by ID

    if (item && !orderItems.some(i => i.id === item.id)) {
      setOrderItems(prev => [...prev, item]);
      setSelectedItem("");
    }
  };

  // Calculate total price
  const total = orderItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  // Place order and send to backend
  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) return alert("Please add at least one item");
    if (!form.first_name || !form.address) return alert("Please fill all required fields");

    try {
      const payload = {
        invoice: { customer_name: `${form.first_name} ${form.last_name}`, notes: null },
        orders: [
          {
            ...form,
            items: orderItems.map(item => ({
              item_id: item.id,
              item_name: item.name,
              price: item.price,
              quantity: 1
            }))
          }
        ],
        payment_method: paymentMethod
      };

      const response = await api.post("/api/orders", payload);
      setInvoiceData(response.data);
      setInvoiceModal(true);
    } catch (err) {
      console.error(err);
      alert("Order failed. Check console.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Title order={2}>Add Order</Title>

      <Group mt="md">
        <Select
          placeholder="Collection"
          data={collections.map(c => ({ value: c.id.toString(), label: c.name }))}
          value={selectedCollection}
          onChange={setSelectedCollection}
        />
        <Select
          placeholder="Item"
          data={
            (collections.find(c => c.id.toString() === selectedCollection)?.items || []).map(i => ({
              value: i.id.toString(),
              label: i.name
            }))
          }
          value={selectedItem}
          onChange={setSelectedItem}
        />
        <Button onClick={handleAddItem}>Add</Button>
      </Group>

      <Table withBorder mt="md">
        <tbody>
          {orderItems.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>₱{item.price}</td>
            </tr>
          ))}
          <tr>
            <td><b>Total</b></td>
            <td><b>₱{total.toFixed(2)}</b></td>
          </tr>
        </tbody>
      </Table>

      {["first_name", "last_name", "address", "contact_number", "social_handle"].map(field => (
        <TextInput
          key={field}
          label={field.replace("_", " ")}
          required={["first_name", "address"].includes(field)}
          value={form[field]}
          onChange={e => setForm({ ...form, [field]: e.target.value })}
          mt="sm"
        />
      ))}

      <Select
        mt="sm"
        label="Payment Method"
        value={paymentMethod}
        onChange={setPaymentMethod}
        data={["cash", "gcash", "bank"]}
      />

      <Button fullWidth mt="md" onClick={handlePlaceOrder}>Place Order</Button>

      <Modal opened={invoiceModal} onClose={() => navigate("/orders")} title="Invoice Summary">
        {invoiceData ? (
          <div>
            <p><b>Invoice Ref:</b> {invoiceData.invoice_ref}</p>
            <p><b>Total:</b> ₱{invoiceData.total}</p>
            <p><b>Payment Status:</b> {invoiceData.payment_status}</p>
            <Button mt="sm" onClick={() => navigate("/orders")}>Close</Button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>
    </div>
  );
};

export default AddOrder;
