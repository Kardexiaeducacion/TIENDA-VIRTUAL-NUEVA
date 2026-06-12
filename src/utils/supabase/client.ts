import { createBrowserClient } from '@supabase/ssr'

// Fallback to hardcoded values if env vars are missing at runtime
// These are NEXT_PUBLIC_ keys — safe to expose in the browser
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://rmdmrtsbbymorsumijph.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZG1ydHNiYnltb3JzdW1panBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMDM4MjQsImV4cCI6MjA5NTU3OTgyNH0.YqQyQGIpZCIyqTR1WYsFBYoDCHiJr0TuaHFVYvoKoeI'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
