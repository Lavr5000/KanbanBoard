import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { model, operation, inputTokens, outputTokens, costUsd, boardId, metadata } = await request.json()

    const { error } = await supabase.rpc('track_ai_usage', {
      p_model: model,
      p_operation: operation,
      p_input_tokens: inputTokens || 0,
      p_output_tokens: outputTokens || 0,
      p_cost_usd: costUsd || 0,
      p_board_id: boardId || null,
      p_metadata: metadata || {},
    })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to track AI usage:', error)
    return NextResponse.json(
      { error: 'Failed to track AI usage' },
      { status: 500 }
    )
  }
}
