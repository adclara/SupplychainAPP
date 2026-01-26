/**
 * Inbound Service
 * @description Business logic for inbound operations - Receiving, Dock, Putaway
 */

import { supabase } from '@/lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface InboundShipment {
    id: string;
    asn_number: string;
    supplier_name: string;
    status: 'scheduled' | 'receiving' | 'received' | 'putaway';
    expected_date: string;
    dock_door: string | null;
    carrier: string | null;
    total_items: number;
    warehouse_id: string;
    created_at: string;
}

export interface InboundLine {
    id: string;
    inbound_shipment_id: string;
    product_id: string;
    expected_quantity: number;
    received_quantity: number;
    status: 'pending' | 'receiving' | 'received';
}

export interface InboundLineWithDetails extends InboundLine {
    product: {
        sku: string;
        name: string;
        barcode: string;
    };
}

export interface DockAssignment {
    dock_door: string;
    carrier: string;
    arrival_time: string;
}

// =============================================================================
// RECEIVING OPERATIONS
// =============================================================================

/**
 * Get inbound shipments ready to receive
 * @param warehouseId - Warehouse ID
 * @returns List of inbound shipments
 */
export async function getInboundShipments(warehouseId: string): Promise<InboundShipment[]> {
    try {
        const { data, error } = await supabase
            .from('inbound_shipments')
            .select('*')
            .eq('warehouse_id', warehouseId)
            .in('status', ['scheduled', 'receiving'])
            .order('expected_date', { ascending: true });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Failed to fetch inbound shipments:', error);
        throw new Error('Failed to fetch inbound shipments. Please try again.');
    }
}

/**
 * Start receiving an inbound shipment
 * @param shipmentId - Inbound shipment ID
 * @returns Updated shipment
 */
export async function startReceiving(shipmentId: string): Promise<InboundShipment> {
    try {
        const { data, error } = await supabase
            .from('inbound_shipments')
            .update({
                status: 'receiving',
                receiving_started_at: new Date().toISOString(),
            })
            .eq('id', shipmentId)
            .eq('status', 'scheduled')
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Shipment not found or already receiving');

        return data;
    } catch (error) {
        console.error('Failed to start receiving:', error);
        throw new Error('Failed to start receiving. Please try again.');
    }
}

/**
 * Receive an item (update received quantity)
 * @param lineId - Inbound line ID
 * @param quantity - Quantity received
 * @returns Updated line
 */
export async function receiveItem(lineId: string, quantity: number): Promise<InboundLine> {
    try {
        // Get current line
        const { data: line, error: fetchError } = await supabase
            .from('inbound_lines')
            .select('*')
            .eq('id', lineId)
            .single();

        if (fetchError) throw fetchError;
        if (!line) throw new Error('Line not found');

        const newReceivedQty = (line.received_quantity || 0) + quantity;
        const isComplete = newReceivedQty >= line.expected_quantity;

        const { data, error } = await supabase
            .from('inbound_lines')
            .update({
                received_quantity: newReceivedQty,
                status: isComplete ? 'received' : 'receiving',
            })
            .eq('id', lineId)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Failed to receive item:', error);
        throw new Error('Failed to receive item. Please try again.');
    }
}

/**
 * Complete receiving for shipment
 * @param shipmentId - Inbound shipment ID
 * @returns Updated shipment
 */
export async function completeReceiving(shipmentId: string): Promise<InboundShipment> {
    try {
        const { data, error } = await supabase
            .from('inbound_shipments')
            .update({
                status: 'received',
                received_at: new Date().toISOString(),
            })
            .eq('id', shipmentId)
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Failed to complete receiving:', error);
        throw new Error('Failed to complete receiving. Please try again.');
    }
}

/**
 * Get inbound lines for a shipment
 * @param shipmentId - Inbound shipment ID
 * @returns List of lines with product details
 */
export async function getInboundLines(shipmentId: string): Promise<InboundLineWithDetails[]> {
    try {
        const { data, error } = await supabase
            .from('inbound_lines')
            .select(`
                *,
                product:products(sku, name, barcode)
            `)
            .eq('inbound_shipment_id', shipmentId);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Failed to fetch inbound lines:', error);
        throw new Error('Failed to fetch inbound lines. Please try again.');
    }
}

