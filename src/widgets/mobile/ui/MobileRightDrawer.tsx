'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Map,
  Sparkles,
  Save,
  Plus,
  ChevronLeft,
  Wand2
} from 'lucide-react'
import { useMobileUIStore } from '@/entities/ui/model/mobileStore'
import { useRoadmap } from '@/features/roadmap/hooks/useRoadmap'
import { RoadmapAIChat } from '@/features/roadmap/ui/RoadmapAIChat'
import { parseRoadmapTasks } from '@/features/roadmap/lib/parser'
import { createTasksFromRoadmap } from '@/features/roadmap/lib/task-creator'
import { useSwipe } from '@/hooks/useSwipe'
import { lockBodyScroll, unlockBodyScroll, hapticFeedback } from '@/shared/lib/mobile'

interface MobileRightDrawerProps {
  boardId: string | null
}

export function MobileRightDrawer({ boardId }: MobileRightDrawerProps) {
  const { isRightDrawerOpen, closeRightDrawer } = useMobileUIStore()
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const { content, updateContent, immediateSave, loading, saving, error, hasContent } = useRoadmap({ boardId })

  // Parse tasks from content
  const parsedTasks = parseRoadmapTasks(content)
  const tasksToShow = Math.min(5, parsedTasks.length)

  // Swipe to close
  const { swipeHandlers, swipeState } = useSwipe({
    threshold: 100,
    onSwipeRight: () => {
      hapticFeedback('light')
      closeRightDrawer()
    },
  })

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isRightDrawerOpen) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
    return () => unlockBodyScroll()
  }, [isRightDrawerOpen])

  // Show toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRightDrawer()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closeRightDrawer])

  // Handle create tasks
  const handleCreateTasks = useCallback(async () => {
    if (isCreating) return

    if (!boardId) {
      setToast({ type: 'error', message: 'Не выбрана доска' })
      return
    }

    if (parsedTasks.length === 0) {
      setToast({ type: 'error', message: 'Нет задач для создания' })
      return
    }

    setIsCreating(true)
    hapticFeedback('medium')

    const result = await createTasksFromRoadmap(boardId, parsedTasks, 5)

    if (result.success) {
      setToast({ type: 'success', message: `Создано ${result.created} задач` })
      hapticFeedback('heavy')
      setTimeout(() => {
        closeRightDrawer()
        window.location.reload()
      }, 1000)
    } else {
      setToast({ type: 'error', message: result.errors.join(', ') })
      setIsCreating(false)
    }
  }, [boardId, parsedTasks, isCreating, closeRightDrawer])

  if (typeof document === 'undefined') return null

  // Calculate transform based on swipe
  const getDrawerTransform = () => {
    if (!swipeState.isSwiping) return 'translateX(0)'
    const deltaX = Math.max(0, swipeState.deltaX) // Only allow right swipe
    return `translateX(${deltaX}px)`
  }

  const drawerContent = (
    <div
      className={`fixed inset-0 z-[100] ${isRightDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Roadmap"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isRightDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeRightDrawer}
      />

      {/* Drawer Panel - Full Screen */}
      <div
        {...swipeHandlers}
        className={`absolute inset-0 bg-[#121218] transition-transform duration-300 ease-out ${
          isRightDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transform: isRightDrawerOpen ? getDrawerTransform() : undefined }}
      >
        {/* Safe area padding */}
        <div className="h-full flex flex-col pt-safe-top pb-safe-bottom">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#1a1a20]">
            <div className="flex items-center gap-3">
              <button
                onClick={closeRightDrawer}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800 -ml-2"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex items-center gap-2">
                <Map size={20} className="text-purple-400" />
                <span className="font-bold text-white text-lg">Дорожная карта</span>
              </div>
            </div>

            {/* AI Generate Button */}
            <button
              onClick={() => setIsAIChatOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-95"
            >
              <Sparkles size={18} />
              <span className="hidden xs:inline">AI</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                Ошибка: {error.message}
              </div>
            )}

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-gray-400">Загрузка...</span>
                </div>
              </div>
            ) : (
              <>
                {/* Textarea */}
                <div className="flex-1 relative">
                  <textarea
                    value={content}
                    onChange={(e) => updateContent(e.target.value)}
                    placeholder={`Напишите план проекта...

Пример:
- Настройка проекта
- Дизайн интерфейса
- Разработка API
- Тестирование
- Запуск

Или нажмите AI кнопку для автоматической генерации!`}
                    className="w-full h-full bg-[#1c1c24] text-gray-300 border border-gray-700 rounded-2xl p-4 resize-none focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 text-base leading-relaxed"
                  />

                  {/* Character count */}
                  <div className="absolute bottom-3 right-3 text-xs text-gray-600">
                    {content.length} символов
                  </div>
                </div>

                {/* Status Bar */}
                <div className="flex items-center justify-between mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    {saving ? (
                      <span className="text-gray-500 flex items-center gap-1">
                        <div className="w-3 h-3 border border-gray-500 border-t-transparent rounded-full animate-spin" />
                        Сохранение...
                      </span>
                    ) : hasContent ? (
                      <span className="text-green-500 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full" />
                        Сохранено
                      </span>
                    ) : null}
                  </div>

                  {parsedTasks.length > 0 && (
                    <span className="text-purple-400">
                      {parsedTasks.length} задач найдено
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-800 bg-[#1a1a20] space-y-3">
            {/* Create Tasks Button */}
            <button
              onClick={handleCreateTasks}
              disabled={isCreating || parsedTasks.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 disabled:from-gray-700 disabled:to-gray-600 text-white rounded-2xl font-medium shadow-lg shadow-emerald-500/30 disabled:shadow-none transition-all active:scale-[0.98]"
            >
              <Plus size={20} />
              {isCreating ? 'Создание...' : tasksToShow > 0 ? `Создать ${tasksToShow} задач` : 'Создать задачи'}
            </button>

            {/* Save Button */}
            <button
              onClick={() => {
                immediateSave()
                hapticFeedback('light')
                setToast({ type: 'success', message: 'Сохранено!' })
              }}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-medium transition-all active:scale-[0.98]"
            >
              <Save size={18} />
              Сохранить вручную
            </button>
          </div>

          {/* Swipe Indicator */}
          <div className="absolute top-1/2 left-2 -translate-y-1/2">
            <div className="w-1 h-8 bg-gray-700 rounded-full" />
          </div>
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

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg text-sm font-medium z-[110] animate-slide-up ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(drawerContent, document.body)
}
