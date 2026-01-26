/**
 * Scanner Store
 * @description Zustand store for barcode scanner session state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ScannedItem {
    id: string;
    barcode: string;
    productId: string;
    locationId: string;
    quantity: number;
    scannedAt: string;
}

interface ScannerState {
    /** Current wave being processed */
    currentWaveId: string | null;
    /** Current wave number for display */
    currentWaveNumber: string | null;
    /** Items scanned in current session */
    scannedItems: ScannedItem[];
    /** Total items expected */
    totalItems: number;
    /** Completed items count */
    completedItems: number;
    /** Scanner mode */
    mode: 'idle' | 'receiving' | 'picking' | 'putaway' | 'counting';
    /** Last scanned barcode */
    lastScannedBarcode: string | null;
    /** Last scan timestamp */
    lastScanTime: string | null;
}

interface ScannerActions {
    /** Start a new wave session */
    startWave: (waveId: string, waveNumber: string, totalItems: number) => void;
    /** Add a scanned item */
    addScannedItem: (item: ScannedItem) => void;
    /** Remove a scanned item */
    removeScannedItem: (itemId: string) => void;
    /** End the current wave session */
    endWave: () => void;
    /** Set scanner mode */
    setMode: (mode: ScannerState['mode']) => void;
    /** Record a scan event */
    recordScan: (barcode: string) => void;
    /** Reset scanner state */
    reset: () => void;
}

type ScannerStore = ScannerState & ScannerActions;

const initialState: ScannerState = {
    currentWaveId: null,
    currentWaveNumber: null,
    scannedItems: [],
    totalItems: 0,
    completedItems: 0,
    mode: 'idle',
    lastScannedBarcode: null,
    lastScanTime: null,
};

/**
 * Scanner store for managing barcode scanning sessions
 * Persists to localStorage to survive page refreshes
 */
export const useScannerStore = create<ScannerStore>()(
    persist(
        (set) => ({
            ...initialState,

            startWave: (waveId, waveNumber, totalItems) =>
                set({
                    currentWaveId: waveId,
                    currentWaveNumber: waveNumber,
                    totalItems,
                    scannedItems: [],
                    completedItems: 0,
                    mode: 'picking',
                }),

            addScannedItem: (item) =>
                set((state) => ({
                    scannedItems: [...state.scannedItems, item],
                    completedItems: state.completedItems + 1,
                    lastScannedBarcode: item.barcode,
                    lastScanTime: item.scannedAt,
                })),

            removeScannedItem: (itemId) =>
                set((state) => ({
                    scannedItems: state.scannedItems.filter((item) => item.id !== itemId),
                    completedItems: Math.max(0, state.completedItems - 1),
                })),

            endWave: () =>
                set({
                    currentWaveId: null,
                    currentWaveNumber: null,
                    scannedItems: [],
                    totalItems: 0,
                    completedItems: 0,
                    mode: 'idle',
                }),

            setMode: (mode) => set({ mode }),

            recordScan: (barcode) =>
                set({
                    lastScannedBarcode: barcode,
                    lastScanTime: new Date().toISOString(),
                }),

            reset: () => set(initialState),
        }),
        {
            name: 'nexus-scanner-store',
            partialize: (state) => ({
                currentWaveId: state.currentWaveId,
                currentWaveNumber: state.currentWaveNumber,
                scannedItems: state.scannedItems,
                totalItems: state.totalItems,
                completedItems: state.completedItems,
                mode: state.mode,
            }),
        }
    )
);

export default useScannerStore;
