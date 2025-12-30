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

  // Refetch
  refetchColumns: () => Promise<void>
}

/**
 * Custom hook for board data with Supabase integration
 * Handles data loading, real-time subscriptions, and mutations
 */
export function useBoardData(boardId?: string): UseBoardDataReturn {
  const { user, loading: authLoading } = useAuth()
  const supabase = createClient()

  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Optimistic state (for instant UI updates before server confirms)
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([])
  const [optimisticColumns, setOptimisticColumns] = useState<Column[]>([])

  // Refetch function for columns
  const refetchColumns = async () => {
    if (!board) return
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('board_id', board.id)
      .order('position', { ascending: true })

    if (!error && data) {
      setColumns(data)
      setOptimisticColumns(data)
    }
  }

  // Load initial data
  useEffect(() => {
    // Wait for auth to complete before loading data
    if (authLoading || !user) return

    async function loadData() {
      try {
        setLoading(true)

        // Get active board ID from localStorage or use provided boardId
        const ACTIVE_BOARD_KEY = 'activeBoardId'
        let targetBoardId = boardId || (typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_BOARD_KEY) : null)

        // Get the board to load
        let boardToLoad: Board | null = null

        if (targetBoardId) {
          // Load specific board
          const { data: targetBoard, error: targetError } = await supabase
            .from('boards')
            .select('*')
            .eq('id', targetBoardId)
            .single()

          if (!targetError && targetBoard) {
            boardToLoad = targetBoard
          }
        }

        // If no board found, get user's first board (or create one)
        if (!boardToLoad) {
          let { data: boards, error: boardsError } = await supabase
            .from('boards')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(1)

          if (boardsError) throw boardsError

          // Create default board if none exists
          if (!boards || boards.length === 0) {
            if (!user) return // Extra safety check for TypeScript

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
            boardToLoad = newBoard

            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(ACTIVE_BOARD_KEY, newBoard.id)
            }

            // Create default columns for new board
            const defaultColumns = [
              { board_id: newBoard.id, title: 'Новая задача', position: 0 },
              { board_id: newBoard.id, title: 'Выполняется', position: 1 },
              { board_id: newBoard.id, title: 'На тестировании', position: 2 },
              { board_id: newBoard.id, title: 'Выполнено', position: 3 },
            ]

            const { data: newColumns, error: columnsError } = await supabase
              .from('columns')
              .insert(defaultColumns)
              .select()

            if (columnsError) throw columnsError
            setBoard(newBoard)
            setColumns(newColumns || [])
            setTasks([])
            setOptimisticTasks([])
            setOptimisticColumns(newColumns || [])
            setLoading(false)
            return
          } else {
            boardToLoad = boards[0]
            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem(ACTIVE_BOARD_KEY, boards[0].id)
            }
          }
        }

        setBoard(boardToLoad)

        // Load columns
        const { data: columnsData, error: columnsError } = await supabase
          .from('columns')
          .select('*')
          .eq('board_id', boardToLoad!.id)
          .order('position', { ascending: true })

        if (columnsError) throw columnsError
        setColumns(columnsData || [])

        // Load tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('board_id', boardToLoad!.id)
          .order('position', { ascending: true })

        if (tasksError) throw tasksError
        setTasks(tasksData || [])

        setOptimisticTasks(tasksData || [])
        setOptimisticColumns(columnsData || [])
      } catch (err) {
        console.error('Error loading board data:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, authLoading, boardId])

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
    if (!board) {
      console.error('❌ No board found')
      return
    }

    console.log('📝 Adding task:', { columnId, taskData, boardId: board.id })

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          board_id: board.id,
          column_id: columnId,
          title: taskData.title || '',
          description: taskData.description || '',
          priority: (taskData.priority as any) || 'medium',
          position: tasks.filter((t) => t.column_id === columnId).length,
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase error detected')
        console.error('Error object keys:', Object.keys(error))
        console.error('Error message:', (error as any).message)
        console.error('Error code:', (error as any).code)
        console.error('Error details:', (error as any).details)
        console.error('Error hint:', (error as any).hint)
        console.error('Full error:', error)
        throw error
      }

      console.log('✅ Task added:', data)

      // Optimistic update - update UI immediately
      setTasks((prev) => [...prev, data])
    } catch (err) {
      console.error('❌ Error adding task:', err)
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Save current state for rollback
    const previousTasks = tasks

    // Optimistic update - update UI immediately
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      )
    )

    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)

      if (error) throw error
    } catch (err) {
      console.error('Error updating task:', err)
      // Rollback optimistic update
      setTasks(previousTasks)
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    // Save current state for rollback
    const previousTasks = tasks

    // Optimistic update - remove from UI immediately
    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
    } catch (err) {
      console.error('Error deleting task:', err)
      // Rollback optimistic update
      setTasks(previousTasks)
      throw err
    }
  }

  const moveTask = async (
    taskId: string,
    newColumnId: string,
    newPosition: number
  ) => {
    console.log('🚚 moveTask called:', { taskId, newColumnId, newPosition })

    // Save current state for rollback
    const previousTasks = tasks

    // Optimistic update - update UI immediately
    console.log('📤 Optimistic update: updating task', taskId, 'to column', newColumnId)
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId
          ? { ...t, column_id: newColumnId, position: newPosition }
          : t
      )
      console.log('📤 Optimistic update result:', updated.map(t => ({ id: t.id, column_id: t.column_id })))
      return updated
    })

    try {
      console.log('🌐 Sending Supabase update request...')
      const { error, data } = await supabase
        .from('tasks')
        .update({
          column_id: newColumnId,
          position: newPosition,
        })
        .eq('id', taskId)
        .select()

      if (error) {
        console.error('❌ Supabase update error:', error)
        throw error
      }
      console.log('✅ Supabase update success, data:', data)

      // Manually update state with confirmed data from Supabase
      // This ensures all useBoardData() calls see the update
      if (data && data.length > 0) {
        setTasks((prev) => {
          const updated = prev.map((t) => (t.id === taskId ? data[0] : t))
          console.log('✅ State updated with Supabase data, new length:', updated.length)
          return updated
        })
      }
    } catch (err) {
      console.error('Error moving task:', err)
      // Rollback optimistic update
      setTasks(previousTasks)
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
    refetchColumns,
  }
}
