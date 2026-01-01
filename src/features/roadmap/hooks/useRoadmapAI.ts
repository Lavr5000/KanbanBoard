'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  options?: string[]
}

interface UseRoadmapAIOptions {
  boardId?: string | null
}

const STORAGE_KEY = 'roadmap_ai_chat'

export function useRoadmapAI({ boardId }: UseRoadmapAIOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadedRef = useRef(false)

  // Load messages from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined' || loadedRef.current) return

    console.log('🤖 AI Chat: loading history, boardId:', boardId)

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      console.log('🤖 AI Chat: stored data:', stored)

      if (stored) {
        const parsed = JSON.parse(stored)
        console.log('🤖 AI Chat: parsed data:', parsed)

        // Only restore if boardId matches or no boardId
        if (!boardId || parsed.boardId === boardId) {
          console.log('🤖 AI Chat: restoring', parsed.messages?.length || 0, 'messages')
          setMessages(parsed.messages || [])
        } else {
          console.log('🤖 AI Chat: boardId mismatch, skipping restore')
        }
      } else {
        console.log('🤖 AI Chat: no stored data found')
      }

      loadedRef.current = true
    } catch (e) {
      console.error('❌ AI Chat: failed to load history:', e)
    }
  }, [boardId])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return

    console.log('💾 AI Chat: saving', messages.length, 'messages for boardId:', boardId)

    try {
      const data = JSON.stringify({
        boardId,
        messages
      })
      localStorage.setItem(STORAGE_KEY, data)
      console.log('✅ AI Chat: saved successfully')
    } catch (e) {
      console.error('❌ AI Chat: failed to save history:', e)
    }
  }, [boardId, messages])

  const sendMessage = useCallback(async (userMessage: string) => {
    setLoading(true)
    setError(null)

    const newMessages = [
      ...messages,
      { role: 'user' as const, content: userMessage }
    ]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/ai/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()
      const aiContent = data.content

      // Parse options from format: ВАРИАНТЫ: [option1, option2]
      // Supports: with/without quotes, extra spaces, multiline
      let options: string[] | undefined
      const optionsMatch = aiContent.match(/ВАРИАНТЫ:\s*\[([\s\S]+?)\]/)
      if (optionsMatch) {
        options = optionsMatch[1]
          .split(',')
          .map((s: string) => {
            // Remove quotes and trim
            let cleaned = s.trim().replace(/\n/g, ' ') // Replace newlines with spaces
            cleaned = cleaned.replace(/^["']|["']$/g, '') // Remove surrounding quotes
            return cleaned
          })
          .filter((s: string) => s.length > 0 && s.length < 100) // Filter out empty or too long
      }

      // Clean content from options metadata
      const cleanContent = aiContent.replace(/ВАРИАНТЫ:\s*\[[\s\S]+?\]/, '').trim()

      setMessages([
        ...newMessages,
        { role: 'assistant', content: cleanContent, options }
      ])

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [messages])

  const startSession = useCallback(() => {
    // Don't clear messages anymore - they're persisted
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
    setLoading(false)
  }, [])

  const getFinalRoadmap = useCallback((): string | null => {
    // Find last message with AI_GENERATED marker
    const allMessages = [...messages]
    for (let i = allMessages.length - 1; i >= 0; i--) {
      const msg = allMessages[i]
      if (msg.role === 'assistant' && msg.content.includes('<!-- AI_GENERATED -->')) {
        return msg.content
      }
    }
    return null
  }, [messages])

  // Check if waiting for user approval (last message has approve options)
  const isPendingApproval = useCallback((): boolean => {
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg || lastMsg.role !== 'assistant' || !lastMsg.options) {
      return false
    }
    // Check if options contain "Утверждаю" and "Хочу добавить"
    const hasApproveOption = lastMsg.options.some(o =>
      o.toLowerCase().includes('утверждаю')
    )
    const hasAddOption = lastMsg.options.some(o =>
      o.toLowerCase().includes('хочу добавить')
    )
    return hasApproveOption && hasAddOption
  }, [messages])

  return {
    messages,
    loading,
    error,
    sendMessage,
    startSession,
    reset,
    getFinalRoadmap,
    isPendingApproval,
    hasFinalResult: messages.length > 0 &&
                   messages.some(m => m.content.includes('<!-- AI_GENERATED -->'))
  }
}
