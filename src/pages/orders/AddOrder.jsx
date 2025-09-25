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
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
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

  // Fetch collections and customers
  useEffect(() => {
    fetchCollections();
    fetchCustomers();
  }, []);

  const fetchCollections = async () => {
    try {
      const res = await api.get("/api/collections");
      const activeCollections = res.data
        .filter((c) => c.status === "Active")
        .map((c) => ({
          ...c,
          items: c.items.filter((i) => i.status === "available"),
        }))
        .filter((c) => c.items.length > 0);

      setCollections(activeCollections);
    } catch (err) {
      console.error("Error fetching collections:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get("/api/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find((c) => c.id.toString() === customerId);
    if (customer) {
      setSelectedCustomer(customer.id);
      setForm({
        first_name: customer.first_name,
        last_name: customer.last_name,
        address: customer.address,
        contact_number: customer.contact_number,
        social_handle: customer.social_handle || "",
      });
    }
  };

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
    if (!form.first_name || !form.address) return alert("Please fill all required fields");

    try {
      // If customer exists, update; else create new
      const customerPayload = { ...form };
      let customerId = selectedCustomer;
      if (selectedCustomer) {
        await api.put(`/api/customers/${selectedCustomer}`, customerPayload);
      } else {
        const res = await api.post("/api/customers", customerPayload);
        customerId = res.data.id;
      }

      // ✅ FIX: payload matches Laravel expectation
      const payload = {
        invoice: {
          customer_name: `${form.first_name} ${form.last_name}`,
          notes: null,
        },
        orders: [
          {
            first_name: form.first_name,
            last_name: form.last_name,
            address: form.address,
            contact_number: form.contact_number,
            social_handle: form.social_handle,
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

      await fetchCollections(); // refresh items

      // Prepare invoice data
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
      setOrderItems([]);
    } catch (err) {
      console.error(err);
      alert("Order failed. Check console.");
    }
  };

  const availableItems =
    collections.find((c) => c.id.toString() === selectedCollection)?.items || [];

  return (
    <div style={{ padding: 20 }}>
      <Title order={2}>Add Order</Title>

      {/* Optional Customer Search */}
      <Select
        placeholder="Search Customer (optional)"
        data={customers.map((c) => ({
          value: c.id.toString(),
          label: `${c.first_name} ${c.last_name}`,
        }))}
        onChange={handleCustomerSelect}
        clearable
        mt="md"
      />

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
            setSelectedItem("");
          }}
        />
        <Select
          placeholder="Select Item"
          data={availableItems.map((i) => ({
            value: i.id.toString(),
            label: i.name,
          }))}
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

      {["first_name", "last_name", "address", "contact_number", "social_handle"].map((field) => (
        <TextInput
          key={field}
          label={field.replace("_", " ")}
          required={["first_name", "address"].includes(field)}
          value={form[field]}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          mt="sm"
        />
      ))}

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
