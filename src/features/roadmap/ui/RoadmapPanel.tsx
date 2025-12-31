'use client'

import { useState } from 'react'
import { Map, ChevronUp, ChevronDown, Save } from 'lucide-react'
import { useRoadmap } from '../hooks/useRoadmap'

interface RoadmapPanelProps {
  boardId: string | null
}

/**
 * Collapsible panel at bottom of screen for project roadmap
 */
export function RoadmapPanel({ boardId }: RoadmapPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { content, updateContent, immediateSave, loading, saving, error, hasContent } = useRoadmap({ boardId })

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 ml-64 bg-[#1a1a20] border-t border-gray-700/50 transition-all duration-300 z-50 ${
        isExpanded ? 'h-[70vh]' : 'h-10'
      }`}
    >
      {/* Header / Collapsed State */}
      <div
        className="h-10 flex items-center justify-between px-4 cursor-pointer hover:bg-[#252530] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Map size={16} className="text-purple-400" />
          <span className="text-sm font-medium text-gray-300">
            {hasContent ? '📍 Дорожная карта' : '📍 Дорожная карта'}
          </span>
          {!hasContent && !isExpanded && (
            <span className="text-xs text-gray-500 ml-2">Здесь может быть ваша дорожная карта</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {saving && (
            <span className="text-xs text-gray-500">Сохранение...</span>
          )}
          {!saving && hasContent && (
            <span className="text-xs text-green-500">Сохранено ✓</span>
          )}
          {isExpanded ? (
            <ChevronDown size={16} className="text-gray-400" />
          ) : (
            <ChevronUp size={16} className="text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="flex flex-col h-[calc(70vh-40px)]">
          {error && (
            <div className="px-4 py-2 bg-red-500/10 border-l-2 border-red-500 text-red-400 text-sm">
              Ошибка: {error.message}
            </div>
          )}

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-400">Загрузка...</div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-4">
              <textarea
                value={content}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Здесь может быть ваша дорожная карта...

Добавьте план разработки проекта:
- Основные этапы
- Важные дедлайны
- Ключевые цели

Этот текст будет автоматически сохраняться."
                className="flex-1 w-full bg-[#252530] text-gray-300 border border-gray-700 rounded-lg p-4 resize-none focus:outline-none focus:border-purple-500/50"
              />

              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  Автосохранение через 2 секунды после последнего изменения
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    immediateSave()
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Save size={14} />
                  Сохранить
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
