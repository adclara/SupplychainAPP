/**
 * Warehouse Store
 * @description Zustand store for warehouse context and selection
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Warehouse } from '@/types';

interface WarehouseState {
    /** Currently selected warehouse */
    currentWarehouse: Warehouse | null;
    /** List of available warehouses */
    warehouses: Warehouse[];
    /** Loading state */
    isLoading: boolean;
}

interface WarehouseActions {
    /** Set the current warehouse */
    setCurrentWarehouse: (warehouse: Warehouse | null) => void;
    /** Set available warehouses */
    setWarehouses: (warehouses: Warehouse[]) => void;
    /** Set loading state */
    setLoading: (loading: boolean) => void;
}

type WarehouseStore = WarehouseState & WarehouseActions;

/**
 * Warehouse store for managing warehouse context
 */
export const useWarehouseStore = create<WarehouseStore>()(
    persist(
        (set) => ({
            // Initial state
            currentWarehouse: null,
            warehouses: [],
            isLoading: false,

            // Actions
            setCurrentWarehouse: (warehouse) =>
                set({ currentWarehouse: warehouse }),

            setWarehouses: (warehouses) => set({ warehouses }),

            setLoading: (isLoading) => set({ isLoading }),
        }),
        {
            name: 'nexus-warehouse-store',
            partialize: (state) => ({
                currentWarehouse: state.currentWarehouse,
            }),
        }
    )
);

export default useWarehouseStore;
