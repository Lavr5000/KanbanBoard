'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
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

      const { data, error } = await supabase
        .from('ai_suggestions')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        setError(error)
      } else if (data) {
        // Convert DB format to AISuggestion format
        const suggestion: AISuggestion = {
          improvedTitle: data.improved_title || '',
          description: data.description,
          acceptanceCriteria: data.acceptance_criteria || [],
          risks: data.risks || []
        }
        setSuggestions(suggestion)
      }

      setLoading(false)
    }

    fetchSuggestions()
  }, [taskId, enabled])

  return { suggestions, loading, error }
}
