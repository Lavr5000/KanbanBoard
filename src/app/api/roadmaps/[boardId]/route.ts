import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const supabase = await createClient()
    const { boardId } = await params

    const { data, error } = await supabase
      .from('roadmaps')
      .select('content')
      .eq('board_id', boardId)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json({ content: data?.content || '' })
  } catch (error) {
    console.error('Failed to load roadmap:', error)
    return NextResponse.json(
      { error: 'Failed to load roadmap' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const supabase = await createClient()
    const { boardId } = await params
    const { content } = await request.json()

    const { error } = await supabase
      .from('roadmaps')
      .upsert(
        { board_id: boardId, content },
        { onConflict: 'board_id' }
      )

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to save roadmap:', error)
    return NextResponse.json(
      { error: 'Failed to save roadmap' },
      { status: 500 }
    )
  }
}
