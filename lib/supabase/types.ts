// Database types for Kanban Board 2.0

export type Priority = 'low' | 'medium' | 'high'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Board {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Column {
  id: string
  board_id: string
  title: string
  position: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  column_id: string
  board_id: string
  title: string
  description: string | null
  priority: Priority
  deadline: string | null
  position: number
  created_at: string
  updated_at: string
}

// Insert types (without auto-generated fields)
export type InsertBoard = Omit<Board, 'id' | 'created_at' | 'updated_at'>
export type InsertColumn = Omit<Column, 'id' | 'created_at' | 'updated_at'>
export type InsertTask = Omit<Task, 'id' | 'created_at' | 'updated_at'>

// Update types (all fields optional except id)
export type UpdateBoard = Partial<Omit<Board, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
export type UpdateColumn = Partial<Omit<Column, 'id' | 'board_id' | 'created_at' | 'updated_at'>>
export type UpdateTask = Partial<Omit<Task, 'id' | 'board_id' | 'created_at' | 'updated_at'>>
