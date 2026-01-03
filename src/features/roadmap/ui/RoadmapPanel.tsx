'use client'

import { useState, useCallback, useEffect } from 'react'
import { Map, ChevronUp, ChevronDown, Save, Sparkles, Plus } from 'lucide-react'
import { useRoadmap } from '../hooks/useRoadmap'
import { RoadmapAIChat } from './RoadmapAIChat'
import { parseRoadmapTasks } from '../lib/parser'
import { createTasksFromRoadmap } from '../lib/task-creator'

interface RoadmapPanelProps {
  boardId: string | null
}

/**
 * Collapsible panel at bottom of screen for project roadmap
 */
export function RoadmapPanel({ boardId }: RoadmapPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { content, updateContent, immediateSave, loading, saving, error, hasContent } = useRoadmap({ boardId })

  // Parse tasks from content
  const parsedTasks = parseRoadmapTasks(content)
  const tasksToShow = Math.min(5, parsedTasks.length)

  // Show toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Handle create tasks
  const handleCreateTasks = useCallback(async () => {
    // logger.log('🚀 [ROADMAP] Create tasks button clicked')
    // logger.log(`📋 [ROADMAP] Board ID: ${boardId}`)
    // logger.log(`📊 [ROADMAP] Parsed tasks count: ${parsedTasks.length}`)
    // logger.log(`📝 [ROADMAP] Content length: ${content.length}`)

    if (isCreating) {
      // logger.log('⚠️  [ROADMAP] Already creating, skipping')
      return
    }

    if (!boardId) {
      // logger.log('❌ [ROADMAP] No board ID selected')
      setToast({
        type: 'error',
        message: '✗ Ошибка: Не выбрана доска'
      })
      return
    }

    if (parsedTasks.length === 0) {
      // logger.log('❌ [ROADMAP] No tasks found in content')
      setToast({
        type: 'error',
        message: '✗ Нет задач для создания. Добавьте задачи в roadmap'
      })
      return
    }

    // logger.log('✅ [ROADMAP] Starting task creation...')
    // logger.log(`📦 [ROADMAP] Tasks to create:`, parsedTasks.map(t => t.title))

    setIsCreating(true)
    const result = await createTasksFromRoadmap(boardId, parsedTasks, 5)

    // logger.log('📯 [ROADMAP] Task creation result:', result)

    if (result.success) {
      // logger.log(`✅ [ROADMAP] Successfully created ${result.created} tasks`)
      setToast({
        type: 'success',
        message: `✓ Создано ${result.created} задач`
      })
      // Force page reload to show new tasks immediately
      setTimeout(() => window.location.reload(), 1000)
    } else {
      // logger.log(`❌ [ROADMAP] Failed to create tasks. Errors:`, result.errors)
      setToast({
        type: 'error',
        message: `✗ Ошибка: ${result.errors.join(', ')}`
      })
      setIsCreating(false)
    }
  }, [boardId, parsedTasks, isCreating, content])

  return (
    <>
    <div
      data-tour="roadmap-panel"
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
          <button
            data-tour="ai-generate-btn"
            onClick={(e) => {
              e.stopPropagation()
              setIsAIChatOpen(true)
            }}
            className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-md hover:scale-105 transition-transform shadow-lg hover:shadow-indigo-500/30"
            title="Сгенерировать с AI"
          >
            <Sparkles size={14} className="text-white" />
          </button>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Автосохранение через 2 секунды после последнего изменения
                  </span>

                  {/* Create tasks button - always visible */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCreateTasks()
                    }}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-md text-xs transition-colors"
                  >
                    <Plus size={12} />
                    {isCreating ? 'Создание...' : tasksToShow > 0 ? `Создать ${tasksToShow} задач` : 'Создать задачи'}
                  </button>
                </div>

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

    {/* AI Chat Modal */}
    {isAIChatOpen && (
      <RoadmapAIChat
        boardId={boardId}
        onApply={(content) => {
          updateContent(content)
          immediateSave()
        }}
        onClose={() => setIsAIChatOpen(false)}
      />
    )}

    {/* Toast notification */}
    {toast && (
      <div className={`fixed bottom-20 right-8 px-4 py-3 rounded-lg shadow-lg text-sm font-medium z-[100] animate-slideUp ${
        toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
      }`}>
        {toast.message}
      </div>
    )}
    </>
  )
}
