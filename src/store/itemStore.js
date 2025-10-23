import { create } from "zustand";
import api from "../api/axios";

export const useItemStore = create((set, get) => ({
    items: {},
    loading: false,

    fetchItems: async(collectionId) => {
        const existing = get().items[collectionId];
        if (existing && existing.length > 0) return;

        set({ loading: true });
        try {
            const res = await api.get(`/items?collection_id=${collectionId}`);
            const sorted = res.data.sort((a, b) => {
                if (a.status === "available" && b.status !== "available") return -1;
                if (a.status !== "available" && b.status === "available") return 1;
                return 0;
            });

            set((state) => ({
                items: {
                    ...state.items,
                    [collectionId]: sorted,
                },
            }));
        } catch (err) {
            console.error("Error fetching items:", err);
        } finally {
            set({ loading: false });
        }
    },

    // Add new item instantly
    addItem: (collectionId, newItem) =>
        set((state) => ({
            items: {
                ...state.items,
                [collectionId]: [newItem, ...(state.items[collectionId] || [])],
            },
        })),

    // Update item instantly
    updateItem: (collectionId, updatedItem) =>
        set((state) => ({
            items: {
                ...state.items,
                [collectionId]: state.items[collectionId].map((item) =>
                    item.id === updatedItem.id ? updatedItem : item
                ),
            },
        })),

    // Delete item instantly
    removeItem: (collectionId, itemId) =>
        set((state) => ({
            items: {
                ...state.items,
                [collectionId]: state.items[collectionId].filter(
                    (item) => item.id !== itemId
                ),
            },
        })),
}));