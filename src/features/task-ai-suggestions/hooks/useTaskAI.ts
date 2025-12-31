'use client'

import { useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface AISuggestion {
  improvedTitle: string
  description: string | null
  acceptanceCriteria: string[]
  risks: string[]
}

interface UseTaskAIOptions {
  taskId?: string | null
  autoHideDelay?: number // milliseconds
}

export function useTaskAI(options: UseTaskAIOptions = {}) {
  const { taskId, autoHideDelay = 30000 } = options

  const [suggestions, setSuggestions] = useState<AISuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(true)

  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Clear auto-hide timer on unmount
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }
  }, [])

  // Start auto-hide timer
  const startHideTimer = useCallback(() => {
    clearHideTimer()
    hideTimerRef.current = setTimeout(() => {
      setVisible(false)
    }, autoHideDelay)
  }, [autoHideDelay, clearHideTimer])

  // Generate suggestions from AI
  const generateSuggestions = useCallback(
    async (taskContent: string, columnTitle: string, boardName: string, nearbyTasks: Array<{ content: string }>) => {
      setLoading(true)
      setError(null)
      setVisible(true)

      try {
        const response = await fetch('/api/ai/suggestions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskContent,
            columnTitle,
            boardName,
            nearbyTasks,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || `API error: ${response.status}`)
        }

        const data: AISuggestion = await response.json()

        // Check if response has meaningful content
        if (!data.improvedTitle && (!data.acceptanceCriteria || data.acceptanceCriteria.length === 0)) {
          throw new Error('Empty suggestions received')
        }

        setSuggestions(data)

        // Auto-save to database if taskId is provided
        if (taskId) {
          supabase
            .from('ai_suggestions')
            .insert({
              task_id: taskId,
              improved_title: data.improvedTitle,
              description: data.description,
              acceptance_criteria: data.acceptanceCriteria,
              risks: data.risks,
            })
            .then(({ error }) => {
              if (error) {
                console.error('Failed to save AI suggestions:', error)
              }
            })
        }

        startHideTimer()
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate suggestions'
        setError(errorMessage)
        console.error('Error generating AI suggestions:', err)
      } finally {
        setLoading(false)
      }
    },
    [startHideTimer, taskId]
  )

  // Hide suggestions manually
  const hideSuggestions = useCallback(() => {
    clearHideTimer()
    setVisible(false)
  }, [clearHideTimer])

  // Restore suggestions
  const restoreSuggestions = useCallback(() => {
    setVisible(true)
    startHideTimer()
  }, [startHideTimer])

  return {
    suggestions,
    loading,
    error,
    visible,
    generateSuggestions,
    hideSuggestions,
    restoreSuggestions,
  }
}