// =============================================================================
// DOCK MANAGEMENT OPERATIONS
// =============================================================================

/**
 * Assign inbound shipment to dock door and carrier
 * @param shipmentId - Inbound shipment ID
 * @param assignment - Dock assignment details
 * @returns Updated shipment
 */
export async function assignToDock(
    shipmentId: string,
    assignment: DockAssignment
): Promise<InboundShipment> {
    try {
        const { data, error } = await supabase
            .from('inbound_shipments')
            .update({
                dock_door: assignment.dock_door,
                carrier: assignment.carrier,
                scheduled_arrival: assignment.arrival_time,
            })
            .eq('id', shipmentId)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Shipment not found');

        return data;
    } catch (error) {
        console.error('Failed to assign to dock:', error);
        throw new Error('Failed to assign to dock. Please try again.');
    }
}

/**
 * Get available dock doors
 * @param warehouseId - Warehouse ID
 * @returns List of dock door names
 */
export async function getAvailableDockDoors(warehouseId: string): Promise<string[]> {
    try {
        // In a real implementation, this would query dock_doors table
        // For now, return predefined list
        return ['DOCK-01', 'DOCK-02', 'DOCK-03', 'DOCK-04', 'DOCK-05'];
    } catch (error) {
        console.error('Failed to fetch dock doors:', error);
        throw new Error('Failed to fetch dock doors. Please try again.');
    }
}

// =============================================================================
// PUTAWAY OPERATIONS
// =============================================================================

export interface PutawayTask {
    id: string;
    inbound_line_id: string;
    product_id: string;
    from_location_id: string;
    to_location_id: string | null;
    quantity: number;
    status: 'pending' | 'in_progress' | 'completed';
    assigned_to: string | null;
}

export interface PutawayTaskWithDetails extends PutawayTask {
    product: {
        sku: string;
        name: string;
    };
    from_location: {
        barcode: string;
        zone: string;
    };
    to_location?: {
        barcode: string;
        zone: string;
    } | null;
}

/**
 * Get available putaway tasks
 * @param warehouseId - Warehouse ID
 * @returns List of available putaway tasks
 */
export async function getAvailablePutawayTasks(warehouseId: string): Promise<PutawayTaskWithDetails[]> {
    try {
        const { data, error } = await supabase
            .from('putaway_tasks')
            .select(`
                *,
                product:products(sku, name),
                from_location:locations!from_location_id(barcode, zone, warehouse_id),
                to_location:locations!to_location_id(barcode, zone)
            `)
            .eq('status', 'pending')
            .eq('from_location.warehouse_id', warehouseId)
            .limit(50);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Failed to fetch putaway tasks:', error);
        throw new Error('Failed to fetch putaway tasks. Please try again.');
    }
}

/**
 * Pull putaway task (assign to user)
 * @param taskId - Putaway task ID
 * @param userId - User ID
 * @returns Updated task
 */
export async function pullPutawayTask(taskId: string, userId: string): Promise<PutawayTask> {
    try {
        const { data, error } = await supabase
            .from('putaway_tasks')
            .update({
                status: 'in_progress',
                assigned_to: userId,
            })
            .eq('id', taskId)
            .eq('status', 'pending')
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Task already assigned or not found');

        return data;
    } catch (error) {
        console.error('Failed to pull putaway task:', error);
        throw new Error('Failed to pull putaway task. Please try again.');
    }
}

/**
 * Complete putaway task
 * @param taskId - Putaway task ID
 * @param userId - User ID
 * @returns Updated task
 */
export async function completePutawayTask(taskId: string, userId: string): Promise<PutawayTask> {
    try {
        const { data, error } = await supabase
            .from('putaway_tasks')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', taskId)
            .eq('assigned_to', userId)
            .eq('status', 'in_progress')
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Task not found or not assigned to you');

        return data;
    } catch (error) {
        console.error('Failed to complete putaway task:', error);
        throw new Error('Failed to complete putaway task. Please try again.');
    }
}
