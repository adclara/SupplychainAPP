import { NextRequest, NextResponse } from 'next/server';
import { getShipmentHandOffLog } from '@/services/shippingService';
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
        const handOffLog = await getShipmentHandOffLog(waveId);

        return NextResponse.json({ handOffLog });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
