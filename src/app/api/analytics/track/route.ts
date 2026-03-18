import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { eventType, properties } = await request.json()

    const { error } = await supabase.rpc('track_analytics_event', {
      p_event_type: eventType,
      p_properties: properties || {},
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to track analytics event:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
