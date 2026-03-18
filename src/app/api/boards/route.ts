import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    const { data: newBoard, error: boardError } = await supabase
      .from('boards')
      .insert({
        user_id: user.id,
        name: (name || 'My Kanban Board').trim(),
      })
      .select()
      .single()

    if (boardError) {
      return NextResponse.json({ error: boardError.message }, { status: 500 })
    }

    const defaultColumns = [
      { board_id: newBoard.id, title: 'Новая задача', position: 0 },
      { board_id: newBoard.id, title: 'Выполняется', position: 1 },
      { board_id: newBoard.id, title: 'На тестировании', position: 2 },
      { board_id: newBoard.id, title: 'Выполнено', position: 3 },
    ]

    const { error: columnsError } = await supabase
      .from('columns')
      .insert(defaultColumns)

    if (columnsError) {
      return NextResponse.json({ error: columnsError.message }, { status: 500 })
    }

    return NextResponse.json(newBoard)
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
