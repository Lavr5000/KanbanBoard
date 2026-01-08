'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Plus, X, ClipboardList, Map, Sparkles, Wand2 } from 'lucide-react'
import { useMobileUIStore } from '@/entities/ui/model/mobileStore'
import { hapticFeedback } from '@/shared/lib/mobile'

interface MobileFABProps {
  onAddTask: () => void
  onOpenRoadmap: () => void
  onAIGenerate?: () => void
}

export function MobileFAB({ onAddTask, onOpenRoadmap, onAIGenerate }: MobileFABProps) {
  const { isFabMenuOpen, toggleFabMenu, closeFabMenu } = useMobileUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    hapticFeedback('light')
    toggleFabMenu()
  }

  const handleAction = (action: () => void) => {
    hapticFeedback('medium')
    closeFabMenu()
    setTimeout(action, 150)
  }

  if (!mounted) return null

  const fabContent = (
    <div className="fixed bottom-6 right-6 z-[90] flex flex-col-reverse items-end gap-3 pb-safe-bottom pr-safe-right">
      {/* Backdrop when menu is open */}
      {isFabMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] -z-10 animate-fade-in"
          onClick={closeFabMenu}
        />
      )}

      {/* Main FAB Button */}
      <button
        onClick={handleToggle}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-90 ${
          isFabMenuOpen
            ? 'bg-gray-700 rotate-45 shadow-gray-700/50'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/40 hover:shadow-blue-500/60'
        }`}
        style={{
          boxShadow: isFabMenuOpen
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(59, 130, 246, 0.4), 0 0 0 4px rgba(59, 130, 246, 0.1)',
        }}
      >
        {isFabMenuOpen ? (
          <X size={28} className="text-white" />
        ) : (
          <Plus size={28} className="text-white" />
        )}
      </button>

      {/* Menu Items */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 ${
          isFabMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* AI Generate - Most prominent */}
        {onAIGenerate && (
          <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <span className="px-3 py-2 bg-[#1c1c24] rounded-xl text-white text-sm font-medium shadow-lg border border-purple-500/30 whitespace-nowrap">
              AI Генерация
            </span>
            <button
              onClick={() => handleAction(onAIGenerate)}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/40 active:scale-90 transition-transform relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              <Sparkles size={24} className="text-white relative z-10" />
            </button>
          </div>
        )}

        {/* Roadmap */}
        <div className="flex items-center gap-3 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <span className="px-3 py-2 bg-[#1c1c24] rounded-xl text-white text-sm font-medium shadow-lg border border-gray-700 whitespace-nowrap">
            Дорожная карта
          </span>
          <button
            onClick={() => handleAction(onOpenRoadmap)}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/40 active:scale-90 transition-transform"
          >
            <Map size={24} className="text-white" />
          </button>
        </div>

        {/* Add Task */}
        <div className="flex items-center gap-3 animate-slide-up">
          <span className="px-3 py-2 bg-[#1c1c24] rounded-xl text-white text-sm font-medium shadow-lg border border-gray-700 whitespace-nowrap">
            Добавить задачу
          </span>
          <button
            onClick={() => handleAction(onAddTask)}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/40 active:scale-90 transition-transform"
          >
            <ClipboardList size={24} className="text-white" />
          </button>
        </div>
      </div>

      {/* Pulse ring on main button when closed */}
      {!isFabMenuOpen && (
        <div className="absolute bottom-0 right-0 w-16 h-16 rounded-2xl pointer-events-none">
          <div className="absolute inset-0 rounded-2xl bg-blue-500/30 animate-ping" />
        </div>
      )}
    </div>
  )

  return createPortal(fabContent, document.body)
}
