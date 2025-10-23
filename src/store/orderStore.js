// src/store/orderStore.js
import { create } from "zustand";
import api from "../api/axios";

export const orderStore = create((set, get) => ({
    orders: [],
    loading: false,

    // 🟢 allow force refresh
    fetchOrders: async(force = false) => {
        if (!force && get().orders.length > 0) return; // Skip unless forced
        set({ loading: true });
        try {
            const res = await api.get("/orders");
            set({ orders: res.data });
        } catch (err) {
            console.error("Error fetching orders:", err);
        } finally {
            set({ loading: false });
        }
    },

    addOrder: (newOrder) =>
        set((state) => ({
            orders: [newOrder, ...state.orders],
        })),

    updateOrder: (updatedOrder) =>
        set((state) => ({
            orders: state.orders.map((order) =>
                order.id === updatedOrder.id ? {...order, ...updatedOrder } : order
            ),
        })),

    removeOrder: (id) =>
        set((state) => ({
            orders: state.orders.filter((order) => order.id !== id),
        })),
}));