/**
 * ICQA Service
 * @description Business logic for inventory cycle counts with Pull system
 */

import { supabase } from '@/lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface CountTask {
    id: string;
    location_id: string;
    product_id: string | null;
    type: 'blind' | 'full';
    status: 'pending' | 'in_progress' | 'completed';
    system_quantity: number | null;
    counted_quantity: number | null;
    variance: number | null;
    counted_by: string | null;
    counted_at: string | null;
    created_at: string;
}

export interface CountTaskWithDetails extends CountTask {
    location: {
        barcode: string;
        aisle: string;
    };
    product?: {
        sku: string;
        name: string;
    } | null;
}

// =============================================================================
// ICQA OPERATIONS
// =============================================================================

/**
 * Get available count tasks
 * @param warehouseId - Warehouse ID
 * @returns List of available count tasks
 */
export async function getAvailableCountTasks(warehouseId: string): Promise<CountTaskWithDetails[]> {
    try {
        const { data, error } = await supabase
            .from('count_tasks')
            .select(`
                *,
                location:locations!inner(barcode, aisle, warehouse_id),
                product:products(sku, name)
            `)
            .eq('status', 'pending')
            .eq('location.warehouse_id', warehouseId)
            .limit(50);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Failed to fetch count tasks:', error);
        throw new Error('Failed to fetch count tasks. Please try again.');
    }
}

/**
 * Get user's active count tasks
 * @param userId - User ID
 * @returns List of user's count tasks in progress
 */
export async function getMyActiveCountTasks(userId: string): Promise<CountTaskWithDetails[]> {
    try {
        const { data, error } = await supabase
            .from('count_tasks')
            .select(`
                *,
                location:locations(barcode, aisle),
                product:products(sku, name)
            `)
            .eq('counted_by', userId)
            .eq('status', 'in_progress');

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Failed to fetch active count tasks:', error);
        throw new Error('Failed to fetch active count tasks. Please try again.');
    }
}

/**
 * Pull a count task (assign to user)
 * @param taskId - Count task ID
 * @param userId - User ID
 * @returns Updated count task
 */
export async function pullCountTask(taskId: string, userId: string): Promise<CountTask> {
    try {
        const { data, error } = await supabase
            .from('count_tasks')
            .update({
                status: 'in_progress',
                counted_by: userId,
            })
            .eq('id', taskId)
            .eq('status', 'pending') // Only allow pulling if still pending
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Count task already assigned or not found');

        return data;
    } catch (error) {
        console.error('Failed to pull count task:', error);
        throw new Error('Failed to pull count task. Please try again.');
    }
}

/**
 * Complete a count task (submit count)
 * @param taskId - Count task ID
 * @param userId - User ID
 * @param countedQuantity - Counted quantity
 * @returns Updated count task with variance
 */
export async function completeCountTask(
    taskId: string,
    userId: string,
    countedQuantity: number
): Promise<CountTask> {
    try {
        // First, get the task to calculate variance
        const { data: task, error: fetchError } = await supabase
            .from('count_tasks')
            .select('*')
            .eq('id', taskId)
            .eq('counted_by', userId)
            .single();

        if (fetchError) throw fetchError;
        if (!task) throw new Error('Count task not found or not assigned to you');

        const variance = (task.system_quantity || 0) - countedQuantity;

        // Update the task
        const { data, error } = await supabase
            .from('count_tasks')
            .update({
                status: 'completed',
                counted_quantity: countedQuantity,
                variance,
                counted_at: new Date().toISOString(),
            })
            .eq('id', taskId)
            .select()
            .single();

        if (error) throw error;

        // If variance exists, create problem ticket
        if (variance !== 0) {
            await createVarianceProblemTicket(task, countedQuantity, variance);
        }

        return data;
    } catch (error) {
        console.error('Failed to complete count task:', error);
        throw new Error('Failed to complete count task. Please try again.');
    }
}

/**
 * Release a count task (unassign from user)
 * @param taskId - Count task ID
 * @param userId - User ID
 */
export async function releaseCountTask(taskId: string, userId: string): Promise<void> {
    try {
        const { error } = await supabase
            .from('count_tasks')
            .update({
                status: 'pending',
                counted_by: null,
            })
            .eq('id', taskId)
            .eq('counted_by', userId)
            .eq('status', 'in_progress');

        if (error) throw error;
    } catch (error) {
        console.error('Failed to release count task:', error);
        throw new Error('Failed to release count task. Please try again.');
    }
}

/**
 * Create problem ticket for count variance
 * @param task - Count task
 * @param countedQuantity - Counted quantity
 * @param variance - Variance
 */
async function createVarianceProblemTicket(
    task: CountTask,
    countedQuantity: number,
    variance: number
): Promise<void> {
    try {
        await supabase
            .from('problem_tickets')
            .insert({
                ticket_type: 'count_variance',
                location_id: task.location_id,
                product_id: task.product_id,
                priority: Math.abs(variance) > 10 ? 'high' : 'medium',
                description: `Count variance detected. System: ${task.system_quantity}, Counted: ${countedQuantity}, Variance: ${variance}`,
                status: 'open',
            });
    } catch (error) {
        console.error('Failed to create variance ticket:', error);
        // Don't throw - count should still complete
    }
}
