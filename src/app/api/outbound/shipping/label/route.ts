import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/supabase';

const LabelSchema = z.object({
    shipmentId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validated = LabelSchema.parse(body);

        // Mock ZPL Generation
        // In a real scenario, we might call a carrier API or a ZPL service
        const timestamp = new Date().toLocaleString();
        const zplCode = `
^XA
^FO50,50^A0N,50,50^FDNexus Chain WMS^FS
^FO50,120^A0N,30,30^FDOrder: ${validated.shipmentId.slice(0, 8)}^FS
^FO50,170^A0N,30,30^FDDate: ${timestamp}^FS
^FO50,220^BY3
^BCN,100,Y,N,N
^FD${validated.shipmentId}^FS
^XZ
    `.trim();

        return NextResponse.json({ zplCode });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
