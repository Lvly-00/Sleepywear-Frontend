import React, { useRef, useEffect, useState } from "react";
import {
  Modal,
  Text,
  Table,
  Button,
  Group,
  Divider,
  Image,
  ScrollArea,
} from "@mantine/core";
import html2canvas from "html2canvas";
import BrownLogo from "../assets/BrownLogo.svg";
import { Icons } from "../components/Icons";

const InvoicePreview = ({ opened, onClose, invoiceData }) => {
  const invoiceRef = useRef();
  const [invoice, setInvoice] = useState(null);

  // ✅ Normalize invoice data once received
  useEffect(() => {
    if (invoiceData) {
      setInvoice({
        ...invoiceData,
        display_name:
          invoiceData.customer_name ||
          `${invoiceData.first_name || ""} ${invoiceData.last_name || ""}`.trim(),
      });
    }
  }, [invoiceData]);

  if (!invoice) return null;

  const downloadInvoiceImage = async () => {
    if (!invoiceRef.current) return;

    const originalStyles = {
      maxHeight: invoiceRef.current.style.maxHeight,
      overflow: invoiceRef.current.style.overflow,
      padding: invoiceRef.current.style.padding,
    };

    invoiceRef.current.style.maxHeight = "none";
    invoiceRef.current.style.overflow = "visible";
    invoiceRef.current.style.padding = "40px";

    const contentWidth = invoiceRef.current.scrollWidth;
    const contentHeight = invoiceRef.current.scrollHeight;
    const dynamicScale =
      contentHeight > 2000
        ? Math.max(1.5, 2.5 - contentHeight / 4000)
        : 2;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: dynamicScale,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollX: 0,
      scrollY: 0,
      windowWidth: contentWidth,
      windowHeight: contentHeight,
    });

    Object.assign(invoiceRef.current.style, originalStyles);

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `Invoice_${invoice.display_name || "Customer"}.png`;
    link.href = image;
    link.click();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      withCloseButton={false}
      scrollAreaComponent={ScrollArea.Autosize}
      styles={{
        content: {
          borderRadius: "26px",
          overflow: "hidden",
        },
      }}
    >
      {/* Sticky header */}
      <Modal.Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #e0d7ce",
        }}
      >
        {/* Close button */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Modal.CloseButton
            size={35}
            style={{
              color: "#AB8262",
              width: 44,
              height: 44,
            }}
          />
        </div>

        {/* Download button */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Button
            size="md"
            variant="subtle"
            color="#AB8262"
            onClick={downloadInvoiceImage}
            style={{
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 0.2s ease",
            }}
            styles={{
              root: {
                "&:hover": { backgroundColor: "#F2E7DA" },
              },
            }}
          >
            <Icons.Download size={34} />
          </Button>
        </div>
      </Modal.Header>

      <Modal.Body
        style={{
          padding: "1.25rem",
          backgroundColor: "#fff",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <div ref={invoiceRef} style={{ padding: "1rem" }}>
          <Group justify="center" mb="md">
            <Image src={BrownLogo} alt="SleepyWears Logo" maw={300} />
          </Group>

          <Divider mb="xs" />
          <Text>
            <b>Name:</b> {invoice.display_name}
          </Text>
          <Text>
            <b>Address:</b> {invoice.address || "Not provided"}
          </Text>
          <Text>
            <b>Contact No:</b> {invoice.contact_number || "Not provided"}
          </Text>
          <Text>
            <b>Social Media:</b> {invoice.social_handle || "Not provided"}
          </Text>

          <Divider my="md" />

          <Text fw={600} fz="lg" mb="xs">
            Order Items
          </Text>

          <Table
            withBorder
            highlightOnHover
            striped
            stickyHeader
            stickyHeaderOffset={0}
            fontSize="sm"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item Name</Table.Th>
                <Table.Th>Quantity</Table.Th>
                <Table.Th>Price</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {invoice.items.map((item, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td>{item.item_name}</Table.Td>
                  <Table.Td>{item.quantity}</Table.Td>
                  <Table.Td>₱{item.price}</Table.Td>
                </Table.Tr>
              ))}

              {/* ✅ Compute additional fee based on total_paid - total */}
              {Number(invoice.total_paid) > Number(invoice.total) && (
                <Table.Tr>
                  <Table.Td fw={500}>Additional Fee</Table.Td>
                  <Table.Td></Table.Td>
                  <Table.Td fw={500}>
                    ₱
                    {(
                      Number(invoice.total_paid) - Number(invoice.total)
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Table.Td>
                </Table.Tr>
              )}

              {/* ✅ Final Total */}
              <Table.Tr>
                <Table.Td fw={600}>Total</Table.Td>
                <Table.Td></Table.Td>
                <Table.Td fw={600}>
                  ₱
                  {Number(invoice.total_paid || invoice.total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>

          </Table>

          <Divider my="md" />

          <Text fw={600} fz="lg" mb="xs">
            Payment Details
          </Text>

          {invoice.payment_status?.toLowerCase() === "paid" ? (
            <>
              <Text>
                <b>Mode of Payment:</b>{" "}
                {invoice.payment_method || "Not provided"}
              </Text>
              <Text>
                <b>Status:</b> {invoice.payment_status}
              </Text>
              <Text>
                <b>Date:</b>{" "}
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
              <Text>
                <b>GCash:</b> 0932364671
              </Text>
              <Text>
                <b>Checkout Link:</b>{" "}
                <a
                  href="https://ph.shp.ee/V6guXb6"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://ph.shp.ee/V6guXb6
                </a>
              </Text>
            </>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default InvoicePreview;
