import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, createServerClient } from '@/lib/supabase';
import { confirmShipment } from '@/services/shippingService';

const ConfirmSchema = z.object({
    shipmentId: z.string().uuid(),
    carrier: z.enum(['fedex', 'ups', 'dhl']),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validated = ConfirmSchema.parse(body);

        const supabase = createServerClient();

        // Fetch weight for the log
        const { data: shipment, error: fetchError } = await supabase
            .from('shipments')
            .select(`
        id,
        shipment_lines (
          quantity,
          product:product_id (
            weight
          )
        )
      `)
            .eq('id', validated.shipmentId)
            .single();

        if (fetchError || !shipment) {
            return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
        }

        let totalWeight = 0;
        shipment.shipment_lines.forEach((l: any) => {
            totalWeight += (l.product.weight || 0) * l.quantity;
        });

        // Mock carrier tracking number generation
        const trackingNumber = `${validated.carrier.toUpperCase()}-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

        await confirmShipment(
            validated.shipmentId,
            validated.carrier,
            trackingNumber,
            user.id,
            totalWeight
        );

        return NextResponse.json({
            trackingNumber,
            status: 'shipped',
            message: `Order shipped via ${validated.carrier.toUpperCase()}. Tracking: ${trackingNumber}`
        });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
