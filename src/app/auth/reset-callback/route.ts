import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Determine the base URL (handles Vercel's load balancer)
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  const baseUrl = isLocalEnv
    ? origin
    : forwardedHost
    ? `https://${forwardedHost}`
    : origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Hardcoded redirect to reset-password since this route is only used for password recovery
      return NextResponse.redirect(`${baseUrl}/reset-password`)
    }
    console.error('[auth/reset-callback] exchangeCodeForSession error:', error.message)
  }

  // If no code or exchange failed, redirect to login with error
  return NextResponse.redirect(`${baseUrl}/login?error=invalid_link`)
}
