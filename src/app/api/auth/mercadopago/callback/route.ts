import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Use the stable production base URL
  const baseUrl = 'https://cloe-app-git-main-kardexia-s-projects.vercel.app';

  console.log('[MP Callback] Received. code:', code ? 'YES' : 'NO', '| error:', error);

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/editor/payments?error=mp_no_code&msg=${encodeURIComponent(error || 'No authorization code received')}`);
  }

  const clientId = process.env.NEXT_PUBLIC_MERCADOPAGO_APP_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/mercadopago/callback`;

  console.log('[MP Callback] clientId:', clientId?.substring(0, 8) ?? 'MISSING');
  console.log('[MP Callback] clientSecret:', clientSecret ? 'SET' : 'MISSING');
  console.log('[MP Callback] redirectUri:', redirectUri);

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/editor/payments?error=missing_credentials&msg=Missing+MP+credentials+in+environment`);
  }

  // Exchange code for token
  let tokenData: any;
  try {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
    });

    console.log('[MP Callback] Sending token exchange to MP...');
    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    tokenData = await tokenRes.json();
    console.log('[MP Callback] Token response status:', tokenRes.status);
    console.log('[MP Callback] Token data:', JSON.stringify(tokenData).substring(0, 200));

    if (!tokenRes.ok || !tokenData.access_token) {
      const errMsg = tokenData.message || tokenData.error_description || tokenData.error || `HTTP ${tokenRes.status}`;
      return NextResponse.redirect(`${baseUrl}/editor/payments?error=token_exchange_failed&msg=${encodeURIComponent(errMsg)}`);
    }
  } catch (fetchError: any) {
    console.error('[MP Callback] Fetch error:', fetchError.message);
    return NextResponse.redirect(`${baseUrl}/editor/payments?error=network_error&msg=${encodeURIComponent(fetchError.message)}`);
  }

  // Save to Supabase using service role (bypasses RLS)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    console.log('[MP Callback] Saving to Supabase...');

    const { error: dbError } = await supabase
      .from('payment_settings')
      .update({
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token ?? null,
        mp_user_id: String(tokenData.user_id ?? ''),
        mp_account_email: tokenData.email ?? '',
        enabled: true,
      })
      .eq('method', 'mercadopago');

    if (dbError) {
      console.error('[MP Callback] DB update error:', JSON.stringify(dbError));
      return NextResponse.redirect(`${baseUrl}/editor/payments?error=db_error&msg=${encodeURIComponent(dbError.message)}`);
    }

    console.log('[MP Callback] SUCCESS');
    return NextResponse.redirect(`${baseUrl}/editor/payments?success=mp_connected`);
  } catch (dbErr: any) {
    console.error('[MP Callback] DB exception:', dbErr.message);
    return NextResponse.redirect(`${baseUrl}/editor/payments?error=db_exception&msg=${encodeURIComponent(dbErr.message)}`);
  }
}
