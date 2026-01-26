/**
 * Dashboard Service
 * @description Business logic for dashboard analytics and KPIs
 */

import { supabase } from '@/lib/supabase';

export interface DashboardStats {
    inbound: {
        receiving: number;
        scheduled: number;
        putaway_pending: number;
    };
    outbound: {
        waves_active: number;
        picking_active: number;
        packing_pending: number;
        shipped_today: number;
    };
    inventory: {
        total_skus: number;
        total_units: number;
        locations_used: number;
    };
    problems: {
        open: number;
        critical: number;
    };
}

export interface RecentActivity {
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user_name?: string;
}

/**
 * Get dashboard statistics
 * @param warehouseId - Warehouse ID
 * @returns Dashboard stats
 */
export async function getDashboardStats(warehouseId: string): Promise<DashboardStats> {
    try {
        // Parallel queries for performance
        const [
            inboundData,
            putawayData,
            wavesData,
            shipmentsData,
            inventoryData,
            locationsData,
            problemsData,
        ] = await Promise.all([
            supabase.from('inbound_shipments').select('status').eq('warehouse_id', warehouseId),
            supabase.from('putaway_tasks').select('status'),
            supabase.from('waves').select('status').eq('warehouse_id', warehouseId),
            supabase.from('shipments').select('status, shipped_at'),
            supabase.from('inventory').select('quantity'),
            supabase.from('locations').select('id, current_units').eq('warehouse_id', warehouseId),
            supabase.from('problem_tickets').select('status, priority').eq('warehouse_id', warehouseId),
        ]);

        // Calculate inbound stats
        const inbound = {
            receiving: inboundData.data?.filter((i: any) => i.status === 'receiving').length || 0,
            scheduled: inboundData.data?.filter((i: any) => i.status === 'scheduled').length || 0,
            putaway_pending: putawayData.data?.filter((p: any) => p.status === 'pending').length || 0,
        };

        // Calculate outbound stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const outbound = {
            waves_active: wavesData.data?.filter((w: any) => ['released', 'picking'].includes(w.status)).length || 0,
            picking_active: shipmentsData.data?.filter((s: any) => s.status === 'picking').length || 0,
            packing_pending: shipmentsData.data?.filter((s: any) => s.status === 'picked').length || 0,
            shipped_today: shipmentsData.data?.filter((s: any) =>
                s.status === 'shipped' &&
                s.shipped_at &&
                new Date(s.shipped_at) >= today
            ).length || 0,
        };

        // Calculate inventory stats
        const inventory = {
            total_skus: inventoryData.data?.length || 0,
            total_units: inventoryData.data?.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0) || 0,
            locations_used: locationsData.data?.filter((l: any) => (l.current_units || 0) > 0).length || 0,
        };

        // Calculate problem stats
        const problems = {
            open: problemsData.data?.filter((p: any) => ['open', 'in_progress'].includes(p.status)).length || 0,
            critical: problemsData.data?.filter((p: any) => p.priority === 'critical' && p.status !== 'resolved').length || 0,
        };

        return { inbound, outbound, inventory, problems };
    } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        throw new Error('Failed to load dashboard statistics');
    }
}

/**
 * Get recent activity for dashboard
 * @param warehouseId - warehouse ID
 * @param limit - Number of activities to return
 * @returns List of recent activities
 */
export async function getRecentActivity(
    warehouseId: string,
    limit: number = 10
): Promise<RecentActivity[]> {
    try {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
                id,
                transaction_type,
                notes,
                created_at,
                user:users(full_name)
            `)
            .eq('warehouse_id', warehouseId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return (data || []).map((activity: any) => ({
            id: activity.id,
            type: activity.transaction_type,
            description: activity.notes || `${activity.transaction_type} transaction`,
            timestamp: activity.created_at,
            user_name: activity.user?.full_name,
        }));
    } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        return [];
    }
}
