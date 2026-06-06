import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const baseUrl = 'https://cloe-app-git-main-kardexia-s-projects.vercel.app';

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/editor/payments?error=mp_no_code&msg=${encodeURIComponent(error || 'No authorization code received')}`);
  }

  const clientId = process.env.NEXT_PUBLIC_MERCADOPAGO_APP_ID;
  const clientSecret = process.env.MERCADOPAGO_CLIENT_SECRET;
  const redirectUri = `${baseUrl}/api/auth/mercadopago/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/editor/payments?error=missing_credentials`);
  }

  try {
    // 1. Exchange code for token
    const tokenRes = await fetch('https://api.mercadopago.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.access_token) {
      const errMsg = tokenData.message || tokenData.error_description || tokenData.error || `HTTP ${tokenRes.status}`;
      return NextResponse.redirect(`${baseUrl}/editor/payments?error=token_failed&msg=${encodeURIComponent(errMsg)}`);
    }

    // 2. Fetch user email from MP
    let mpEmail = '';
    let mpNickname = '';
    try {
      const userRes = await fetch('https://api.mercadopago.com/v1/account/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        mpEmail = userData.email || '';
        mpNickname = userData.nickname || userData.first_name || '';
      }
    } catch (_) {}

    // 3. Save to Supabase with service role (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: dbError } = await supabase
      .from('payment_settings')
      .update({
        mp_access_token: tokenData.access_token,
        mp_refresh_token: tokenData.refresh_token ?? null,
        mp_user_id: String(tokenData.user_id ?? ''),
        mp_account_email: mpEmail || mpNickname || `Usuario MP #${tokenData.user_id}`,
        enabled: true,
      })
      .eq('method', 'mercadopago');

    if (dbError) {
      return NextResponse.redirect(`${baseUrl}/editor/payments?error=db_error&msg=${encodeURIComponent(dbError.message)}`);
    }

    return NextResponse.redirect(`${baseUrl}/editor/payments?success=mp_connected`);
  } catch (err: any) {
    return NextResponse.redirect(`${baseUrl}/editor/payments?error=exception&msg=${encodeURIComponent(err.message)}`);
  }
}
