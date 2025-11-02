// import { create } from "zustand";
// import api from "../api/axios";

// export const orderStore = create((set, get) => ({
//     orders: [],
//     version: 0,
//     loading: false,

//     fetchOrders: async() => {
//         const currentVersion = get().version;

//         set({ loading: true });
//         try {
//             const res = await api.get("/orders");
//             const fetchedOrders = res.data;

//             const hasChanges =
//                 fetchedOrders.length !== get().orders.length ||
//                 fetchedOrders.some((fOrder) => {
//                     const existing = get().orders.find((o) => o.id === fOrder.id);
//                     return JSON.stringify(existing) !== JSON.stringify(fOrder);
//                 });

//             if (hasChanges) {
//                 set({
//                     orders: fetchedOrders,
//                     version: currentVersion + 1,
//                 });
//             }
//         } catch (err) {
//             console.error("Error fetching orders:", err);
//         } finally {
//             set({ loading: false });
//         }
//     },

//     addOrder: (newOrder) =>
//         set((state) => ({
//             orders: [newOrder, ...state.orders],
//             version: state.version + 1,
//         })),

//     updateOrder: (updatedOrder) =>
//         set((state) => ({
//             orders: state.orders.map((order) =>
//                 order.id === updatedOrder.id ? {...order, ...updatedOrder } : order
//             ),
//             version: state.version + 1,
//         })),

//     removeOrder: (id) =>
//         set((state) => ({
//             orders: state.orders.filter((order) => order.id !== id),
//             version: state.version + 1,
//         })),
// }));