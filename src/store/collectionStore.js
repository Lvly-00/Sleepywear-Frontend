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
            get().recalculateAndSyncStatus(sorted);
        } catch (err) {
            console.error("Error fetching collections:", err);
        } finally {
            set({ loading: false });
        }
    },

    recalculateAndSyncStatus: async(collections) => {
        for (const col of collections) {
            try {
                const itemsRes = await api.get(`/items?collection_id=${col.id}`);
                const items = itemsRes.data;

                const totalQty = items.length;
                const stockQty = items.filter(i => i.status === "Available").length;

                let newStatus = stockQty <= 0 ? "Sold Out" : "Active";

                if (
                    col.status !== newStatus ||
                    col.qty !== totalQty ||
                    col.stock_qty !== stockQty
                ) {
                    const updatedCol = {
                        ...col,
                        status: newStatus,
                        qty: totalQty,
                        stock_qty: stockQty,
                    };
                    await api.put(`/collections/${col.id}`, updatedCol);

                    set((state) => ({
                        collections: state.collections.map((c) =>
                            c.id === col.id ? updatedCol : c
                        ),
                    }));
                }
            } catch (err) {
                console.error(`Failed to recalc collection ${col.name}:`, err);
            }
        }
    },

    addCollection: (newCollection) =>
        set((state) => ({ collections: [newCollection, ...state.collections] })),

    updateCollection: async(updatedCollection) => {
        set((state) => {
            const updatedCollections = state.collections.map((c) =>
                c.id === updatedCollection.id ? {...c, ...updatedCollection } : c
            );
            return { collections: updatedCollections };
        });
        get().recalculateAndSyncStatus([updatedCollection]);
    },

    removeCollection: (id) =>
        set((state) => ({
            collections: state.collections.filter((col) => col.id !== id),
        })),
}));