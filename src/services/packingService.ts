/**
 * Packing Service
 * @description Business logic for packing operations
 */

import { supabase } from '@/lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface Shipment {
    id: string;
    order_number: string;
    customer_name: string;
    status: 'pending' | 'picking' | 'packed' | 'shipped';
    total_items: number;
    wave_id: string | null;
}

export interface PackableShipment extends Shipment {
    shipment_lines: Array<{
        id: string;
        product_id: string;
        quantity: number;
        status: string;
        product: {
            sku: string;
            name: string;
        };
    }>;
}

// =============================================================================
// PACKING OPERATIONS
// =============================================================================

/**
 * Get shipments ready for packing
 * @param warehouseId - Warehouse ID
 * @returns List of shipments with all items picked
 */
export async function getPackableShipments(warehouseId: string): Promise<PackableShipment[]> {
    try {
        const { data, error } = await supabase
            .from('shipments')
            .select(`
                *,
                shipment_lines!inner(
                    id,
                    product_id,
                    quantity,
                    status,
                    product:products(sku, name)
                )
            `)
            .eq('warehouse_id', warehouseId)
            .eq('status', 'picking')
            .not('shipment_lines.status', 'in', '(pending,in_progress)'); // All lines must be picked

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Failed to fetch packable shipments:', error);
        throw new Error('Failed to fetch packable shipments. Please try again.');
    }
}

/**
 * Start packing a shipment
 * @param shipmentId - Shipment ID
 * @returns Updated shipment
 */
export async function startPacking(shipmentId: string): Promise<Shipment> {
    try {
        const { data, error } = await supabase
            .from('shipments')
            .update({ status: 'packed' })
            .eq('id', shipmentId)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Shipment not found');

        return data;
    } catch (error) {
        console.error('Failed to start packing:', error);
        throw new Error('Failed to start packing. Please try again.');
    }
}

/**
 * Generate shipping label
 * @param shipmentId - Shipment ID
 * @param carrier - Carrier name
 * @returns Label URL
 */
export async function generateLabel(
    shipmentId: string,
    carrier: string
): Promise<string> {
    try {
        // In real implementation, this would call carrier API
        // For now, return mock label URL
        const labelUrl = `https://labels.example.com/${shipmentId}-${carrier}.pdf`;

        const { error } = await supabase
            .from('shipments')
            .update({
                carrier,
                label_generated_at: new Date().toISOString(),
            })
            .eq('id', shipmentId);

        if (error) throw error;

        return labelUrl;
    } catch (error) {
        console.error('Failed to generate label:', error);
        throw new Error('Failed to generate label. Please try again.');
    }
}
