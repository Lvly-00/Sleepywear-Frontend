import React from "react";
import { showNotification } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

const NotifySuccess = {
  addedItem: () =>
    showNotification({
      title: "Success",
      message: "Item added successfully!",
      color: "teal",
      icon: <IconCheck size={20} />,
      autoClose: 4000,
      radius: "md",
      disallowClose: false,
      styles: (theme) => ({
        root: {
          boxShadow: theme.shadows.md,
          borderColor: theme.colors.teal[6],
          fontWeight: 600,
          fontFamily: "'League Spartan', sans-serif",
        },
        title: {
          color: theme.colors.teal[9],
          fontWeight: 700,
          fontSize: 20,
        },
        description: {
          color: theme.colors.teal[6],
          fontWeight: 400,
        },
        closeButton: {
          color: theme.colors.teal[6],
        },
      }),
    }),

  editedItem: () =>
    showNotification({
      title: "Updated",
      message: "Item updated successfully!",
      color: "blue",
      icon: <IconCheck size={20} />,
      autoClose: 4000,
      radius: "md",
      disallowClose: false,
      styles: (theme) => ({
        root: {
          boxShadow: theme.shadows.md,
          borderColor: theme.colors.blue[6],
          fontWeight: 600,
          fontFamily: "'League Spartan', sans-serif",
        },
        title: {
          color: theme.colors.blue[9],
          fontWeight: 700,
          fontSize: 20,
        },
        description: {
          color: theme.colors.blue[8],
          fontWeight: 400,
        },
        closeButton: {
          color: theme.colors.blue[6],
        },
      }),
    }),

  addedCollection: () =>
    showNotification({
      title: "Success",
      message: "Collection added successfully!",
      color: "teal",
      icon: <IconCheck size={20} />,
      radius: "md",
      disallowClose: false,
      styles: (theme) => ({
        root: {
          boxShadow: theme.shadows.md,
          borderColor: theme.colors.teal[6],
          fontWeight: 600,
          fontFamily: "'League Spartan', sans-serif",
        },
        title: {
          color: theme.colors.teal[9],
          fontWeight: 700,
          fontSize: 20,
        },
        description: {
          color: theme.colors.teal[6],
          fontWeight: 400,
        },
        closeButton: {
          color: theme.colors.teal[6],
        },
      }),
    }),

  editedCollection: () =>
    showNotification({
      title: "Updated",
      message: "Collection updated successfully!",
      color: "blue",
      icon: <IconCheck size={20} />,
      autoClose: 4000,
      radius: "md",
      disallowClose: false,
      styles: (theme) => ({
        root: {
          boxShadow: theme.shadows.md,
          borderColor: theme.colors.blue[6],
          fontWeight: 600,
          fontFamily: "'League Spartan', sans-serif",
        },
        title: {
          color: theme.colors.blue[9],
          fontWeight: 700,
          fontSize: 20,
        },
        description: {
          color: theme.colors.blue[8],
          fontWeight: 400,
        },
        closeButton: {
          color: theme.colors.blue[6],
        },
      }),
    }),

  addedOrder: () =>
    showNotification({
      title: "Success",
      message: "Order added successfully!",
      color: "teal",
      icon: <IconCheck size={20} />,
      autoClose: 4000,
      radius: "md",
      disallowClose: false,
      styles: (theme) => ({
        root: {
          boxShadow: theme.shadows.md,
          borderColor: theme.colors.teal[6],
          fontWeight: 600,
          fontFamily: "'League Spartan', sans-serif",
        },
        title: {
          color: theme.colors.teal[9],
          fontWeight: 700,
          fontSize: 20,
        },
        description: {
          color: theme.colors.teal[6],
          fontWeight: 400,
        },
        closeButton: {
          color: theme.colors.teal[6],
        },
      }),
    }),

  addedPayment: () =>
    showNotification({
      title: "Success",
      message: "Payment added successfully!",
      color: "teal",
      icon: <IconCheck size={20} />,
      autoClose: 4000,
      radius: "md",
      disallowClose: false,
      styles: (theme) => ({
        root: {
          boxShadow: theme.shadows.md,
          borderColor: theme.colors.teal[6],
          fontWeight: 600,
          fontFamily: "'League Spartan', sans-serif",
        },
        title: {
          color: theme.colors.teal[9],
          fontWeight: 700,
          fontSize: 20,
        },
        description: {
          color: theme.colors.teal[6],
          fontWeight: 400,
        },
        closeButton: {
          color: theme.colors.teal[6],
        },
      }),
    }),

  deleted: () =>
    showNotification({
      title: "Deleted",
      message: "Deleted successfully!",
      color: "red",
      icon: <IconCheck size={20} />,
      autoClose: 4000,
      radius: "md",
      disallowClose: false,
      styles: (theme) => ({
        root: {
          boxShadow: theme.shadows.md,
          borderColor: theme.colors.red[6],
          fontWeight: 600,
          fontFamily: "'League Spartan', sans-serif",
        },
        title: {
          color: theme.colors.red[9],
          fontWeight: 700,
          fontSize: 20,
        },
        description: {
          color: theme.colors.red[8],
          fontWeight: 400,
        },
        closeButton: {
          color: theme.colors.red[6],
        },
      }),
    }),
};

export default NotifySuccess;
