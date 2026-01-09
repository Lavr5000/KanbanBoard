'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Play,
  Heart,
  MessageCircle,
  Download,
  LogOut,
  Settings,
  HelpCircle,
  Sparkles,
  ChevronRight,
  User
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { useMobileUIStore } from '@/entities/ui/model/mobileStore'
import { BoardSelector } from '@/widgets/board-selector'
import { useDonationModal } from '@/features/donation/model/useDonationModal'
import { useFeedbackModal } from '@/features/feedback/model/useFeedbackModal'
import { AIHelpModal } from '@/features/ai-help'
import { useSwipe } from '@/hooks/useSwipe'
import { lockBodyScroll, unlockBodyScroll, hapticFeedback } from '@/shared/lib/mobile'

interface MobileLeftDrawerProps {
  onOpenRoadmap?: () => void
}

export function MobileLeftDrawer({ onOpenRoadmap }: MobileLeftDrawerProps) {
  const { user, signOut } = useAuth()
  const { isLeftDrawerOpen, closeLeftDrawer, openRightDrawer } = useMobileUIStore()
  const { open: openDonationModal } = useDonationModal()
  const { open: openFeedbackModal } = useFeedbackModal()
  const [isAIHelpOpen, setIsAIHelpOpen] = useState(false)

  // Swipe to close
  const { swipeHandlers, swipeState } = useSwipe({
    threshold: 100,
    onSwipeLeft: () => {
      hapticFeedback('light')
      closeLeftDrawer()
    },
  })

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isLeftDrawerOpen) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
    return () => unlockBodyScroll()
  }, [isLeftDrawerOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLeftDrawer()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [closeLeftDrawer])

  if (typeof document === 'undefined') return null

  const handleSignOut = async () => {
    await signOut()
    closeLeftDrawer()
    window.location.href = '/login'
  }

  const handleDonate = () => {
    closeLeftDrawer()
    setTimeout(() => openDonationModal(), 300)
  }

  const handleFeedback = () => {
    closeLeftDrawer()
    setTimeout(() => openFeedbackModal(), 300)
  }

  const handleHelp = () => {
    closeLeftDrawer()
    setTimeout(() => setIsAIHelpOpen(true), 300)
  }

  // Calculate transform based on swipe
  const getDrawerTransform = () => {
    if (!swipeState.isSwiping) return 'translateX(0)'
    const deltaX = Math.min(0, swipeState.deltaX) // Only allow left swipe
    return `translateX(${deltaX}px)`
  }

  const drawerContent = (
    <>
    <div
      className={`fixed inset-0 z-[100] ${isLeftDrawerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isLeftDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeLeftDrawer}
      />

      {/* Drawer Panel */}
      <div
        {...swipeHandlers}
        className={`absolute left-0 top-0 bottom-0 w-[85%] max-w-[320px] bg-[#1a1a20] shadow-2xl transition-transform duration-300 ease-out ${
          isLeftDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ transform: isLeftDrawerOpen ? getDrawerTransform() : undefined }}
      >
        {/* Safe area padding for notched devices */}
        <div className="h-full flex flex-col pt-safe-top pb-safe-bottom">

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-2">
                <Play className="fill-white text-white" size={18} />
              </div>
              <div>
                <span className="font-bold text-white text-lg">Lavr</span>
                <span className="text-gray-500 text-xs block">Kanban AI</span>
              </div>
            </div>
            <button
              onClick={closeLeftDrawer}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Profile */}
          {user && (
            <div className="p-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-gray-500 text-sm truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Board Selector */}
          <div className="p-4 border-b border-gray-800">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">
              Проекты
            </p>
            <BoardSelector />
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {/* AI Section */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 px-3">
                AI Функции
              </p>
              <button
                onClick={handleHelp}
                className="w-full flex items-center gap-3 px-3 py-3 text-white bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 rounded-xl transition-all group border border-purple-500/20"
              >
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow">
                  <Sparkles size={16} className="text-white" />
                </div>
                <span className="flex-1 text-left font-medium">Как работает AI</span>
                <ChevronRight size={16} className="text-gray-500 group-hover:text-purple-400 transition-colors" />
              </button>
            </div>

            {/* General Section */}
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 px-3">
                Общее
              </p>

              {/* Donate */}
              <button
                onClick={handleDonate}
                className="w-full flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all group"
              >
                <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                  <Heart size={16} className="text-pink-500" />
                </div>
                <span className="flex-1 text-left">Поддержать проект</span>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              </button>

              {/* Feedback */}
              <button
                onClick={handleFeedback}
                className="w-full flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all group"
              >
                <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <MessageCircle size={16} className="text-blue-500" />
                </div>
                <span className="flex-1 text-left">Сообщить о проблеме</span>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              </button>

              {/* Export */}
              <button
                onClick={() => alert('Экспорт данных будет доступен позже')}
                className="w-full flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all group"
              >
                <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Download size={16} className="text-green-500" />
                </div>
                <span className="flex-1 text-left">Экспортировать данные</span>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              </button>

              {/* Help */}
              <button
                onClick={handleHelp}
                className="w-full flex items-center gap-3 px-3 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all group"
              >
                <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                  <HelpCircle size={16} className="text-yellow-500" />
                </div>
                <span className="flex-1 text-left">Помощь</span>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-800 space-y-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all"
            >
              <LogOut size={18} />
              <span className="font-medium">Выйти</span>
            </button>
          </div>

          {/* Swipe Indicator */}
          <div className="absolute top-1/2 right-2 -translate-y-1/2">
            <div className="w-1 h-8 bg-gray-700 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    {/* AI Help Modal */}
    <AIHelpModal isOpen={isAIHelpOpen} onClose={() => setIsAIHelpOpen(false)} />
    </>
  )

  return createPortal(drawerContent, document.body)
}
