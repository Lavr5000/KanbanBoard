import { SupabaseClient } from '@supabase/supabase-js'
import type { Column, InsertColumn, UpdateColumn } from '../types'

/**
 * Get all columns for a board
 */
export async function getColumns(supabase: SupabaseClient, boardId: string) {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position', { ascending: true })

  if (error) throw error
  return data as Column[]
}

/**
 * Get a single column by ID
 */
export async function getColumn(supabase: SupabaseClient, columnId: string) {
  const { data, error } = await supabase
    .from('columns')
    .select('*')
    .eq('id', columnId)
    .single()

  if (error) throw error
  return data as Column
}

/**
 * Create a new column
 */
export async function createColumn(
  supabase: SupabaseClient,
  column: InsertColumn
) {
  const { data, error } = await supabase
    .from('columns')
    .insert(column)
    .select()
    .single()

  if (error) throw error
  return data as Column
}

/**
 * Update an existing column
 */
export async function updateColumn(
  supabase: SupabaseClient,
  columnId: string,
  updates: UpdateColumn
) {
  const { data, error } = await supabase
    .from('columns')
    .update(updates)
    .eq('id', columnId)
    .select()
    .single()

  if (error) throw error
  return data as Column
}

/**
 * Delete a column
 */
export async function deleteColumn(supabase: SupabaseClient, columnId: string) {
  const { error } = await supabase.from('columns').delete().eq('id', columnId)

  if (error) throw error
}

/**
 * Reorder columns on a board
 */
export async function reorderColumns(
  supabase: SupabaseClient,
  boardId: string,
  columnIds: string[]
) {
  const updates = columnIds.map((id, index) => ({
    id,
    position: index,
  }))

  const { error } = await supabase.from('columns').upsert(updates)

  if (error) throw error
}

/**
 * Get column with all its tasks
 */
export async function getColumnWithTasks(
  supabase: SupabaseClient,
  columnId: string
) {
  const { data, error } = await supabase
    .from('columns')
    .select(
      `
      *,
      tasks (*)
    `
    )
    .eq('id', columnId)
    .single()

  if (error) throw error
  return data
}
