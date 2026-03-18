'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { Task, Column, Board } from '@/lib/supabase/types'
import { useAuth } from '@/providers/AuthProvider'
import { trackTaskCreated, trackTaskMoved, trackTaskDeleted, trackTaskUpdated } from '@/lib/analytics/tracker'

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

const ACTIVE_BOARD_KEY = 'activeBoardId'

async function fetchBoardData(boardId: string) {
  const res = await fetch(`/api/boards/${boardId}/data`)
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Failed to load board data')
  }
  return res.json() as Promise<{ board: Board; columns: Column[]; tasks: Task[] }>
}

/**
 * Custom hook for board data with API route integration
 * Handles data loading, polling, and mutations
 */
export function useBoardData(boardId?: string): UseBoardDataReturn {
  const { user, loading: authLoading } = useAuth()

  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([])
  const [optimisticColumns, setOptimisticColumns] = useState<Column[]>([])

  const boardRef = useRef<Board | null>(null)
  boardRef.current = board

  const refetchColumns = useCallback(async () => {
    const currentBoard = boardRef.current
    if (!currentBoard) return
    try {
      const data = await fetchBoardData(currentBoard.id)
      setColumns(data.columns)
      setOptimisticColumns(data.columns)
      setTasks(data.tasks)
      setOptimisticTasks(data.tasks)
    } catch {
      // Silently ignore polling errors
    }
  }, [])

  // Load initial data
  useEffect(() => {
    if (authLoading || !user) return

    async function loadData() {
      try {
        setLoading(true)

        const targetBoardId = boardId || (typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_BOARD_KEY) : null)
        let loadedBoard: Board | null = null

        if (targetBoardId) {
          try {
            const data = await fetchBoardData(targetBoardId)
            loadedBoard = data.board
            setBoard(data.board)
            setColumns(data.columns)
            setTasks(data.tasks)
            setOptimisticTasks(data.tasks)
            setOptimisticColumns(data.columns)
            setLoading(false)
            return
          } catch {
            // Board not found or error, fall through
          }
        }

        // Get user's first board or create one
        const boardsRes = await fetch('/api/boards')
        if (!boardsRes.ok) throw new Error('Failed to load boards')
        const boards: Board[] = await boardsRes.json()

        if (boards.length === 0) {
          const createRes = await fetch('/api/boards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'My Kanban Board' }),
          })
          if (!createRes.ok) throw new Error('Failed to create board')
          const newBoard: Board = await createRes.json()

          if (typeof window !== 'undefined') {
            localStorage.setItem(ACTIVE_BOARD_KEY, newBoard.id)
          }

          const data = await fetchBoardData(newBoard.id)
          setBoard(data.board)
          setColumns(data.columns)
          setTasks(data.tasks)
          setOptimisticTasks(data.tasks)
          setOptimisticColumns(data.columns)
        } else {
          loadedBoard = boards[0]
          if (typeof window !== 'undefined') {
            localStorage.setItem(ACTIVE_BOARD_KEY, boards[0].id)
          }

          const data = await fetchBoardData(boards[0].id)
          setBoard(data.board)
          setColumns(data.columns)
          setTasks(data.tasks)
          setOptimisticTasks(data.tasks)
          setOptimisticColumns(data.columns)
        }
      } catch (err) {
        console.error('Error loading board data:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, authLoading, boardId])

  // Polling every 10 seconds
  useEffect(() => {
    if (!board) return

    const interval = setInterval(async () => {
      try {
        const data = await fetchBoardData(board.id)
        setColumns(data.columns)
        setTasks(data.tasks)
        setOptimisticTasks(data.tasks)
        setOptimisticColumns(data.columns)
      } catch {
        // Silently ignore polling errors
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [board])

  // Mutations
  const addTask = async (columnId: string, taskData: Partial<Task>) => {
    if (!board) {
      throw new Error('No board found')
    }

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board_id: board.id,
          column_id: columnId,
          title: taskData.title || '',
          description: taskData.description || '',
          priority: (taskData.priority as string) || 'medium',
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create task')
      }

      const data: Task = await res.json()

      await trackTaskCreated(data.id, columnId, board.id)

      setTasks((prev) => [...prev, data])
    } catch (err) {
      console.error('Error adding task:', err)
      throw err
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    const previousTasks = tasks

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      )
    )

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update task')
      }

      const updatedFields = Object.keys(updates)
      await trackTaskUpdated(taskId, updatedFields)
    } catch (err) {
      console.error('Error updating task:', err)
      setTasks(previousTasks)
      throw err
    }
  }

  const deleteTask = async (taskId: string) => {
    const previousTasks = tasks
    const taskToDelete = tasks.find(t => t.id === taskId)

    setTasks((prev) => prev.filter((t) => t.id !== taskId))

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete task')
      }

      if (taskToDelete) {
        await trackTaskDeleted(taskId, taskToDelete.column_id)
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      setTasks(previousTasks)
      throw err
    }
  }

  const moveTask = async (
    taskId: string,
    newColumnId: string,
    newPosition: number
  ) => {
    const previousTasks = tasks
    const taskToMove = tasks.find(t => t.id === taskId)
    const oldColumnId = taskToMove?.column_id

    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === taskId
          ? { ...t, column_id: newColumnId, position: newPosition }
          : t
      )
      return updated
    })

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column_id: newColumnId,
          position: newPosition,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to move task')
      }

      const data: Task = await res.json()

      if (oldColumnId && oldColumnId !== newColumnId) {
        await trackTaskMoved(taskId, oldColumnId, newColumnId)
      }

      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === taskId ? data : t))
        return updated
      })
    } catch (err) {
      console.error('Error moving task:', err)
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
