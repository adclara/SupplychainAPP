import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, createServerClient } from '@/lib/supabase';

const VerifySchema = z.object({
    shipmentId: z.string().uuid(),
    scannedBarcode: z.string().min(1),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validated = VerifySchema.parse(body);

        const supabase = createServerClient();

        // Check if shipment exists and is packed
        const { data: shipment, error } = await supabase
            .from('shipments')
            .select('id, order_number, status')
            .eq('id', validated.shipmentId)
            .single();

        if (error || !shipment) {
            return NextResponse.json({ isValid: false, message: 'Shipment not found' });
        }

        if (shipment.status !== 'packed') {
            return NextResponse.json({ isValid: false, message: `Shipment status is ${shipment.status}, must be packed.` });
        }

        // Check if scanned barcode matches order number or shipment ID
        const isMatch = validated.scannedBarcode === shipment.order_number || validated.scannedBarcode === shipment.id;

        if (!isMatch) {
            return NextResponse.json({ isValid: false, message: 'Barcode does not match order number' });
        }

        return NextResponse.json({ isValid: true, message: 'Shipment verified' });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
