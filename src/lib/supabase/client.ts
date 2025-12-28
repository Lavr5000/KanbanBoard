import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in the browser (Client Components)
 *
 * Usage:
 * ```tsx
 * 'use client'
 * import { createClient } from '@/lib/supabase/client'
 *
 * const supabase = createClient()
 * const { data } = await supabase.from('tasks').select('*')
 * ```
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // During build time, env vars may not be available
    // Return a mock client that will be replaced at runtime
    throw new Error(
      'Supabase environment variables are missing. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    )
  }

  return createBrowserClient(url, key)
}
