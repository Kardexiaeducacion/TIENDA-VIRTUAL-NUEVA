import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get current token to revoke it with MP
    const { data: mpSettings } = await supabase
      .from('payment_settings')
      .select('mp_access_token')
      .eq('method', 'mercadopago')
      .single();

    // Try to revoke the token with MP (non-fatal if it fails)
    if (mpSettings?.mp_access_token) {
      try {
        await fetch('https://api.mercadopago.com/oauth/token', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${mpSettings.mp_access_token}` },
        });
      } catch (_) {}
    }

    // Clear all OAuth fields
    const { error } = await supabase
      .from('payment_settings')
      .update({
        mp_access_token: null,
        mp_refresh_token: null,
        mp_user_id: null,
        mp_account_email: null,
        enabled: false,
      })
      .eq('method', 'mercadopago');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
