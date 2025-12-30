'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()

  const [boards, setBoards] = useState<Board[]>([])
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Load boards and active board from localStorage
  useEffect(() => {
    // Wait for auth to complete before loading boards
    if (authLoading || !user) return

    async function loadBoards() {
      try {
        setLoading(true)
        setError(null)

        // Load all user's boards
        const { data: boardsData, error: boardsError } = await supabase
          .from('boards')
          .select('*')
          .order('created_at', { ascending: true })

        if (boardsError) throw boardsError

        setBoards(boardsData || [])

        // Get active board from localStorage (client-side only)
        const savedBoardId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_BOARD_KEY) : null

        if (savedBoardId && boardsData?.some(b => b.id === savedBoardId)) {
          setActiveBoardId(savedBoardId)
        } else if (boardsData && boardsData.length > 0) {
          // Fallback to first board
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

  // Real-time subscription for boards changes
  useEffect(() => {
    // Wait for auth to complete before subscribing
    if (authLoading || !user) return

    const subscription = supabase
      .channel('boards-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'boards',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Board change:', payload)

          if (payload.eventType === 'INSERT') {
            setBoards((prev) => [...prev, payload.new as Board])
          } else if (payload.eventType === 'UPDATE') {
            setBoards((prev) =>
              prev.map((b) => (b.id === payload.new.id ? (payload.new as Board) : b))
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, supabase, authLoading])

  // Switch active board
  const switchBoard = useCallback((boardId: string) => {
    setActiveBoardId(boardId)
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_BOARD_KEY, boardId)
    }
  }, [])

  // Create new board with default columns
  const createBoard = useCallback(async (name: string): Promise<Board> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Create board
      const { data: newBoard, error: boardError } = await supabase
        .from('boards')
        .insert({
          user_id: user.id,
          name: name.trim(),
        })
        .select()
        .single()

      if (boardError) throw boardError

      // Create default columns
      const defaultColumns = [
        { board_id: newBoard.id, title: 'Новая задача', position: 0 },
        { board_id: newBoard.id, title: 'Выполняется', position: 1 },
        { board_id: newBoard.id, title: 'На тестировании', position: 2 },
        { board_id: newBoard.id, title: 'Выполнено', position: 3 },
      ]

      const { error: columnsError } = await supabase
        .from('columns')
        .insert(defaultColumns)

      if (columnsError) throw columnsError

      return newBoard
    } catch (err) {
      console.error('Error creating board:', err)
      throw err
    }
  }, [user, supabase])

  // Update board name
  const updateBoard = useCallback(async (boardId: string, name: string) => {
    try {
      const { error } = await supabase
        .from('boards')
        .update({ name: name.trim() })
        .eq('id', boardId)

      if (error) throw error
    } catch (err) {
      console.error('Error updating board:', err)
      throw err
    }
  }, [supabase])

  // Delete board
  const deleteBoard = useCallback(async (boardId: string) => {
    try {
      // Delete board (cascade will delete columns and tasks)
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', boardId)

      if (error) throw error

      // If deleted board was active, switch to another board
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
  }, [supabase, activeBoardId, boards, switchBoard])

  // Find active board
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
