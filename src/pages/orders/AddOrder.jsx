import React, { useState, useEffect } from "react";
import { TextInput, Button, Select, Group, Table, Title } from "@mantine/core";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import InvoicePreview from "../../components/InvoicePreview";

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
    social_handle: "",
  });
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const navigate = useNavigate();

  // Fetch collections and items, only Active collections and Available items
  const fetchCollections = async () => {
    try {
      const res = await api.get("/api/collections");
      // Filter Active collections only
      const activeCollections = res.data
        .filter((c) => c.status === "Active")
        .map((c) => ({
          ...c,
          items: c.items.filter((i) => i.status === "available"), // Only available items
        }))
        .filter((c) => c.items.length > 0); // Remove collections with no available items

      setCollections(activeCollections);
      // Reset selection if previously selected collection is now empty
      if (!activeCollections.find((c) => c.id.toString() === selectedCollection)) {
        setSelectedCollection("");
        setSelectedItem("");
      }
    } catch (err) {
      console.error("Error fetching collections:", err);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleAddItem = () => {
    if (!selectedItem) return;
    const item = collections
      .flatMap((c) => c.items)
      .find((i) => i.id.toString() === selectedItem);
    if (item && !orderItems.some((i) => i.id === item.id)) {
      setOrderItems((prev) => [...prev, item]);
      setSelectedItem("");
    }
  };

  const total = orderItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) return alert("Please add at least one item");
    if (!form.first_name || !form.address)
      return alert("Please fill all required fields");

    try {
      const payload = {
        invoice: {
          customer_name: `${form.first_name} ${form.last_name}`,
          notes: null,
        },
        orders: [
          {
            ...form,
            items: orderItems.map((item) => ({
              item_id: item.id,
              item_name: item.name,
              price: item.price,
              quantity: 1,
            })),
          },
        ],
      };

      await api.post("/api/orders", payload);

      // Refresh collections to remove taken items
      await fetchCollections();

      const invoice = {
        customer_name: `${form.first_name} ${form.last_name}`,
        address: form.address,
        contact_number: form.contact_number,
        social_handle: form.social_handle,
        items: orderItems.map((i) => ({
          item_name: i.name,
          quantity: 1,
          price: i.price,
        })),
        total,
      };
      setInvoiceData(invoice);
      setInvoiceModal(true);

      // Clear orderItems
      setOrderItems([]);
    } catch (err) {
      console.error(err);
      alert("Order failed. Check console.");
    }
  };

  // Get available items for the selected collection
  const availableItems =
    collections.find((c) => c.id.toString() === selectedCollection)?.items || [];

  return (
    <div style={{ padding: 20 }}>
      <Title order={2}>Add Order</Title>

      <Group mt="md">
        <Select
          placeholder="Select Collection"
          data={collections.map((c) => ({
            value: c.id.toString(),
            label: c.name,
          }))}
          value={selectedCollection}
          onChange={(val) => {
            setSelectedCollection(val);
            setSelectedItem(""); // reset item when collection changes
          }}
        />
        <Select
          placeholder="Select Item"
          data={availableItems.map((i) => ({ value: i.id.toString(), label: i.name }))}
          value={selectedItem}
          onChange={setSelectedItem}
          disabled={!selectedCollection}
        />
        <Button onClick={handleAddItem} disabled={!selectedItem}>
          Add
        </Button>
      </Group>

      <Table withBorder mt="md">
        <tbody>
          {orderItems.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>₱{item.price}</td>
            </tr>
          ))}
          <tr>
            <td>
              <b>Total</b>
            </td>
            <td>
              <b>₱{total.toFixed(2)}</b>
            </td>
          </tr>
        </tbody>
      </Table>

      {["first_name", "last_name", "address", "contact_number", "social_handle"].map(
        (field) => (
          <TextInput
            key={field}
            label={field.replace("_", " ")}
            required={["first_name", "address"].includes(field)}
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
            mt="sm"
          />
        )
      )}

      <Button fullWidth mt="md" onClick={handlePlaceOrder}>
        Place Order
      </Button>

      <InvoicePreview
        opened={invoiceModal}
        onClose={() => {
          setInvoiceModal(false);
          navigate("/orders");
        }}
        invoiceData={invoiceData}
      />
    </div>
  );
};

export default AddOrder;
