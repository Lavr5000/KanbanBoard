import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ai_suggestions')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to load AI suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to load suggestions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { taskId, improvedTitle, description, acceptanceCriteria, risks } = await request.json()

    if (!taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })
    }

    const { error } = await supabase
      .from('ai_suggestions')
      .insert({
        task_id: taskId,
        improved_title: improvedTitle,
        description,
        acceptance_criteria: acceptanceCriteria,
        risks,
      })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to save AI suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to save suggestions' },
      { status: 500 }
    )
  }
}
