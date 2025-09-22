import React, { useState } from "react";
import { Stepper, Button, TextInput, Group, Stack } from "@mantine/core";
import api from "../api/axios";
import InvoicePreview from "../components/InvoicePreview";

const AddOrderModal = ({ refreshOrders }) => {
  const [active, setActive] = useState(0);
  const [formData, setFormData] = useState({
    full_name: "",
    address: "",
    contact_number: "",
    social_media: "",
    items: [],
    courier: "",
    delivery_fee: 0,
  });
  const [showInvoice, setShowInvoice] = useState(false);

  const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const placeOrder = async () => {
    try {
      await api.post("/api/orders", formData);
      setShowInvoice(true);
      refreshOrders();
    } catch (err) {
      console.error("Error placing order:", err);
    }
  };

  return (
    <Stack>
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Shipping Info">
          <TextInput label="Full Name" onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
          <TextInput label="Address" onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
          <TextInput label="Contact Number" onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} />
          <TextInput label="Social Media Link" onChange={(e) => setFormData({ ...formData, social_media: e.target.value })} />
        </Stepper.Step>
        <Stepper.Step label="Order Details">
          <TextInput label="Courier" onChange={(e) => setFormData({ ...formData, courier: e.target.value })} />
          <TextInput label="Delivery Fee" onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })} />
        </Stepper.Step>
        <Stepper.Step label="Invoice">
          {showInvoice ? <InvoicePreview data={formData} /> : <p>Click 'Place Order' to generate invoice</p>}
        </Stepper.Step>
      </Stepper>

      <Group position="right" mt="md">
        {active > 0 && <Button onClick={prevStep}>Back</Button>}
        {active < 2 && <Button onClick={nextStep}>Next</Button>}
        {active === 2 && <Button color="green" onClick={placeOrder}>Place Order</Button>}
      </Group>
    </Stack>
  );
};

export default AddOrderModal;
