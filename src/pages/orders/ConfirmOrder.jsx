import React, { useState, useEffect } from "react";
import { Text, TextInput, Button, Table, Select, Card } from "@mantine/core";
import api from "../../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import InvoicePreview from "../../components/InvoicePreview";
import PageHeader from "../../components/PageHeader";

const ConfirmOrder = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

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
  const [errors, setErrors] = useState({});

  // ✅ Items passed from ConfirmOrder page
  const orderItems = state?.items || [];
  const total = orderItems.reduce((sum, item) => sum + parseFloat(item.price), 0);

  // ✅ Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/api/customers");
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  // ✅ Autofill form when selecting existing customer
  const handleCustomerSelect = (customerId) => {
    const customer = customers.find((c) => c.id.toString() === customerId);
    if (customer) {
      setSelectedCustomer(customer.id);
      setForm({
        first_name: customer.first_name,
        last_name: customer.last_name,
        address: customer.address,
        contact_number: customer.contact_number,
        social_handle: customer.social_handle,
      });
    }
  };

  // ✅ Place Order Handler
  const handlePlaceOrder = async () => {
    const newErrors = {};

    if (orderItems.length === 0) {
      newErrors.orderItems = "Please add at least one item.";
    }

    ["first_name", "last_name", "address", "contact_number", "social_handle"].forEach(
      (field) => {
        const value = form[field];
        if (!value) {
          newErrors[field] = `${field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())} is required`;
        }
        if (field === "social_handle" && !/^https?:\/\/.+/.test(value)) {
          newErrors[field] =
            "Social handle must be a valid URL starting with http or https";
        }
      }
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const customerPayload = { ...form };
      let customerId = selectedCustomer;

      if (selectedCustomer) {
        await api.put(`/api/customers/${selectedCustomer}`, customerPayload);
      } else {
        const res = await api.post("/api/customers", customerPayload);
        customerId = res.data.id;
      }

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
    } catch (err) {
      console.error(err);
      alert("Order failed. Check console.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <PageHeader title="Add Order" showBack />

      {/* ✅ Search Customer Dropdown */}
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

      {/* ✅ Customer Info Form */}
      {["first_name", "last_name", "address", "contact_number", "social_handle"].map(
        (field) => (
          <TextInput
            key={field}
            label={field
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())}
            required
            value={form[field]}
            onChange={(e) => {
              let value = e.target.value;
              if (field === "contact_number") {
                value = value.replace(/\D/g, "");
                if (value.length > 11) return;
              }
              setForm({ ...form, [field]: value });
            }}
            mt="sm"
            error={errors[field]}
          />
        )
      )}

      {/* ✅ Order Summary */}
      <Card shadow="sm" padding="lg" radius="md" mt="lg" withBorder>
        <Text fw={700} size="lg" mb="sm">
          Order Summary
        </Text>

        {orderItems.length === 0 ? (
          <Text color="dimmed">No items in this order.</Text>
        ) : (
          <Table
            withColumnBorders
            highlightOnHover
            striped
            stickyHeader
            stickyHeaderOffset={60}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th>Price (₱)</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {orderItems.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td>₱{item.price}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>

            <Table.Tfoot>
              <Table.Tr>
                <Table.Th>Total</Table.Th>
                <Table.Th>₱{total.toFixed(2)}</Table.Th>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        )}
      </Card>

      {/* ✅ Confirm Order Button */}
      <Button fullWidth mt="md" onClick={handlePlaceOrder}>
        Place Order
      </Button>

      {/* ✅ Invoice Preview Modal */}
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

export default ConfirmOrder;
