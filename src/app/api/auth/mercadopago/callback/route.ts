import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloe-kjxx9o184-kardexia-s-projects.vercel.app';

  if (error || !code) {
    console.error('MP OAuth error:', error);
    return NextResponse.redirect(new URL('/editor/payments?error=mp_connect_failed', request.url));
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_MERCADOPAGO_APP_ID;
    const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/auth/mercadopago/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Faltan credenciales de Mercado Pago en el servidor.');
    }

    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('MP token exchange failed:', tokenData);
      throw new Error(tokenData.message || tokenData.error || 'Error al obtener token de Mercado Pago');
    }

    // Fetch the MP user info to get email
    let mpEmail = '';
    try {
      const userRes = await fetch('https://api.mercadopago.com/v1/account/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        mpEmail = userData.email || '';
      }
    } catch (e) {
      // non-fatal
    }

    // Save tokens to payment_settings
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('payment_settings')
      .update({
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token || null,
        mp_user_id: String(tokenData.user_id || ''),
        mp_account_email: mpEmail,
        enabled: true,
      })
      .eq('method', 'mercadopago');

    if (updateError) {
      console.error('Error saving MP tokens:', updateError);
      throw new Error('No se pudieron guardar las credenciales de Mercado Pago.');
    }

    return NextResponse.redirect(new URL('/editor/payments?success=mp_connected', request.url));
  } catch (error: any) {
    console.error('MercadoPago OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/editor/payments?error=mp_connect_failed&msg=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
