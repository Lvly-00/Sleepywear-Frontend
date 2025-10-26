import { create } from "zustand";
import api from "../api/axios";

export const useCollectionStore = create((set, get) => ({
    collections: [],
    versions: {},
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

            // Recalculate only if needed
            get().recalculateAndSyncStatus(sorted);
        } catch (err) {
            console.error("Error fetching collections:", err);
        } finally {
            set({ loading: false });
        }
    },

    recalculateAndSyncStatus: async(collections) => {
        for (const col of collections) {
            const lastVersion = get().versions[col.id] || 0;

            try {
                const itemsRes = await api.get(`/items?collection_id=${col.id}`);
                const items = itemsRes.data;

                const totalQty = items.length;
                const stockQty = items.filter(i => i.status === "Available").length;

                let newStatus = stockQty <= 0 ? "Sold Out" : "Active";

                // Only update if something changed
                if (
                    col.status !== newStatus ||
                    col.qty !== totalQty ||
                    col.stock_qty !== stockQty ||
                    lastVersion === 0
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
                        versions: {...state.versions, [col.id]: (state.versions[col.id] || 0) + 1 },
                    }));
                }
            } catch (err) {
                console.error(`Failed to recalc collection ${col.name}:`, err);
            }
        }
    },

    addCollection: (newCollection) =>
        set((state) => ({
            collections: [newCollection, ...state.collections],
            versions: {...state.versions, [newCollection.id]: 1 },
        })),

    updateCollection: async(updatedCollection) => {
        const currentVersion = get().versions[updatedCollection.id] || 0;

        set((state) => {
            const updatedCollections = state.collections.map((c) =>
                c.id === updatedCollection.id ? {...c, ...updatedCollection } : c
            );
            return { collections: updatedCollections };
        });

        // Recalc only if version changed
        if (currentVersion === 0) {
            get().recalculateAndSyncStatus([updatedCollection]);
        }
    },

    removeCollection: (id) =>
        set((state) => {
            const newCollections = state.collections.filter((col) => col.id !== id);
            const {
                [id]: _, ...newVersions
            } = state.versions;
            return { collections: newCollections, versions: newVersions };
        }),
}));