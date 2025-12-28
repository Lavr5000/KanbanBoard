/**
 * Task Adapter - преобразует данные между Supabase и UI форматами
 */

import type { Task as SupabaseTask } from '@/lib/supabase/types'
import type { Task as UITask, Column as UIColumn } from '@/entities/task/model/types'

/**
 * Преобразует задачу из Supabase формата в UI формат
 */
export function supabaseTaskToUI(task: SupabaseTask): UITask {
  return {
    id: task.id,
    columnId: task.column_id,
    content: task.title, // title → content
    priority: task.priority,
    status: 'active', // default status for UI
    type: 'feature', // default type for UI
    tags: [], // TODO: add tags support in Supabase
    createdAt: task.created_at,
    assigneeId: undefined, // TODO: add assignee support
  }
}

/**
 * Преобразует задачу из UI формата в Supabase формат для создания
 */
export function uiTaskToSupabase(
  task: Partial<UITask>,
  boardId: string,
  columnId: string
): Partial<SupabaseTask> {
  return {
    board_id: boardId,
    column_id: columnId,
    title: task.content || 'New Task',
    description: '', // TODO: extract from content if needed
    priority: task.priority || 'medium',
    deadline: null,
    position: 0, // will be set by backend
  }
}

/**
 * Преобразует колонку из Supabase формата в UI формат
 */
export function supabaseColumnToUI(column: any): UIColumn {
  return {
    id: column.id,
    title: column.title,
  }
}
