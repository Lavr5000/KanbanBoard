import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface TaskCreationResult {
  success: boolean
  created: number
  errors: string[]
}

/**
 * Create first N tasks from parsed roadmap
 * Searches for "New Tasks" column or uses first column
 */
export async function createTasksFromRoadmap(
  boardId: string,
  tasks: Array<{ title: string }>,
  maxTasks: number = 5
): Promise<TaskCreationResult> {
  const result: TaskCreationResult = {
    success: false,
    created: 0,
    errors: []
  }

  if (tasks.length === 0) {
    result.errors.push('Нет задач для создания')
    return result
  }

  try {
    // 1. Find columns
    const { data: columns, error: columnsError } = await supabase
      .from('columns')
      .select('id, title, position')
      .eq('board_id', boardId)
      .order('position', { ascending: true })

    if (columnsError) throw columnsError

    // 2. Always use first column (leftmost)
    const targetColumn = columns && columns.length > 0 ? columns[0] : null

    if (!targetColumn) {
      result.errors.push('Не найдена колонка для создания задач')
      return result
    }

    // 3. Create tasks (max maxTasks)
    const tasksToCreate = tasks.slice(0, maxTasks)

    for (const task of tasksToCreate) {
      // Truncate title to max 255 characters (VARCHAR limit)
      let title = task.title
      if (title.length > 255) {
        title = title.substring(0, 252) + '...'
      }

      const taskData = {
        board_id: boardId,
        column_id: targetColumn.id,
        title,
        priority: 'medium' as const,
        position: await getNextPosition(targetColumn.id),
      }
      console.log('📝 Creating task:', taskData)

      const { error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)

      if (taskError) {
        console.error('❌ Task creation error:', taskError)
        result.errors.push(`Ошибка создания задачи "${task.title}": ${taskError.message}`)
      } else {
        console.log('✅ Task created successfully')
        result.created++
      }
    }

    result.success = result.created > 0

  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : 'Unknown error')
  }

  return result
}

/**
 * Get next position value for a new task in column
 */
async function getNextPosition(columnId: string): Promise<number> {
  const { data } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (data?.position ?? -1) + 1
}
