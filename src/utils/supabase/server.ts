import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Fallback to hardcoded values if env vars are missing at runtime
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://rmdmrtsbbymorsumijph.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZG1ydHNiYnltb3JzdW1panBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDM4MjQsImV4cCI6MjA5NTU3OTgyNH0.YqQyQGIpZCIyqTR1WYsFBYoDCHiJr0TuaHFVYvoKoeI'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
