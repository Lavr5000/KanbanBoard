'use client'

import { useEffect, useState } from 'react'
import type { AISuggestion } from '@/features/task-ai-suggestions/hooks/useTaskAI'

interface UseAISuggestionsOptions {
  taskId: string | null
  enabled?: boolean
}

/**
 * Load saved AI suggestions for a task
 */
export function useAISuggestions({ taskId, enabled = true }: UseAISuggestionsOptions) {
  const [suggestions, setSuggestions] = useState<AISuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!taskId || !enabled) {
      setSuggestions(null)
      return
    }

    const fetchSuggestions = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/ai-suggestions?taskId=${taskId}`)
        if (!res.ok) throw new Error('Failed to load suggestions')
        const result = await res.json()
        if (result) {
          setSuggestions({
            improvedTitle: result.improved_title || '',
            description: result.description,
            acceptanceCriteria: result.acceptance_criteria || [],
            risks: result.risks || [],
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load suggestions'))
      }

      setLoading(false)
    }

    fetchSuggestions()
  }, [taskId, enabled])

  return { suggestions, loading, error }
}
