import React, { useState } from "react";
import { Modal, TextInput, Button, Select, Group, Table } from "@mantine/core";
import axios from "axios";

const AddOrderModal = ({ collections, onOrderPlaced }) => {
  const [opened, setOpened] = useState(false);
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

  const handleAddItem = () => {
    if (!selectedItem) return;
    const item = collections
      .flatMap((c) => c.items)
      .find((i) => i.name === selectedItem);
    if (item) {
      setOrderItems([...orderItems, item]);
      setSelectedItem("");
    }
  };

  const total = orderItems.reduce((sum, item) => sum + item.price, 0);

  const handlePlaceOrder = async () => {
    try {
      const payload = {
        invoice: { customer_name: form.first_name + " " + form.last_name },
        orders: [
          {
            ...form,
            items: orderItems.map((item) => ({
              product_id: item.id,
              product_name: item.name,
              price: item.price,
              quantity: 1,
            })),
          },
        ],
      };

      const response = await axios.post("/api/orders", payload, {
        headers: { "Content-Type": "application/json" },
      });

      // Show invoice summary modal
      alert(`Invoice Created: ${response.data.invoice_ref}`);
      onOrderPlaced();
      setOpened(false);
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  return (
    <>
      <Button onClick={() => setOpened(true)}>Add Order</Button>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Add Order"
        closeOnClickOutside
        size="lg"
      >
        <Group align="center" mb="md">
          <Select
            label="Collections"
            data={collections.map((c) => c.name)}
            value={selectedCollection}
            onChange={setSelectedCollection}
          />
          <Select
            label="Items"
            data={
              collections
                .find((c) => c.name === selectedCollection)
                ?.items.map((i) => i.name) || []
            }
            value={selectedItem}
            onChange={setSelectedItem}
          />
          <Button onClick={handleAddItem}>Add</Button>
        </Group>

        <Table withBorder highlightOnHover>
          <tbody>
            {orderItems.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>₱{item.price}</td>
              </tr>
            ))}
            <tr>
              <td><b>Total</b></td>
              <td><b>₱{total}</b></td>
            </tr>
          </tbody>
        </Table>

        <TextInput
          label="First Name"
          required
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
        />
        <TextInput
          label="Last Name"
          required
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
        />
        <TextInput
          label="Address"
          required
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <TextInput
          label="Contact Number"
          value={form.contact_number}
          onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
        />
        <TextInput
          label="Social Media Link"
          value={form.social_handle}
          onChange={(e) => setForm({ ...form, social_handle: e.target.value })}
        />

        <Button fullWidth mt="md" onClick={handlePlaceOrder}>
          Place Order
        </Button>
      </Modal>
    </>
  );
};

export default AddOrderModal;
