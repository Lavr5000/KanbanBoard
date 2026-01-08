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
  const [showSavedStatus, setShowSavedStatus] = useState(false)

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const savedStatusTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load roadmap on mount
  useEffect(() => {
    if (!boardId || !enabled) {
      // logger.log('📋 Roadmap: skip load (boardId:', boardId, ', enabled:', enabled, ')')
      setContent('')
      setHasContent(false)
      return
    }

    const fetchRoadmap = async () => {
      // logger.log('📋 Roadmap: loading for boardId:', boardId)
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('roadmaps')
        .select('content')
        .eq('board_id', boardId)
        .maybeSingle()

      // logger.log('📋 Roadmap: load result:', { data, error })

      if (error) {
        // logger.error('❌ Roadmap: load error:', error)
        setError(error)
      } else {
        const roadmapContent = data?.content || ''
        setContent(roadmapContent)
        setHasContent(!!roadmapContent)
        // logger.log('✅ Roadmap: loaded, content length:', roadmapContent.length)
      }

      setLoading(false)
    }

    fetchRoadmap()
  }, [boardId, enabled])

  // Save roadmap with debounce
  const saveRoadmap = useCallback(async (newContent: string) => {
    if (!boardId) {
      // logger.log('📋 Roadmap: skip save (no boardId)')
      return
    }

    // logger.log('💾 Roadmap: saving for boardId:', boardId, 'content length:', newContent.length)
    setSaving(true)
    setError(null)

    const { error, data } = await supabase
      .from('roadmaps')
      .upsert(
        { board_id: boardId, content: newContent },
        { onConflict: 'board_id' }
      )

    // logger.log('📋 Roadmap: save result:', { error, data })

    if (error) {
      // logger.error('❌ Roadmap: save error:', error)
      setError(error)
    } else {
      // logger.log('✅ Roadmap: saved successfully')
      setHasContent(!!newContent)

      // Show saved status for 2 seconds
      setShowSavedStatus(true)
      if (savedStatusTimeoutRef.current) {
        clearTimeout(savedStatusTimeoutRef.current)
      }
      savedStatusTimeoutRef.current = setTimeout(() => {
        setShowSavedStatus(false)
      }, 2000)
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
      if (savedStatusTimeoutRef.current) {
        clearTimeout(savedStatusTimeoutRef.current)
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
    showSavedStatus,
  }
}
