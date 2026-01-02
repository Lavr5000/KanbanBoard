import { SupabaseClient } from '@supabase/supabase-js'
import type { Task, InsertTask, UpdateTask, Priority } from '../types'

/**
 * Sanitize search query to prevent injection
 */
function sanitizeSearchQuery(query: string): string {
  // Remove special characters that could be used for injection
  // Keep only alphanumeric, spaces, and basic punctuation
  return query
    .replace(/[%;\\]/g, '') // Remove SQL special chars
    .trim()
    .slice(0, 100) // Limit length
}

/**
 * Get all tasks for a board
 */
export async function getTasks(supabase: SupabaseClient, boardId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true })

  if (error) throw error
  return data as Task[]
}

/**
 * Get all tasks for a specific column
 */
export async function getTasksByColumn(
  supabase: SupabaseClient,
  columnId: string
) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('column_id', columnId)
    .order('position', { ascending: true })

  if (error) throw error
  return data as Task[]
}

/**
 * Get a single task by ID
 */
export async function getTask(supabase: SupabaseClient, taskId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) throw error
  return data as Task
}

/**
 * Create a new task
 */
export async function createTask(supabase: SupabaseClient, task: InsertTask) {
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

/**
 * Update an existing task
 */
export async function updateTask(
  supabase: SupabaseClient,
  taskId: string,
  updates: UpdateTask
) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

/**
 * Delete a task
 */
export async function deleteTask(supabase: SupabaseClient, taskId: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)

  if (error) throw error
}

/**
 * Move task to a different column
 */
export async function moveTask(
  supabase: SupabaseClient,
  taskId: string,
  newColumnId: string,
  newPosition: number
) {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      column_id: newColumnId,
      position: newPosition,
    })
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

/**
 * Reorder tasks within a column
 */
export async function reorderTasks(
  supabase: SupabaseClient,
  columnId: string,
  taskIds: string[]
) {
  const updates = taskIds.map((id, index) => ({
    id,
    position: index,
  }))

  const { error } = await supabase.from('tasks').upsert(updates)

  if (error) throw error
}

/**
 * Search tasks by title or description
 */
export async function searchTasks(
  supabase: SupabaseClient,
  boardId: string,
  query: string
) {
  // Sanitize query to prevent injection
  const sanitizedQuery = sanitizeSearchQuery(query)

  // Skip search if sanitized query is empty
  if (!sanitizedQuery) {
    return []
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .or(`title.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Task[]
}

/**
 * Get tasks by priority
 */
export async function getTasksByPriority(
  supabase: SupabaseClient,
  boardId: string,
  priority: Priority
) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .eq('priority', priority)
    .order('deadline', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data as Task[]
}

/**
 * Get tasks with upcoming deadlines
 */
export async function getTasksWithUpcomingDeadlines(
  supabase: SupabaseClient,
  boardId: string,
  daysAhead: number = 7
) {
  const now = new Date()
  const future = new Date()
  future.setDate(now.getDate() + daysAhead)

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .gte('deadline', now.toISOString())
    .lte('deadline', future.toISOString())
    .order('deadline', { ascending: true })

  if (error) throw error
  return data as Task[]
}

/**
 * Get overdue tasks
 */
export async function getOverdueTasks(
  supabase: SupabaseClient,
  boardId: string
) {
  const now = new Date()

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', boardId)
    .lt('deadline', now.toISOString())
    .order('deadline', { ascending: true })

  if (error) throw error
  return data as Task[]
}
