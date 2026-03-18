import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { board_id, column_id, title, description, priority } = body

    const { data: existingTasks, error: countError } = await supabase
      .from('tasks')
      .select('id')
      .eq('column_id', column_id)

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    const position = existingTasks?.length || 0

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        board_id,
        column_id,
        title: title || '',
        description: description || '',
        priority: priority || 'medium',
        position,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
