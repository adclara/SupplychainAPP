import { NextRequest, NextResponse } from 'next/server';
import { getPackedShipmentsByWave } from '@/services/shippingService';
import { getCurrentUser } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ waveId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { waveId } = await params;
        const shipments = await getPackedShipmentsByWave(waveId);

        // Calculate summary
        let count = shipments.length;
        let totalWeight = 0;

        shipments.forEach((s: any) => {
            s.shipment_lines.forEach((l: any) => {
                totalWeight += (l.product.weight || 0) * l.quantity;
            });
        });

        return NextResponse.json({
            shipments,
            summary: {
                count,
                weight: parseFloat(totalWeight.toFixed(2)),
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
