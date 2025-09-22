import React from "react";
import { Accordion, Table, Button } from "@mantine/core";

const OrdersTable = ({ orders = [], onAddPayment }) => {
  return (
    <Accordion variant="separated">
      {Array.isArray(orders) && orders.length > 0 ? (
        orders.map((order) => (
          <Accordion.Item value={order.id.toString()} key={order.id}>
            <Accordion.Control>
              {order.full_name} - {order.order_date}
            </Accordion.Control>
            <Accordion.Panel>
              <Table withBorder withColumnBorders highlightOnHover>
                <tbody>
                  <tr>
                    <td>Order Date</td>
                    <td>{order.order_date}</td>
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
                </tbody>
              </Table>
              <Button mt="sm" onClick={() => onAddPayment(order)}>
                Add Payment
              </Button>
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
