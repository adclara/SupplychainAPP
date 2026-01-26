/**
 * Wave Service
 * @description Business logic for wave management operations
 */

import { supabase } from '@/lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface Wave {
    id: string;
    wave_number: string;
    warehouse_id: string;
    status: 'pending' | 'picking' | 'packing' | 'shipped';
    total_shipments: number;
    created_at: string;
    released_at: string | null;
}

export interface CreateWaveInput {
    warehouse_id: string;
    shipment_ids?: string[];
}

// =============================================================================
// WAVE OPERATIONS
// =============================================================================

/**
 * Create a new wave
 * @param input - Wave creation parameters
 * @returns Created wave
 * @throws Error if creation fails
 */
export async function createWave(input: CreateWaveInput): Promise<Wave> {
    try {
        // Generate wave number
        const waveNumber = `WAVE-${Date.now()}`;

        const { data, error } = await supabase
            .from('waves')
            .insert({
                wave_number: waveNumber,
                warehouse_id: input.warehouse_id,
                status: 'pending',
                total_shipments: input.shipment_ids?.length || 0,
            })
            .select()
            .single();

        if (error) throw error;

        // If shipment IDs provided, assign them to the wave
        if (input.shipment_ids && input.shipment_ids.length > 0) {
            const { error: assignError } = await supabase
                .from('shipments')
                .update({ wave_id: data.id })
                .in('id', input.shipment_ids);

            if (assignError) throw assignError;
        }

        return data;
    } catch (error) {
        console.error('Failed to create wave:', error);
        throw new Error('Failed to create wave. Please try again.');
    }
}

/**
 * Release wave for picking
 * @param waveId - ID of wave to release
 * @returns Updated wave
 * @throws Error if release fails
 */
export async function releaseWave(waveId: string): Promise<Wave> {
    try {
        const { data, error } = await supabase
            .from('waves')
            .update({
                status: 'picking',
                released_at: new Date().toISOString(),
            })
            .eq('id', waveId)
            .eq('status', 'pending') // Only allow releasing pending waves
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Wave not found or already released');

        return data;
    } catch (error) {
        console.error('Failed to release wave:', error);
        throw new Error('Failed to release wave. Please try again.');
    }
}

/**
 * Get waves for warehouse
 * @param warehouseId - Warehouse ID
 * @param status - Optional status filter
 * @returns List of waves
 */
export async function getWaves(
    warehouseId: string,
    status?: Wave['status']
): Promise<Wave[]> {
    try {
        let query = supabase
            .from('waves')
            .select('*')
            .eq('warehouse_id', warehouseId)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Failed to fetch waves:', error);
        throw new Error('Failed to fetch waves. Please try again.');
    }
}

/**
 * Get wave by ID with shipments
 * @param waveId - Wave ID
 * @returns Wave with shipments
 */
export async function getWaveWithShipments(waveId: string): Promise<any> {
    try {
        const { data, error } = await supabase
            .from('waves')
            .select(`
                *,
                shipments (
                    id,
                    order_number,
                    customer_name,
                    status,
                    shipment_lines (
                        id,
                        product_id,
                        quantity,
                        status
                    )
                )
            `)
            .eq('id', waveId)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Failed to fetch wave:', error);
        throw new Error('Failed to fetch wave. Please try again.');
    }
}
