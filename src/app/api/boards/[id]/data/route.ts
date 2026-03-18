import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', id)
      .single()

    if (boardError) {
      return NextResponse.json({ error: boardError.message }, { status: 404 })
    }

    const { data: columns, error: columnsError } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', id)
      .order('position', { ascending: true })

    if (columnsError) {
      return NextResponse.json({ error: columnsError.message }, { status: 500 })
    }

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('board_id', id)
      .order('position', { ascending: true })

    if (tasksError) {
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }

    return NextResponse.json({ board, columns: columns || [], tasks: tasks || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
