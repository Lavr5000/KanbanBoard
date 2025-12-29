'use client'

interface AISuggestionIconProps {
  onRestore: () => void
  className?: string
}

/**
 * Small icon that appears after AI suggestions are hidden
 * Click to restore suggestions
 */
export function AISuggestionIcon({ onRestore, className = '' }: AISuggestionIconProps) {
  return (
    <button
      onClick={onRestore}
      className={`flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all text-xs font-medium ${className}`}
      title="Показать AI-подсказки"
    >
      <span className="text-purple-400">✨</span>
      <span>AI</span>
    </button>
  )
}
