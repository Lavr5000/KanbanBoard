'use client'

import { useState, useEffect } from 'react'
import { Copy } from 'lucide-react'
import type { AISuggestion } from '../hooks/useTaskAI'

interface CopyButtonProps {
  text: string
  className?: string
}

function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`opacity-0 group-hover:opacity-100 transition-opacity ${className}`}
      title={copied ? 'Скопировано!' : 'Копировать'}
    >
      {copied ? (
        <span className="text-green-400 text-xs">✓</span>
      ) : (
        <Copy size={14} className="text-gray-500 hover:text-gray-300" />
      )}
    </button>
  )
}

interface TaskAISuggestionsProps {
  data: AISuggestion
  onHide: () => void
  autoHideDelay?: number
}

/**
 * Displays AI-generated suggestions for improving a task
 * Shows structured improvements: title, description, acceptance criteria, risks
 */
export function TaskAISuggestions({ data, onHide, autoHideDelay = 30000 }: TaskAISuggestionsProps) {
  const [timeLeft, setTimeLeft] = useState(autoHideDelay / 1000)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-3 pt-3 border-t border-gray-700/50 bg-[#1a1a20] rounded-lg p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-purple-400 flex items-center gap-2">
          💡 AI-предложения
        </span>
        <button
          onClick={onHide}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          Скрыть через {timeLeft}с
        </button>
      </div>

      {/* Improved Title */}
      {data.improvedTitle && (
        <div className="mb-3 group relative">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">📌 Улучшенное название:</span>
            <CopyButton text={data.improvedTitle} />
          </div>
          <div className="text-sm text-white font-medium">{data.improvedTitle}</div>
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div className="mb-3 group relative">
          <div className="text-xs text-gray-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">📝 Описание:</span>
            <CopyButton text={data.description} />
          </div>
          <div className="text-sm text-gray-300 leading-relaxed">{data.description}</div>
        </div>
      )}

      {/* Acceptance Criteria */}
      {data.acceptanceCriteria && data.acceptanceCriteria.length > 0 && (
        <div className="mb-3 group relative">
          <div className="text-xs text-gray-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">✅ Критерии приемки:</span>
            <CopyButton text={data.acceptanceCriteria.join('\n')} />
          </div>
          <ul className="space-y-1">
            {data.acceptanceCriteria.map((criteria, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span className="flex-1">{criteria}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {data.risks && data.risks.length > 0 && (
        <div className="group relative">
          <div className="text-xs text-gray-400 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1">⚠️ Риски:</span>
            <CopyButton text={data.risks.join('\n')} />
          </div>
          <ul className="space-y-1">
            {data.risks.map((risk, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span className="flex-1">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
