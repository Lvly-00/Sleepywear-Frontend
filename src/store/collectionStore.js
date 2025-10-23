// src/store/collectionStore.js
import { create } from "zustand";
import api from "../api/axios";

export const useCollectionStore = create((set, get) => ({
    collections: [],
    loading: false,

    fetchCollections: async() => {
        // avoid refetching if already loaded
        if (get().collections.length > 0) return;
        set({ loading: true });
        try {
            const res = await api.get("/collections");
            const sorted = res.data.sort((a, b) => {
                if (a.status === "Active" && b.status !== "Active") return -1;
                if (a.status !== "Active" && b.status === "Active") return 1;
                return 0;
            });
            set({ collections: sorted });
        } catch (err) {
            console.error("Error fetching collections:", err);
        } finally {
            set({ loading: false });
        }
    },

    addCollection: (newCollection) =>
        set((state) => ({
            collections: [newCollection, ...state.collections],
        })),

    updateCollection: (updatedCollection) =>
        set((state) => ({
            collections: state.collections.map((col) =>
                col.id === updatedCollection.id ? {...updatedCollection } : col
            ),
        })),

    removeCollection: (id) =>
        set((state) => ({
            collections: state.collections.filter((col) => col.id !== id),
        })),
}));