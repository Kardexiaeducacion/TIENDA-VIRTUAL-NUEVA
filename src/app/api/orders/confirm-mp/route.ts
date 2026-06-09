import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'No orderId' }, { status: 400 });

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Only update if still pending (don't override if webhook already set it)
    const { data: order } = await supabase
      .from('orders')
      .select('payment_status, payment_method')
      .eq('id', orderId)
      .single();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.payment_method !== 'mercadopago') return NextResponse.json({ skipped: true });

    if (order.payment_status !== 'verified') {
      await supabase
        .from('orders')
        .update({ payment_status: 'verified', status: 'confirmado' })
        .eq('id', orderId);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
