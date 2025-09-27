import React, { useState } from "react";
import { Stack, Select, NumberInput, FileInput, Button } from "@mantine/core";
import api from "../api/axios";

const AddPaymentModal = ({ order, onClose, refreshOrders }) => {
  const [payment, setPayment] = useState({
    method: "",
    image: null,
    total: order?.total || 0,
  });
  const [errors, setErrors] = useState({});

  const savePayment = async () => {
    const newErrors = {};

    // Validate payment method
    if (!payment.method) {
      newErrors.paymentMethod = "Please select a payment method";
    }
    // Stop if errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("payment_method", payment.method);
      formData.append("total_paid", payment.total);
      formData.append("payment_status", "paid");

      if (payment.image) {
        formData.append("payment_image", payment.image);
      }

      // POST to backend
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
        data={["Cash", "GCash", "Paypal", "Bank"]}
        value={payment.method}
        error={errors.paymentMethod}
        onChange={(value) => setPayment({ ...payment, method: value })}
        required
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
        readOnly
      />

      <Button mt="md" onClick={savePayment}>
        Save Payment
      </Button>
    </Stack>
  );
};

export default AddPaymentModal;
