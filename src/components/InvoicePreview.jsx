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

// Import Fredoka font
import "@fontsource/fredoka/400.css";
import "@fontsource/fredoka/500.css";
import "@fontsource/fredoka/600.css";
import "@fontsource/fredoka/700.css";

const InvoicePreview = ({ opened, onClose, invoiceData }) => {
  const invoiceRef = useRef();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (!invoiceData) return;

    const items = invoiceData.items?.length
      ? invoiceData.items
      : (invoiceData.orders || []).flatMap(order =>
        (order.items || []).map(orderItem => ({
          ...orderItem,
          item: orderItem.item || null,
        }))
      );

    const normalizedInvoice = {
      ...invoiceData,
      display_name:
        invoiceData.customer_name ||
        `${invoiceData.first_name || ""} ${invoiceData.last_name || ""}`.trim(),
      items,
    };

    setInvoice(normalizedInvoice);
    console.log("Invoice state set:", normalizedInvoice);
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
          fontFamily: "Fredoka, sans-serif",
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
          fontFamily: "Fredoka, sans-serif",
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
              fontFamily: "Fredoka, sans-serif",
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
          backgroundColor: "#fff",
          maxHeight: "70vh",
          overflowY: "auto",
          fontFamily: "Fredoka, sans-serif",
        }}
      >
        <div ref={invoiceRef} style={{ padding: "1rem", fontFamily: "Fredoka, sans-serif" }}>
          <Group justify="center" mb="xs">
            <Image src={BrownLogo} alt="SleepyWears Logo" maw={300} />
          </Group>

          <Divider mb="xs" color="#C1A287" />

          <Text
            fw={500}
            mt="md"
            mb="xs"
            color="#AB8262"
            style={{
              fontSize: "20px",
            }}
          >
            Billed To :
          </Text>

          <div
            style={{
              paddingLeft: "1.5rem",
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              rowGap: "4px",
              fontFamily: "Fredoka, sans-serif",
            }}
          >
            <Text fw={500}>Customer Name:</Text>
            <Text>{invoice.display_name}</Text>

            <Text fw={500}>Address:</Text>
            <Text>{invoice.address || "Not provided"}</Text>

            <Text fw={500}>Contact No:</Text>
            <Text>{invoice.contact_number || "Not provided"}</Text>


            <Text fw={500}>Social Media:</Text>
            <Text
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap", // or remove for wrapping
                wordBreak: "break-word", // allows wrapping if needed
                maxWidth: "100%", // ensures it respects grid cell width
              }}
              title={invoice.social_handle} // shows full text on hover
            >
              {invoice.social_handle || "Not provided"}
            </Text>


          </div>

          <Divider mb="md" mt="md" color="#C1A287" />


          <Text
            fw={500}
            mt="md"
            mb="xs"
            color="#AB8262"
            style={{
              fontSize: "20px",
            }}
          >
            Clothes :
          </Text>
          <div style={{ paddingLeft: "1.5rem", marginRight: "1.5rem", marginTop: ".5rem" }}>

            <Table
              stickyHeader
              stickyHeaderOffset={0}
              style={{
                fontFamily: "Fredoka, sans-serif",
                borderCollapse: "separate",
                borderSpacing: "0 8px", // vertical gap between rows
                width: "100%",
              }}
              highlightOnHover={false}
            >
              <Table.Tbody>
                {/* Item rows */}
                {invoice.items.map((item, idx) => (
                  <Table.Tr key={idx} style={{ border: "none" }}>
                    <Table.Td colSpan={3} style={{ border: "none", padding: 0 }}>
                      <div
                        style={{
                          backgroundColor: "#FAF8F3",
                          borderRadius: "12px",
                          padding: "8px 12px",
                          display: "grid",
                          gridTemplateColumns: "1fr 2fr 1fr",
                          alignItems: "center", // vertical center
                        }}
                      >
                        {/* Item code (left aligned) */}
                        <span style={{ textAlign: "left" }}>{item.item?.code || "-"}</span>

                        {/* Item name (left aligned) */}
                        <span style={{ textAlign: "left" }}>{item.item_name}</span>

                        {/* Price (right aligned) */}
                        <span style={{ textAlign: "right", display: "block" }}>
                          ₱ {Math.round(Number(item.price)).toLocaleString()}
                        </span>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ))}

                {/* Additional Fee row with background */}
                {Number(invoice.total_paid) > Number(invoice.total) && (
                  <Table.Tr style={{ border: "none" }}>
                    <Table.Td colSpan={3} style={{ border: "none", padding: 0 }}>
                      <div
                        style={{
                          backgroundColor: "#FAF8F3",
                          borderRadius: "12px",
                          padding: "8px 12px",
                          display: "grid",
                          gridTemplateColumns: "1fr 2fr 1fr",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ textAlign: "left" }}>Additional Fee</span>
                        <span></span>
                        <span style={{ textAlign: "right" }}>
                          ₱ {(Number(invoice.total_paid) - Number(invoice.total)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>


                      </div>
                    </Table.Td>
                  </Table.Tr>
                )}

                {/* Total row (no background) */}
                <Table.Tr style={{ border: "none" }}>
                  <Table.Td
                    style={{ border: "none", padding: "8px 12px", fontSize: "23px", color: "#9B521C" }}
                    fw={500}
                  >
                    TOTAL :
                  </Table.Td>
                  <Table.Td style={{ border: "none", padding: "8px 12px" }}></Table.Td>
                  <Table.Td
                    style={{ border: "none", padding: "8px 12px", fontSize: "23px", textAlign: "right" }}
                    fw={600}
                  >
                    ₱ {Number(invoice.total_paid || invoice.total).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>


          </div>


          <Divider my="md" />

          <Text
            fw={500}
            mt="md"
            mb="xs"
            color="#AB8262"
            style={{ fontSize: "20px" }}
          >
            Payment Details:
          </Text>

          <div
            style={{
              paddingLeft: "1.5rem",
              display: "grid",
              gridTemplateColumns: "200px 1fr",
              rowGap: "4px",
              fontFamily: "Fredoka, sans-serif",
              marginTop: ".5rem",
            }}
          >
            {invoice.payment_status?.toLowerCase() === "paid" ? (
              <>
                <Text fw={500}>Mode of Payment:</Text>
                <Text>{invoice.payment_method || "Not provided"}</Text>

                <Text fw={500}>Status:</Text>
                <Text>{invoice.payment_status}</Text>

                <Text fw={500}>Date:</Text>
                <Text>
                  {invoice.payment_date
                    ? new Date(invoice.payment_date).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "Not provided"}
                </Text>
              </>
            ) : (
              <>
                <Text fw={500}>Gcash Number:</Text>
                <Text>09457409766 - Alyanna Marie Angeles</Text>

                <Text fw={500}>Shopee Checkout :</Text>
                <Text>
                  https://ph.shp.ee/V6guXb
                </Text>
              </>
            )}
          </div>
        </div>

      </Modal.Body>
    </Modal>
  );
};

export default InvoicePreview;
