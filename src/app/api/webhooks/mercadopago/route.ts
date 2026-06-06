import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // MP sends payment notifications with type='payment' and data.id = payment_id
    if (type === 'payment' && data?.id) {
      const paymentId = String(data.id);

      // Get the mp_access_token from DB
      const supabase = await createClient();
      const { data: mpSettings } = await supabase
        .from('payment_settings')
        .select('mp_access_token')
        .eq('method', 'mercadopago')
        .single();

      if (!mpSettings?.mp_access_token) {
        return NextResponse.json({ error: 'No MP token configured' }, { status: 400 });
      }

      // Fetch payment details from MP API
      const client = new MercadoPagoConfig({ accessToken: mpSettings.mp_access_token });
      const paymentClient = new Payment(client);
      const paymentData = await paymentClient.get({ id: paymentId });

      if (!paymentData) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      const orderId = paymentData.external_reference;
      const status = paymentData.status;

      if (!orderId) {
        return NextResponse.json({ received: true });
      }

      // Update order based on payment status
      if (status === 'approved') {
        await supabase
          .from('orders')
          .update({
            payment_status: 'verified',
            status: 'confirmado',
            payment_tracking_key: paymentId,
          })
          .eq('id', orderId);
      } else if (status === 'rejected' || status === 'cancelled') {
        await supabase
          .from('orders')
          .update({ payment_status: 'rejected' })
          .eq('id', orderId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('MP Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// MP also sends GET pings to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
