'use client'

import { Menu, Map, Search, Bell, Play } from 'lucide-react'
import { useMobileUIStore } from '@/entities/ui/model/mobileStore'
import { useUIStore } from '@/entities/ui/model/store'
import { useBoards } from '@/hooks/useBoards'
import { useState } from 'react'

interface MobileHeaderProps {
  progressPercentage: number
}

export function MobileHeader({ progressPercentage }: MobileHeaderProps) {
  const { openLeftDrawer, openRightDrawer } = useMobileUIStore()
  const { searchQuery, setSearchQuery } = useUIStore()
  const { activeBoard } = useBoards()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-[#121218]/95 backdrop-blur-md border-b border-gray-800">
      {/* Safe area padding for notched devices */}
      <div className="pt-safe-top">
        <div className="h-16 flex items-center justify-between px-4">
          {/* Left: Menu Button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={openLeftDrawer}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-gray-800 active:scale-95"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-1.5">
                <Play className="fill-white text-white" size={14} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-white text-sm">{activeBoard?.name || 'Kanban'}</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500">{progressPercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Search + Roadmap */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 transition-colors rounded-xl active:scale-95 ${
                isSearchOpen ? 'text-blue-500 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              aria-label="Search"
            >
              <Search size={22} />
            </button>

            {/* Roadmap button */}
            <button
              onClick={openRightDrawer}
              className="p-2 text-purple-400 hover:text-purple-300 transition-colors rounded-xl hover:bg-purple-500/10 active:scale-95 relative"
              aria-label="Open roadmap"
            >
              <Map size={22} />
              {/* Subtle glow indicator */}
              <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-sm -z-10" />
            </button>
          </div>
        </div>

        {/* Search Input - Expandable */}
        {isSearchOpen && (
          <div className="px-4 pb-3 animate-slide-down">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#1c1c24] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
