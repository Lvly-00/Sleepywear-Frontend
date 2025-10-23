// src/store/collectionStore.js
import { create } from "zustand";
import api from "../api/axios";

export const useCollectionStore = create((set, get) => ({
    collections: [],
    loading: false,

    fetchCollections: async() => {
        set({ loading: true });
        try {
            const res = await api.get("/collections");
            const sorted = res.data.sort((a, b) => {
                if (a.status === "Active" && b.status !== "Active") return -1;
                if (a.status !== "Active" && b.status === "Active") return 1;
                return 0;
            });
            set({ collections: sorted });
            get().checkAndUpdateStatus(sorted);
        } catch (err) {
            console.error("Error fetching collections:", err);
        } finally {
            set({ loading: false });
        }
    },

    // ✅ Check and auto-update status based on stock_qty
    checkAndUpdateStatus: async(collections) => {
        for (const col of collections) {
            let newStatus =
                col.stock_qty <= 0 ? "Sold Out" : "Active";

            if (col.status !== newStatus) {
                try {
                    await api.put(`/collections/${col.id}`, {...col, status: newStatus });
                    set((state) => ({
                        collections: state.collections.map((c) =>
                            c.id === col.id ? {...c, status: newStatus } : c
                        ),
                    }));
                } catch (err) {
                    console.error(`Failed to update status for ${col.name}:`, err);
                }
            }
        }
    },

    addCollection: (newCollection) =>
        set((state) => ({
            collections: [newCollection, ...state.collections],
        })),

    updateCollection: (updatedCollection) => {
        set((state) => {
            const updatedCollections = state.collections.map((c) =>
                c.id === updatedCollection.id ? {...c, ...updatedCollection } : c
            );

            // ✅ Automatically recheck status after any update
            get().checkAndUpdateStatus(updatedCollections);

            return { collections: updatedCollections };
        });
    },

    removeCollection: (id) =>
        set((state) => ({
            collections: state.collections.filter((col) => col.id !== id),
        })),
}));