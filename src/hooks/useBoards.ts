'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Board } from '@/lib/supabase/types'
import { useAuth } from '@/providers/AuthProvider'

const ACTIVE_BOARD_KEY = 'activeBoardId'

interface UseBoardsReturn {
  boards: Board[]
  activeBoardId: string | null
  activeBoard: Board | null
  loading: boolean
  error: Error | null
  switchBoard: (boardId: string) => void
  createBoard: (name: string) => Promise<Board>
  updateBoard: (boardId: string, name: string) => Promise<void>
  deleteBoard: (boardId: string) => Promise<void>
}

/**
 * Hook for managing multiple Kanban boards
 * Handles loading, creating, updating, and switching between boards
 */
export function useBoards(): UseBoardsReturn {
  const { user, loading: authLoading } = useAuth()

  const [boards, setBoards] = useState<Board[]>([])
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load boards
  useEffect(() => {
    if (authLoading || !user) return

    async function loadBoards() {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch('/api/boards')
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Failed to load boards')
        }

        const boardsData: Board[] = await res.json()
        setBoards(boardsData)

        const savedBoardId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_BOARD_KEY) : null

        if (savedBoardId && boardsData.some(b => b.id === savedBoardId)) {
          setActiveBoardId(savedBoardId)
        } else if (boardsData.length > 0) {
          setActiveBoardId(boardsData[0].id)
          if (typeof window !== 'undefined') {
            localStorage.setItem(ACTIVE_BOARD_KEY, boardsData[0].id)
          }
        }
      } catch (err) {
        console.error('Error loading boards:', err)
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    loadBoards()
  }, [user, authLoading])

  // Polling every 30 seconds
  useEffect(() => {
    if (authLoading || !user) return

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/boards')
        if (!res.ok) return
        const boardsData: Board[] = await res.json()
        setBoards(boardsData)
      } catch {
        // Silently ignore polling errors
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [user, authLoading])

  const switchBoard = useCallback((boardId: string) => {
    setActiveBoardId(boardId)
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_BOARD_KEY, boardId)
    }
  }, [])

  const createBoard = useCallback(async (name: string): Promise<Board> => {
    if (!user) throw new Error('User not authenticated')

    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to create board')
      }

      const newBoard: Board = await res.json()
      setBoards((prev) => [...prev, newBoard])
      return newBoard
    } catch (err) {
      console.error('Error creating board:', err)
      throw err
    }
  }, [user])

  const updateBoard = useCallback(async (boardId: string, name: string) => {
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to update board')
      }

      const updated: Board = await res.json()
      setBoards((prev) => prev.map((b) => (b.id === boardId ? updated : b)))
    } catch (err) {
      console.error('Error updating board:', err)
      throw err
    }
  }, [])

  const deleteBoard = useCallback(async (boardId: string) => {
    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to delete board')
      }

      setBoards((prev) => prev.filter((b) => b.id !== boardId))

      if (boardId === activeBoardId) {
        const remainingBoards = boards.filter(b => b.id !== boardId)
        if (remainingBoards.length > 0) {
          switchBoard(remainingBoards[0].id)
        } else {
          setActiveBoardId(null)
          if (typeof window !== 'undefined') {
            localStorage.removeItem(ACTIVE_BOARD_KEY)
          }
        }
      }
    } catch (err) {
      console.error('Error deleting board:', err)
      throw err
    }
  }, [activeBoardId, boards, switchBoard])

  const activeBoard = boards.find(b => b.id === activeBoardId) || null

  return {
    boards,
    activeBoardId,
    activeBoard,
    loading,
    error,
    switchBoard,
    createBoard,
    updateBoard,
    deleteBoard,
  }
}
