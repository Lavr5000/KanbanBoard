'use client';

import React from 'react';
import { useKanbanStore } from '@/lib/stores/kanbanStore';
import { useThemeStore, type ThemeMode } from '@/lib/stores/themeStore';
import { Button } from '@/components/ui/Button';
import { Trash2, Sun, Moon, Monitor, KanbanSquareIcon } from 'lucide-react';

export function Header() {
  const { clearBoard } = useKanbanStore();
  const { mode, setMode, isDark, setIsDark } = useThemeStore();
  const [mounted, setMounted] = React.useState(false);
  const [showThemeMenu, setShowThemeMenu] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleClearBoard = () => {
    if (window.confirm('Are you sure you want to clear the board? This action cannot be undone.')) {
      clearBoard();
    }
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    setShowThemeMenu(false);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* App Title and Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <KanbanSquareIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Kanban Board
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Organize your tasks efficiently
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Selector */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="h-9 w-9 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Theme selector"
                title={`Current: ${mounted ? mode : 'loading'}`}
              >
                {mounted && mode === 'light' && <Sun className="h-4 w-4" />}
                {mounted && mode === 'dark' && <Moon className="h-4 w-4" />}
                {mounted && mode === 'auto' && <Monitor className="h-4 w-4" />}
                {!mounted && <Sun className="h-4 w-4" />}
              </Button>

              {/* Theme Menu */}
              {showThemeMenu && mounted && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-lg z-50">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                      mode === 'light'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                      mode === 'dark'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => handleThemeChange('auto')}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                      mode === 'auto'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                    Auto
                  </button>
                </div>
              )}
            </div>

            {/* Clear Board Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearBoard}
              className="h-9 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Clear Board</span>
              <span className="sm:hidden">Clear</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}