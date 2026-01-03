'use client'

import { useState, useEffect } from 'react'
import { FolderOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useBoards } from '@/hooks/useBoards'
import { ProjectDropdown } from './ProjectDropdown'

/**
 * Board selector component for sidebar
 * Shows current board name and opens dropdown on click
 */
export function BoardSelector() {
  const { activeBoard, loading, boards } = useBoards()
  const [isOpen, setIsOpen] = useState(false)

  // Debug logging
  useEffect(() => {
    // logger.log('📋 BoardSelector state:', { loading, boardsCount: boards.length, activeBoard: activeBoard?.name })
  }, [loading, boards, activeBoard])

  const handleBoardChange = () => {
    setIsOpen(false)
    // Reload page to refresh board data
    window.location.reload()
  }

  return (
    <div className="bg-[#1c1c24] p-4 rounded-2xl border border-gray-800">
      <p className="text-xs text-gray-400 mb-2">Проект</p>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FolderOpen size={16} className="text-blue-400 flex-shrink-0" />
          <span className="text-sm text-white font-medium truncate">
            {loading ? 'Загрузка...' : activeBoard?.name || 'Нет проекта'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {isOpen ? (
            <ChevronUp size={14} className="text-gray-400" />
          ) : (
            <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-300" />
          )}
        </div>
      </button>

      {isOpen && (
        <ProjectDropdown
          onClose={() => setIsOpen(false)}
          onBoardChange={handleBoardChange}
        />
      )}
    </div>
  )
}
