'use client'

import { createContext, useContext } from 'react'
import type { Task as SupabaseTask } from '@/lib/supabase/types'

interface BoardContextType {
  addTask: (columnId: string, task: Partial<SupabaseTask>) => Promise<void>
  updateTask: (taskId: string, updates: Partial<SupabaseTask>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  moveTask: (taskId: string, newColumnId: string, newPosition: number) => Promise<void>
}

export const BoardContext = createContext<BoardContextType | null>(null)

export function useBoardContext() {
  const context = useContext(BoardContext)
  if (!context) {
    throw new Error('useBoardContext must be used within BoardContext.Provider')
  }
  return context
}
