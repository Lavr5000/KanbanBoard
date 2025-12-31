'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface UseRoadmapOptions {
  boardId: string | null
  enabled?: boolean
}

/**
 * Load and save roadmap content for a board
 * Auto-saves changes after 2 seconds of inactivity
 */
export function useRoadmap({ boardId, enabled = true }: UseRoadmapOptions) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [hasContent, setHasContent] = useState(false)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load roadmap on mount
  useEffect(() => {
    if (!boardId || !enabled) {
      setContent('')
      setHasContent(false)
      return
    }

    const fetchRoadmap = async () => {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('roadmaps')
        .select('content')
        .eq('board_id', boardId)
        .maybeSingle()

      if (error) {
        setError(error)
      } else {
        const roadmapContent = data?.content || ''
        setContent(roadmapContent)
        setHasContent(!!roadmapContent)
      }

      setLoading(false)
    }

    fetchRoadmap()
  }, [boardId, enabled])

  // Save roadmap with debounce
  const saveRoadmap = useCallback(async (newContent: string) => {
    if (!boardId) return

    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from('roadmaps')
      .upsert(
        { board_id: boardId, content: newContent },
        { onConflict: 'board_id' }
      )

    if (error) {
      setError(error)
    } else {
      setHasContent(!!newContent)
    }

    setSaving(false)
  }, [boardId])

  // Update content with auto-save
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent)

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Schedule save after 2 seconds
    saveTimeoutRef.current = setTimeout(() => {
      saveRoadmap(newContent)
    }, 2000)
  }, [saveRoadmap])

  // Immediate save
  const immediateSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    saveRoadmap(content)
  }, [content, saveRoadmap])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    content,
    updateContent,
    immediateSave,
    loading,
    saving,
    error,
    hasContent,
  }
}
