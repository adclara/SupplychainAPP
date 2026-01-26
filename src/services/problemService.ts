/**
 * Problem Solve Service
 * @description Business logic for problem ticket management
 */

import { supabase } from '@/lib/supabase';

// =============================================================================
// TYPES
// =============================================================================

export interface ProblemTicket {
    id: string;
    ticket_type: 'count_variance' | 'damage' | 'missing' | 'quality' | 'system_error' | 'other';
    location_id: string | null;
    product_id: string | null;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    description: string;
    resolution: string | null;
    assigned_to: string | null;
    resolved_by: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface ProblemTicketWithDetails extends ProblemTicket {
    location?: {
        barcode: string;
        zone: string;
    } | null;
    product?: {
        sku: string;
        name: string;
    } | null;
    assigned_user?: {
        full_name: string;
        email: string;
    } | null;
}

export interface CreateTicketParams {
    ticket_type: ProblemTicket['ticket_type'];
    location_id?: string;
    product_id?: string;
    priority: ProblemTicket['priority'];
    description: string;
    created_by: string;
}

export interface ResolveTicketParams {
    resolution: string;
    resolved_by: string;
}

// =============================================================================
// PROBLEM TICKETS OPERATIONS
// =============================================================================

/**
 * Get all problem tickets with optional filters
 * @param warehouseId - Warehouse ID
 * @param status - Optional status filter
 * @returns List of problem tickets
 */
export async function getProblemTickets(
    warehouseId: string,
    status?: ProblemTicket['status']
): Promise<ProblemTicketWithDetails[]> {
    try {
        let query = supabase
            .from('problem_tickets')
            .select(`
                *,
                location:locations(barcode, zone),
                product:products(sku, name),
                assigned_user:users!assigned_to(full_name, email)
            `)
            .eq('warehouse_id', warehouseId)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Failed to fetch problem tickets:', error);
        throw new Error('Failed to fetch problem tickets. Please try again.');
    }
}

/**
 * Get tickets assigned to a user
 * @param userId - User ID
 * @returns List of assigned tickets
 */
export async function getMyTickets(userId: string): Promise<ProblemTicketWithDetails[]> {
    try {
        const { data, error } = await supabase
            .from('problem_tickets')
            .select(`
                *,
                location:locations(barcode, zone),
                product:products(sku, name)
            `)
            .eq('assigned_to', userId)
            .in('status', ['open', 'in_progress'])
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Failed to fetch my tickets:', error);
        throw new Error('Failed to fetch your tickets. Please try again.');
    }
}

/**
 * Create a new problem ticket
 * @param params - Ticket creation parameters
 * @returns Created ticket
 */
export async function createProblemTicket(
    params: CreateTicketParams
): Promise<ProblemTicket> {
    try {
        const { data, error } = await supabase
            .from('problem_tickets')
            .insert({
                ticket_type: params.ticket_type,
                location_id: params.location_id,
                product_id: params.product_id,
                priority: params.priority,
                description: params.description,
                status: 'open',
                created_by: params.created_by,
            })
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Failed to create problem ticket:', error);
        throw new Error('Failed to create problem ticket. Please try again.');
    }
}

/**
 * Assign ticket to a user
 * @param ticketId - Ticket ID
 * @param userId - User ID to assign to
 * @returns Updated ticket
 */
export async function assignTicket(ticketId: string, userId: string): Promise<ProblemTicket> {
    try {
        const { data, error } = await supabase
            .from('problem_tickets')
            .update({
                assigned_to: userId,
                status: 'in_progress',
            })
            .eq('id', ticketId)
            .eq('status', 'open')
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Ticket not found or already assigned');

        return data;
    } catch (error) {
        console.error('Failed to assign ticket:', error);
        throw new Error('Failed to assign ticket. Please try again.');
    }
}

/**
 * Resolve a problem ticket
 * @param ticketId - Ticket ID
 * @param params - Resolution parameters
 * @returns Updated ticket
 */
export async function resolveTicket(
    ticketId: string,
    params: ResolveTicketParams
): Promise<ProblemTicket> {
    try {
        const { data, error } = await supabase
            .from('problem_tickets')
            .update({
                status: 'resolved',
                resolution: params.resolution,
                resolved_by: params.resolved_by,
                resolved_at: new Date().toISOString(),
            })
            .eq('id', ticketId)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Ticket not found');

        return data;
    } catch (error) {
        console.error('Failed to resolve ticket:', error);
        throw new Error('Failed to resolve ticket. Please try again.');
    }
}

/**
 * Close a problem ticket
 * @param ticketId - Ticket ID
 * @returns Updated ticket
 */
export async function closeTicket(ticketId: string): Promise<ProblemTicket> {
    try {
        const { data, error } = await supabase
            .from('problem_tickets')
            .update({
                status: 'closed',
            })
            .eq('id', ticketId)
            .eq('status', 'resolved')
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Ticket not found or not resolved');

        return data;
    } catch (error) {
        console.error('Failed to close ticket:', error);
        throw new Error('Failed to close ticket. Please try again.');
    }
}

/**
 * Reopen a problem ticket
 * @param ticketId - Ticket ID
 * @returns Updated ticket
 */
export async function reopenTicket(ticketId: string): Promise<ProblemTicket> {
    try {
        const { data, error } = await supabase
            .from('problem_tickets')
            .update({
                status: 'open',
                resolution: null,
                resolved_by: null,
                resolved_at: null,
                assigned_to: null,
            })
            .eq('id', ticketId)
            .select()
            .single();

        if (error) throw error;
        if (!data) throw new Error('Ticket not found');

        return data;
    } catch (error) {
        console.error('Failed to reopen ticket:', error);
        throw new Error('Failed to reopen ticket. Please try again.');
    }
}

/**
 * Get ticket statistics
 * @param warehouseId - Warehouse ID
 * @returns Ticket statistics
 */
export async function getTicketStats(warehouseId: string) {
    try {
        const { data, error } = await supabase
            .from('problem_tickets')
            .select('status, priority')
            .eq('warehouse_id', warehouseId);

        if (error) throw error;

        const stats = {
            open: data.filter(t => t.status === 'open').length,
            in_progress: data.filter(t => t.status === 'in_progress').length,
            resolved: data.filter(t => t.status === 'resolved').length,
            closed: data.filter(t => t.status === 'closed').length,
            critical: data.filter(t => t.priority === 'critical').length,
            high: data.filter(t => t.priority === 'high').length,
            total: data.length,
        };

        return stats;
    } catch (error) {
        console.error('Failed to fetch ticket stats:', error);
        return {
            open: 0,
            in_progress: 0,
            resolved: 0,
            closed: 0,
            critical: 0,
            high: 0,
            total: 0,
        };
    }
}
