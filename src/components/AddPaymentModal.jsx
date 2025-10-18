import React, { useState } from "react";
import { Stack, Select, NumberInput, FileInput, Button, Modal, Text, Group } from "@mantine/core";
import api from "../api/axios";

const AddPaymentModal = ({ opened, onClose, order, refreshOrders }) => {
  const [payment, setPayment] = useState({
    method: "",
    image: null,
    total: order?.total || 0,
  });
  const [errors, setErrors] = useState({});

  const savePayment = async () => {
    const newErrors = {};

    if (!payment.method) {
      newErrors.paymentMethod = "Please select a payment method";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("payment_method", payment.method);
      formData.append("total_paid", payment.total);
      formData.append("payment_status", "paid");

      if (payment.image) formData.append("payment_image", payment.image);

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
    <Modal.Root opened={opened} onClose={onClose} centered>
      <Modal.Overlay />
      <Modal.Content
        style={{
          borderRadius: "16px",
          padding: "20px",

        }}
      >
        <Modal.Header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >

          <Modal.CloseButton
            size={35}
            style={{
              order: 0,
              marginRight: "1rem",
              color: "#AB8262",
            }}
          />


          <Modal.Title style={{ flex: 1 }}>
            <Text
              align="center"
              color="black"
              style={{
                width: "100%",
                fontSize: "26px",
                fontWeight: "600"
              }}
            >
              Add Payment
            </Text>
          </Modal.Title>

          <div style={{ width: 36 }} />
        </Modal.Header>


        <Modal.Body>
          <Stack spacing="sm">
            <Text weight={500} align="center" color="#5D4324"
              style={{
                width: "100%",
                fontSize: "46px",
                fontWeight: "600"
              }}>
              ₱{Math.floor(payment.total).toLocaleString("en-PH")}
            </Text>

            <Select
              label="Mode of Payment"
              placeholder="SELECT "
              data={["Cash", "GCash", "Paypal", "Bank"]}
              value={payment.method}
              error={errors.paymentMethod}
              onChange={(value) => setPayment({ ...payment, method: value })}
              required

            />


            <NumberInput
              label="Total Amount Paid"
              // value={payment.total}
              onChange={(value) => setPayment({ ...payment, total: value || 0 })}
              min={0}
            // readOnly
            />

            {/* <FileInput
              label="Payment Proof (Upload Image)"
              placeholder="Choose file"
              accept="image/*"
              onChange={(file) => setPayment({ ...payment, image: file })}
            /> */}

            <Group mt="lg"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
              }}>
              <Button
                color="#AB8262"
                style={{
                  borderRadius: "15px",
                  width: "110px",
                  fontSize: "16px"
                }}
                onClick={savePayment}>
                Submit
              </Button>
            </Group>

          </Stack>



        </Modal.Body>
      </Modal.Content>
    </Modal.Root >
  );
};

export default AddPaymentModal;
