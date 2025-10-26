import { create } from "zustand";
import api from "../api/axios";

export const useItemStore = create((set, get) => ({
    items: {},
    versions: {},
    loading: false,

    fetchItems: async(collectionId) => {
        const existing = get().items[collectionId];
        const currentVersion = get().versions[collectionId] || 0;

        if (existing && existing.length > 0 && currentVersion === get().versions[collectionId]) {
            return;
        }

        set({ loading: true });
        try {
            const res = await api.get(`/items?collection_id=${collectionId}`);
            const sorted = res.data.sort((a, b) => {
                if (a.status === "Available" && b.status !== "Available") return -1;
                if (a.status !== "Available" && b.status === "Available") return 1;
                return 0;
            });

            set((state) => ({
                items: {...state.items, [collectionId]: sorted },
                versions: {...state.versions, [collectionId]: (state.versions[collectionId] || 0) + 1 },
            }));
        } catch (err) {
            console.error("Error fetching items:", err);
        } finally {
            set({ loading: false });
        }
    },

    addItem: (collectionId, newItem) =>
        set((state) => ({
            items: {
                ...state.items,
                [collectionId]: [newItem, ...(state.items[collectionId] || [])],
            },
            versions: {...state.versions, [collectionId]: (state.versions[collectionId] || 0) + 1 },
        })),

    updateItem: (collectionId, updatedItem) =>
        set((state) => ({
            items: {
                ...state.items,
                [collectionId]: state.items[collectionId].map((item) =>
                    item.id === updatedItem.id ? updatedItem : item
                ),
            },
            versions: {...state.versions, [collectionId]: (state.versions[collectionId] || 0) + 1 },
        })),

    removeItem: (collectionId, itemId) =>
        set((state) => ({
            items: {
                ...state.items,
                [collectionId]: state.items[collectionId].filter((item) => item.id !== itemId),
            },
            versions: {...state.versions, [collectionId]: (state.versions[collectionId] || 0) + 1 },
        })),
}));