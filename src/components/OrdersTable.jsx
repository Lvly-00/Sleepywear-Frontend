import React from "react";
import { Accordion, Table, Button, Badge } from "@mantine/core";

const OrdersTable = ({ orders = [], onAddPayment }) => {
  return (
    <Accordion variant="separated">
      {Array.isArray(orders) && orders.length > 0 ? (
        orders.map((order) => (
          <Accordion.Item value={order.id.toString()} key={order.id}>
            <Accordion.Control>
              {order.full_name || `${order.first_name} ${order.last_name}`} -{" "}
              {new Date(order.order_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Accordion.Control>

            <Accordion.Panel>
              <Table withBorder withColumnBorders highlightOnHover>
                <tbody>
                  <tr>
                    <td>Order Date</td>
                    <td>
                      {new Date(order.order_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td>Address</td>
                    <td>{order.address || "N/A"}</td>
                  </tr>
                  <tr>
                    <td>Social Media</td>
                    <td>
                      {order.social_media ? (
                        <a
                          href={order.social_media}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {order.social_media}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Items</td>
                    <td>
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        order.items.map((item, idx) => (
                          <div key={idx}>
                            {item.name} (x{item.qty})
                          </div>
                        ))
                      ) : (
                        <div>No items</div>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>Total</td>
                    <td>₱{Math.floor(order.total || 0).toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td>Payment Status</td>
                    <td>
                      <Badge
                        color={
                          order.payment_status === "paid" ? "green" : "gray"
                        }
                        radius="lg"
                        size="lg"
                        variant="filled"
                      >
                        {order.payment_status || "unpaid"}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </Table>

              {order.payment_status !== "paid" && (
                <Button mt="sm" color="teal" onClick={() => onAddPayment(order)}>
                  Add Payment
                </Button>
              )}
            </Accordion.Panel>
          </Accordion.Item>
        ))
      ) : (
        <div style={{ padding: "10px", textAlign: "center" }}>
          No orders found.
        </div>
      )}
    </Accordion>
  );
};

export default OrdersTable;
