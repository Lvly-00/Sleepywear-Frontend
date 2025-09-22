import React, { useRef } from "react";
import { Card, Text, Title, Button, Divider, Group, Stack } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";
import jsPDF from "jspdf";

const InvoicePreview = ({ data }) => {
  const invoiceRef = useRef();

  const downloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Invoice", 14, 20);

    doc.setFontSize(12);
    doc.text(`Customer: ${data.full_name}`, 14, 40);
    doc.text(`Address: ${data.address}`, 14, 50);
    doc.text(`Contact: ${data.contact_number}`, 14, 60);
    doc.text(`Social Media: ${data.social_media}`, 14, 70);

    doc.text("Items:", 14, 90);
    let yPos = 100;
    data.items?.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.name} (x${item.qty})`, 20, yPos);
      yPos += 10;
    });

    doc.text(`Courier: ${data.courier}`, 14, yPos + 10);
    doc.text(`Delivery Fee: ${data.delivery_fee}`, 14, yPos + 20);

    doc.save(`Invoice_${data.full_name}.pdf`);
  };

  return (
    <Card shadow="sm" padding="lg" ref={invoiceRef} withBorder>
      <Stack spacing="sm">
        <Title order={3}>Invoice</Title>
        <Divider />
        <Text><strong>Customer:</strong> {data.full_name}</Text>
        <Text><strong>Address:</strong> {data.address}</Text>
        <Text><strong>Contact:</strong> {data.contact_number}</Text>
        <Text>
          <strong>Social Media:</strong>{" "}
          <a href={data.social_media} target="_blank" rel="noreferrer">
            {data.social_media}
          </a>
        </Text>
        <Divider my="sm" />
        <Text><strong>Items:</strong></Text>
        {data.items?.length > 0 ? (
          data.items.map((item, i) => (
            <Text key={i}>
              {i + 1}. {item.name} (x{item.qty})
            </Text>
          ))
        ) : (
          <Text color="dimmed">No items added</Text>
        )}
        <Divider my="sm" />
        <Text><strong>Courier:</strong> {data.courier}</Text>
        <Text><strong>Delivery Fee:</strong> {data.delivery_fee}</Text>

        <Group position="right" mt="md">
          <Button leftIcon={<IconDownload size={16} />} onClick={downloadInvoice}>
            Download Invoice
          </Button>
        </Group>
      </Stack>
    </Card>
  );
};

export default InvoicePreview;
