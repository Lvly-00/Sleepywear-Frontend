import React, { useRef, useEffect, useState } from "react";
import { Modal, Text, Table, Button, Group } from "@mantine/core";
import html2canvas from "html2canvas";

const InvoicePreview = ({ opened, onClose, invoiceData }) => {
  const invoiceRef = useRef();
  const [invoice, setInvoice] = useState(null);

  // Update state when invoiceData changes
  useEffect(() => {
    if (invoiceData) {
      setInvoice(invoiceData);
    }
  }, [invoiceData]);

  if (!invoice) return null;

  const downloadInvoiceImage = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const link = document.createElement("a");
    link.download = `Invoice_${invoice.customer_name}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Invoice Preview"
      size="lg"
      centered
    >
      <div
        ref={invoiceRef}
        style={{ padding: "1rem", backgroundColor: "#fff" }}
      >
        <Text>
          <b>Customer Name:</b> {`${invoice.first_name} ${invoice.last_name}`}
        </Text>

        <Text>
          <b>Address:</b> {invoice.address}
        </Text>
        <Text>
          <b>Contact No:</b> {invoice.contact_number}
        </Text>
        <Text>
          <b>Social Media:</b> {invoice.social_handle}
        </Text>

        <Table withBorder mt="md">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Quantity</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx}>
                <td>{item.item_name}</td>
                <td>{item.quantity}</td>
                <td>₱{item.price}</td>
              </tr>
            ))}
            <tr>
              <td>
                <b>Total</b>
              </td>
              <td></td>
              <td>
                <b>₱{invoice.total.toFixed(2)}</b>
              </td>
            </tr>
          </tbody>
        </Table>

        <Text mt="md" weight={500}>
          Payment Details:
        </Text>
        {invoice.payment_status &&
        invoice.payment_status.toLowerCase() === "paid" ? (
          <>
            <Text>
              Mode of Payment: {invoice.payment_method || "Not provided"}
            </Text>
            <Text>Payment Status: {invoice.payment_status}</Text>
            <Text>
              Payment Date:{" "}
              {invoice.payment_date
                ? new Date(invoice.payment_date).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "Not provided"}
            </Text>
          </>
        ) : (
          <>
            <Text>Gcash: 0932364671</Text>
            <Text>Checkout Link: https://ph.shp.ee/V6guXb6</Text>
          </>
        )}
      </div>

      <Group mt="md">
        <Button onClick={downloadInvoiceImage}>Download as PNG</Button>
        <Button onClick={onClose}>Close</Button>
      </Group>
    </Modal>
  );
};

export default InvoicePreview;
