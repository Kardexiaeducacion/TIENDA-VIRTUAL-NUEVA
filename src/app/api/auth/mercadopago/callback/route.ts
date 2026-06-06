import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloe-app-git-main-kardexia-s-projects.vercel.app';

  if (error || !code) {
    console.error('MP OAuth error:', error);
    return NextResponse.redirect(new URL('/editor/payments?error=mp_connect_failed', request.url));
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_MERCADOPAGO_APP_ID;
    const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/auth/mercadopago/callback`;

    console.log('[MP Callback] clientId:', clientId ? 'SET' : 'MISSING');
    console.log('[MP Callback] clientSecret:', clientSecret ? 'SET' : 'MISSING');
    console.log('[MP Callback] redirectUri:', redirectUri);
    console.log('[MP Callback] code:', code?.substring(0, 10) + '...');

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
    console.log('[MP Callback] token response status:', tokenResponse.status);
    console.log('[MP Callback] token data keys:', Object.keys(tokenData));

    if (!tokenResponse.ok) {
      console.error('[MP Callback] Token exchange failed:', JSON.stringify(tokenData));
      throw new Error(tokenData.message || tokenData.error_description || tokenData.error || 'Error al obtener token de Mercado Pago');
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
        console.log('[MP Callback] user email:', mpEmail);
      }
    } catch (e) {
      console.error('[MP Callback] Could not fetch user info (non-fatal):', e);
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First check if the row exists
    const { data: existing } = await supabase
      .from('payment_settings')
      .select('id')
      .eq('method', 'mercadopago')
      .single();

    console.log('[MP Callback] Existing row:', existing ? existing.id : 'NOT FOUND');

    let dbError;
    if (existing) {
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
      dbError = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('payment_settings')
        .insert({
          method: 'mercadopago',
          mp_access_token: tokenData.access_token,
          mp_refresh_token: tokenData.refresh_token || null,
          mp_user_id: String(tokenData.user_id || ''),
          mp_account_email: mpEmail,
          enabled: true,
        });
      dbError = insertError;
    }

    if (dbError) {
      console.error('[MP Callback] DB error:', JSON.stringify(dbError));
      throw new Error('No se pudieron guardar las credenciales: ' + dbError.message);
    }

    console.log('[MP Callback] SUCCESS - account linked!');
    return NextResponse.redirect(new URL('/editor/payments?success=mp_connected', request.url));
  } catch (error: any) {
    console.error('[MP Callback] Fatal error:', error.message);
    return NextResponse.redirect(
      new URL(`/editor/payments?error=mp_connect_failed&msg=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
