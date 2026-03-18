import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ user: null })
  }
}
