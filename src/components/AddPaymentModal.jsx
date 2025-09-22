import React, { useState } from "react";
import { Stack, Select, NumberInput, FileInput, Button } from "@mantine/core";
import api from "../api/axios";

const AddPaymentModal = ({ order, onClose, refreshOrders }) => {
  const [payment, setPayment] = useState({
    method: "",
    image: null,
    total: order?.total || 0,
  });

  const savePayment = async () => {
    if (!payment.method) {
      alert("Please select a payment method");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("payment_method", payment.method);
      formData.append("total_paid", payment.total);

      if (payment.image) {
        formData.append("payment_image", payment.image);
      }

      await api.post(`/api/orders/${order.id}/payment`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (refreshOrders) refreshOrders();
      onClose();
    } catch (err) {
      console.error("Error saving payment:", err);
      alert("Failed to save payment. Check console for details.");
    }
  };

  return (
    <Stack>
      <Select
        label="Payment Method"
        placeholder="Select method"
        data={["Cash", "GCash"]}
        value={payment.method}
        onChange={(value) => setPayment({ ...payment, method: value })}
      />

      <FileInput
        label="Payment Proof (Upload Image)"
        placeholder="Choose file"
        accept="image/*"
        onChange={(file) => setPayment({ ...payment, image: file })}
      />

      <NumberInput
        label="Total Amount"
        value={payment.total}
        onChange={(value) => setPayment({ ...payment, total: value || 0 })}
        min={0}
      />

      <Button mt="md" onClick={savePayment}>
        Save Payment
      </Button>
    </Stack>
  );
};

export default AddPaymentModal;
