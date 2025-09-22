import React, { useState } from "react";
import { TextInput, Button, Stack, Select } from "@mantine/core";
import api from "../api/axios";

const AddPaymentModal = ({ order, onClose }) => {
  const [payment, setPayment] = useState({
    method: "",
    image: "",
    total: "",
    status: "Pending",
  });

  const savePayment = async () => {
    try {
      await api.post(`/api/orders/${order.id}/payment`, payment);
      onClose();
    } catch (err) {
      console.error("Error saving payment:", err);
    }
  };

  return (
    <Stack>
      <Select
        label="Payment Method"
        data={["GCash", "Cash"]}
        onChange={(value) => setPayment({ ...payment, method: value })}
      />
      <TextInput label="Payment Image URL" onChange={(e) => setPayment({ ...payment, image: e.target.value })} />
      <TextInput label="Total Amount" onChange={(e) => setPayment({ ...payment, total: e.target.value })} />
      <Button mt="md" onClick={savePayment}>Save Payment</Button>
    </Stack>
  );
};

export default AddPaymentModal;
