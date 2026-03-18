'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

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
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/roadmaps/${boardId}`)
        if (!res.ok) throw new Error('Failed to load roadmap')
        const data = await res.json()
        const roadmapContent = data?.content || ''
        setContent(roadmapContent)
        setHasContent(!!roadmapContent)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load roadmap'))
      }

      setLoading(false)
    }

    fetchRoadmap()
  }, [boardId, enabled])

  // Save roadmap with debounce
  const saveRoadmap = useCallback(async (newContent: string) => {
    if (!boardId) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/roadmaps/${boardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      })
      if (!res.ok) throw new Error('Failed to save roadmap')

      setHasContent(!!newContent)

      setShowSavedStatus(true)
      if (savedStatusTimeoutRef.current) {
        clearTimeout(savedStatusTimeoutRef.current)
      }
      savedStatusTimeoutRef.current = setTimeout(() => {
        setShowSavedStatus(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to save roadmap'))
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

  // Immediate save (saves current content from state)
  const immediateSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    saveRoadmap(content)
  }, [content, saveRoadmap])

  // Save specific content immediately (for AI apply)
  const saveContent = useCallback((newContent: string) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    // Update state immediately
    setContent(newContent)
    // Save immediately
    saveRoadmap(newContent)
  }, [saveRoadmap])

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
    saveContent,
    loading,
    saving,
    error,
    hasContent,
    showSavedStatus,
  }
}
