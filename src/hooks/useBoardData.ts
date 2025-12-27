'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, Column, Board } from '@/lib/supabase/types'
import { useAuth } from '@/providers/AuthProvider'

interface UseBoardDataReturn {
  board: Board | null
  columns: Column[]
  tasks: Task[]
  loading: boolean
  error: Error | null

  // Mutations
  addTask: (columnId: string, task: Partial<Task>) => Promise<void>
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  moveTask: (taskId: string, newColumnId: string, newPosition: number) => Promise<void>

  // Optimistic state
  optimisticTasks: Task[]
  optimisticColumns: Column[]
}

/**
 * Custom hook for board data with Supabase integration
 * Handles data loading, real-time subscriptions, and mutations
 */
export function useBoardData(boardId?: string): UseBoardDataReturn {
  const { user } = useAuth()
  const supabase = createClient()

  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Optimistic state (for instant UI updates before server confirms)
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([])
  const [optimisticColumns, setOptimisticColumns] = useState<Column[]>([])

  // Load initial data
  useEffect(() => {
    if (!user) return

    async function loadData() {
      try {
        setLoading(true)

        // Get user's first board (or create one if doesn't exist)
        let { data: boards, error: boardsError } = await supabase
          .from('boards')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(1)

        if (boardsError) throw boardsError

        // Create default board if none exists
        if (!boards || boards.length === 0) {
          const { data: newBoard, error: createError } = await supabase
            .from('boards')
            .insert({
              user_id: user.id,
              name: 'My Kanban Board',
              description: 'Default board'
            })
            .select()
            .single()

          if (createError) throw createError
          setBoard(newBoard)

          // Create default columns for new board
          const defaultColumns = [
            { board_id: newBoard.id, title: 'Новая задача', position: 0 },
            { board_id: newBoard.id, title: 'Выполняется', position: 1 },
            { board_id: newBoard.id, title: 'Ожидает проверки', position: 2 },
            { board_id: newBoard.id, title: 'На тестировании', position: 3 },
            { board_id: newBoard.id, title: 'В доработку', position: 4 },
          ]

          const { data: newColumns, error: columnsError } = await supabase
            .from('columns')
            .insert(defaultColumns)
            .select()

          if (columnsError) throw columnsError
          setColumns(newColumns)
        } else {
          setBoard(boards[0])

          // Load columns
          const { data: columnsData, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('board_id', boards[0].id)
            .order('position', { ascending: true })

          if (columnsError) throw columnsError
          setColumns(columnsData || [])

          // Load tasks
          const { data: tasksData, error: tasksError } = await supabase
            .from('tasks')
            .select('*')
            .eq('board_id', boards[0].id)
            .order('position', { ascending: true })

          if (tasksError) throw tasksError
          setTasks(tasksData || [])
        }

        setOptimisticTasks(tasks)
        setOptimisticColumns(columns)
      } catch (err) {
        console.error('Error loading board data:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Real-time subscriptions
  useEffect(() => {
    if (!board) return

    // Subscribe to tasks changes
    const tasksSubscription = supabase
      .channel(`board-${board.id}-tasks`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `board_id=eq.${board.id}`,
        },
        (payload) => {
          console.log('Task change:', payload)

          if (payload.eventType === 'INSERT') {
            setTasks((prev) => [...prev, payload.new as Task])
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? (payload.new as Task) : t))
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    // Subscribe to columns changes
    const columnsSubscription = supabase
      .channel(`board-${board.id}-columns`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'columns',
          filter: `board_id=eq.${board.id}`,
        },
        (payload) => {
          console.log('Column change:', payload)

          if (payload.eventType === 'INSERT') {
            setColumns((prev) => [...prev, payload.new as Column])
          } else if (payload.eventType === 'UPDATE') {
            setColumns((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as Column) : c))
            )
          } else if (payload.eventType === 'DELETE') {
            setColumns((prev) => prev.filter((c) => c.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      tasksSubscription.unsubscribe()
      columnsSubscription.unsubscribe()
    }
  }, [board])

  // Mutations
  const addTask = async (columnId: string, taskData: Partial<Task>) => {
    if (!board) return

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          board_id: board.id,
          column_id: columnId,
          title: taskData.title || 'New Task',
          description: taskData.description || '',
          priority: taskData.priority || 'medium',
          position: tasks.filter((t) => t.column_id === columnId).length,
        })
        .select()
        .single()

      if (error) throw error

      // Realtime will update the state
    } catch (err) {
      console.error('Error adding task:', err)
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) throw error
    } catch (err) {
      console.error('Error updating task:', err)
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  }

  const moveTask = async (
    taskId: string,
    newColumnId: string,
    newPosition: number
  ) => {
    // Optimistic update
    setOptimisticTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, column_id: newColumnId, position: newPosition }
          : t
      )
    )

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          column_id: newColumnId,
          position: newPosition,
        })
        .eq('id', taskId)

      if (error) throw error
    } catch (err) {
      console.error('Error moving task:', err)
      // Rollback optimistic update
      setOptimisticTasks(tasks)
      throw err
    }
  }

  return {
    board,
    columns,
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    optimisticTasks,
    optimisticColumns,
  }
}
