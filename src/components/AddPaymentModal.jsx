import React, { useState, useEffect } from "react";
import {
  Stack,
  Select,
  Button,
  Modal,
  Text,
  Group,
} from "@mantine/core";
import api from "../api/axios";

const AddPaymentModal = ({ opened, onClose, order, onOrderUpdated }) => {
  const [payment, setPayment] = useState({
    method: "",
    additionalFee: 0,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (opened) {
      setPayment({ method: "", additionalFee: 0 });
      setErrors({});
      setSubmitting(false);
    }
  }, [opened, order]);

  const savePayment = async () => {
    // Prevent double clicks
    if (submitting) return;

    const newErrors = {};
    if (!payment.method) newErrors.paymentMethod = "Please select a payment method";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Do NOT set submitting to true if validation failed
      return;
    }

    // Disable UI
    setSubmitting(true);

    try {
      const totalAmount =
        Number(order?.total || 0) + Number(payment.additionalFee || 0);

      const payload = {
        payment_method: payment.method,
        total: totalAmount,
        payment_status: "Paid",
        additional_fee: payment.additionalFee || 0,
      };

      await api.post(`/orders/${order.id}/payments`, payload);

      const updatedOrderRes = await api.get(`/orders/${order.id}`);
      if (onOrderUpdated) onOrderUpdated(updatedOrderRes.data);

      onClose();
    } catch (err) {
      console.error("Error saving payment:", err);
      alert("Failed to save payment.");
    } finally {
      // Re-enable UI
      setSubmitting(false);
    }
  };

  return (
    <Modal.Root
      opened={opened}
      onClose={!submitting ? onClose : undefined}
      centered
    >
      <Modal.Overlay />
      <Modal.Content style={{ borderRadius: "16px", padding: "20px" }}>
        <Modal.Header
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Modal.CloseButton
            size={35}
            disabled={submitting}
            style={{ marginRight: "1rem", color: "#AB8262" }}
          />
          <Modal.Title style={{ flex: 1 }}>
            <Text align="center" color="black" style={{ fontSize: "26px", fontWeight: "600" }}>
              Add Payment
            </Text>
          </Modal.Title>
          <div style={{ width: 36 }} />
        </Modal.Header>

        <Modal.Body>
          <Stack spacing="sm">
            <Text
              align="center"
              color="#5D4324"
              style={{ fontSize: "46px", fontWeight: "600" }}
            >
              ₱{Math.floor(order?.total || 0).toLocaleString("en-PH")}
            </Text>

            <Select
              label="Mode of Payment"
              placeholder="Select"
              data={["Cash", "GCash", "Paypal", "Bank"]}
              value={payment.method}
              error={errors.paymentMethod}
              onChange={(value) => setPayment({ ...payment, method: value })}
              required
              disabled={submitting}
            />

            <Group mt="lg" style={{ justifyContent: "flex-end" }}>
              <Button
                color="#AB8262"
                style={{ borderRadius: "15px", width: "110px", fontSize: "16px" }}
                onClick={savePayment}
                disabled={submitting} // Disabled, no loader
              >
                Submit
              </Button>
            </Group>
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default AddPaymentModal;