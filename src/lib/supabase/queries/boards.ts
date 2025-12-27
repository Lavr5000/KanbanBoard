import { SupabaseClient } from '@supabase/supabase-js'
import type { Board, InsertBoard, UpdateBoard } from '../types'

/**
 * Get all boards for the authenticated user
 */
export async function getBoards(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Board[]
}

/**
 * Get a single board by ID
 */
export async function getBoard(supabase: SupabaseClient, boardId: string) {
  const { data, error } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single()

  if (error) throw error
  return data as Board
}

/**
 * Create a new board
 */
export async function createBoard(
  supabase: SupabaseClient,
  board: InsertBoard
) {
  const { data, error } = await supabase
    .from('boards')
    .insert(board)
    .select()
    .single()

  if (error) throw error
  return data as Board
}

/**
 * Update an existing board
 */
export async function updateBoard(
  supabase: SupabaseClient,
  boardId: string,
  updates: UpdateBoard
) {
  const { data, error } = await supabase
    .from('boards')
    .update(updates)
    .eq('id', boardId)
    .select()
    .single()

  if (error) throw error
  return data as Board
}

/**
 * Delete a board
 */
export async function deleteBoard(supabase: SupabaseClient, boardId: string) {
  const { error } = await supabase.from('boards').delete().eq('id', boardId)

  if (error) throw error
}

/**
 * Get board with all its columns and tasks
 */
export async function getBoardWithData(
  supabase: SupabaseClient,
  boardId: string
) {
  const { data, error } = await supabase
    .from('boards')
    .select(
      `
      *,
      columns (
        *,
        tasks (*)
      )
    `
    )
    .eq('id', boardId)
    .single()

  if (error) throw error
  return data
}
