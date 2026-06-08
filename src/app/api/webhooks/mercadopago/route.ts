import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data, action } = body;

    console.log('[MP Webhook] Received:', JSON.stringify({ type, action, data }));

    // MP sends payment notifications
    const paymentId = data?.id ? String(data.id) : null;
    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the mp_access_token from DB
    const { data: mpSettings } = await supabase
      .from('payment_settings')
      .select('mp_access_token')
      .eq('method', 'mercadopago')
      .single();

    if (!mpSettings?.mp_access_token) {
      console.log('[MP Webhook] No MP token configured');
      return NextResponse.json({ received: true });
    }

    // Fetch payment details directly from MP API
    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${mpSettings.mp_access_token}` },
    });

    if (!paymentRes.ok) {
      console.error('[MP Webhook] Could not fetch payment:', paymentId, paymentRes.status);
      return NextResponse.json({ received: true });
    }

    const paymentData = await paymentRes.json();
    const orderId = paymentData.external_reference;
    const status = paymentData.status;

    console.log('[MP Webhook] Payment status:', status, '| Order:', orderId);

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    if (status === 'approved') {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'verified',
          status: 'confirmado',
          payment_tracking_key: String(paymentId),
        })
        .eq('id', orderId);

      if (error) console.error('[MP Webhook] DB update error:', error);
      else console.log('[MP Webhook] Order', orderId, 'marked as confirmed');

    } else if (status === 'rejected' || status === 'cancelled') {
      await supabase
        .from('orders')
        .update({ payment_status: 'rejected', status: 'reporte' })
        .eq('id', orderId);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[MP Webhook] Error:', error.message);
    return NextResponse.json({ received: true }); // Always return 200 to MP
  }
}

// MP sends GET pings to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
