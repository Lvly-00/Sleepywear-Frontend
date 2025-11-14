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
  const [loading, setLoading] = useState(false); // <-- Add loading state

  useEffect(() => {
    if (opened) {
      setPayment({ method: "", additionalFee: 0 });
      setErrors({});
      setLoading(false); // reset loading when modal opens
    }
  }, [opened, order]);

  const savePayment = async () => {
    const newErrors = {};
    if (!payment.method) newErrors.paymentMethod = "Please select a payment method";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true); // <-- disable button

    try {
      const totalAmount = Number(order?.total || 0) + Number(payment.additionalFee || 0);

      const payload = {
        payment_method: payment.method,
        total: totalAmount,
        payment_status: "Paid",
        additional_fee: payment.additionalFee || 0,
      };

      await api.post(`/orders/${order.id}/payment`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      // Refresh order
      const updatedOrderRes = await api.get(`/orders/${order.id}`);
      if (onOrderUpdated) onOrderUpdated(updatedOrderRes.data);

      onClose();
    } catch (err) {
      console.error("Error saving payment:", err);
      alert("Failed to save payment. Check console for details.");
      setLoading(false); // <-- re-enable button if error occurs
    }
  };

  return (
    <Modal.Root opened={opened} onClose={onClose} centered>
      <Modal.Overlay />
      <Modal.Content style={{ borderRadius: "16px", padding: "20px" }}>
        <Modal.Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Modal.CloseButton size={35} style={{ order: 0, marginRight: "1rem", color: "#AB8262" }} />
          <Modal.Title style={{ flex: 1 }}>
            <Text align="center" color="black" style={{ width: "100%", fontSize: "26px", fontWeight: "600" }}>
              Add Payment
            </Text>
          </Modal.Title>
          <div style={{ width: 36 }} />
        </Modal.Header>

        <Modal.Body>
          <Stack spacing="sm">
            <Text weight={500} align="center" color="#5D4324" style={{ width: "100%", fontSize: "46px", fontWeight: "600" }}>
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
            />

            <Group mt="lg" style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
              <Button
                color="#AB8262"
                style={{ borderRadius: "15px", width: "110px", fontSize: "16px" }}
                onClick={savePayment}
                disabled={loading} // <-- disable while loading
              >
                {loading ? "Submitting..." : "Submit"} {/* optional text change */}
              </Button>
            </Group>
          </Stack>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default AddPaymentModal;
