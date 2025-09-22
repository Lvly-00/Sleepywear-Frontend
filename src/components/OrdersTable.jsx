import React from "react";
import { Accordion, Table, Button } from "@mantine/core";

const OrdersTable = ({ orders, onAddPayment }) => {
  return (
    <Accordion variant="separated">
      {orders.map((order) => (
        <Accordion.Item value={order.id.toString()} key={order.id}>
          <Accordion.Control>
            {order.full_name} - {order.order_date}
          </Accordion.Control>
          <Accordion.Panel>
            <Table withBorder highlightOnHover>
              <tbody>
                <tr>
                  <td>Address</td>
                  <td>{order.address}</td>
                </tr>
                <tr>
                  <td>Social Media</td>
                  <td>
                    <a href={order.social_media} target="_blank" rel="noreferrer">
                      {order.social_media}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>Items</td>
                  <td>
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.name} (x{item.qty})</div>
                    ))}
                  </td>
                </tr>
              </tbody>
            </Table>
            <Button mt="sm" onClick={() => onAddPayment(order)}>
              Add Payment
            </Button>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
};

export default OrdersTable;
