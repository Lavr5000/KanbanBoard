import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const supabase = await createClient()
    const { boardId } = await params
    const { tasks, maxTasks = 5 } = await request.json()

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        success: false,
        created: 0,
        errors: ['No tasks provided'],
      })
    }

    const { data: columns, error: columnsError } = await supabase
      .from('columns')
      .select('id, title, position')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (columnsError) throw columnsError

    const targetColumn = columns && columns.length > 0 ? columns[0] : null

    if (!targetColumn) {
      return NextResponse.json({
        success: false,
        created: 0,
        errors: ['No column found for task creation'],
      })
    }

    const tasksToCreate = tasks.slice(0, maxTasks)
    let created = 0
    const errors: string[] = []

    for (const task of tasksToCreate) {
      let title = task.title
      if (title.length > 255) {
        title = title.substring(0, 252) + '...'
      }

      // Get next position
      const { data: lastTask } = await supabase
        .from('tasks')
        .select('position')
        .eq('column_id', targetColumn.id)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle()

      const position = (lastTask?.position ?? -1) + 1

      const { error: taskError } = await supabase
        .from('tasks')
        .insert({
          board_id: boardId,
          column_id: targetColumn.id,
          title,
          priority: 'medium',
          position,
        })

      if (taskError) {
        errors.push(`Failed to create task "${task.title}": ${taskError.message}`)
      } else {
        created++
      }
    }

    return NextResponse.json({
      success: created > 0,
      created,
      errors,
    })
  } catch (error) {
    console.error('Failed to create tasks from roadmap:', error)
    return NextResponse.json(
      { error: 'Failed to create tasks' },
      { status: 500 }
    )
  }
}
