'use client'

import { useState, useEffect } from 'react'
import type { AISuggestion } from '../hooks/useTaskAI'

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
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            📌 Улучшенное название:
          </div>
          <div className="text-sm text-white font-medium">{data.improvedTitle}</div>
        </div>
      )}

      {/* Description */}
      {data.description && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
            📝 Описание:
          </div>
          <div className="text-sm text-gray-300 leading-relaxed">{data.description}</div>
        </div>
      )}

      {/* Acceptance Criteria */}
      {data.acceptanceCriteria && data.acceptanceCriteria.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
            ✅ Критерии приемки:
          </div>
          <ul className="space-y-1">
            {data.acceptanceCriteria.map((criteria, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>{criteria}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Risks */}
      {data.risks && data.risks.length > 0 && (
        <div>
          <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-1">
            ⚠️ Риски:
          </div>
          <ul className="space-y-1">
            {data.risks.map((risk, index) => (
              <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                <span className="text-gray-500 mt-0.5">•</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
