'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Check, Trash2, Loader2 } from 'lucide-react'

interface Suggestion {
  id: string
  user_id: string
  user_email: string
  category: 'bug' | 'feature' | 'improvement' | 'other'
  content: string
  screenshot_url: string | null
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected'
  created_at: string
}

// Category mapping to Russian
const categoryNames: Record<string, string> = {
  bug: 'Ошибка',
  feature: 'Фича',
  improvement: 'Улучшение',
  other: 'Другое'
}

// Category styles
const categoryStyles: Record<string, string> = {
  bug: 'bg-red-500/20 text-red-400',
  feature: 'bg-blue-500/20 text-blue-400',
  improvement: 'bg-green-500/20 text-green-400',
  other: 'bg-gray-500/20 text-gray-400'
}

// Status mapping
const statusNames: Record<string, string> = {
  pending: 'На рассмотрении',
  reviewed: 'Рассмотрено',
  implemented: 'Реализовано',
  rejected: 'Отклонено'
}

export default function MessagesPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingImages, setDeletingImages] = useState(false)

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/suggestions')
      if (!response.ok) throw new Error('Failed to fetch suggestions')
      const data = await response.json()
      setSuggestions(data)
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (suggestionId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/suggestions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: suggestionId, status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update status')

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId ? { ...s, status: newStatus as any } : s
        )
      )
    } catch (error) {
      console.error('Failed to update suggestion status:', error)
    }
  }

  const handleDeleteAllImages = async () => {
    if (!confirm('Вы уверены, что хотите удалить все скриншоты? Это действие нельзя отменить.')) {
      return
    }

    setDeletingImages(true)
    try {
      const response = await fetch('/api/admin/suggestions/images', {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete images')

      alert('Все скриншоты успешно удалены')

      // Refresh suggestions to update UI
      fetchSuggestions()
    } catch (error) {
      console.error('Failed to delete images:', error)
      alert('Ошибка при удалении скриншотов')
    } finally {
      setDeletingImages(false)
    }
  }

  const hasImages = suggestions.some(s => s.screenshot_url)

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Сообщения от пользователей</h1>
          <p className="text-gray-400 mt-1">Предложения, ошибки и обратная связь</p>
        </div>
        <div className="flex items-center gap-3">
          {hasImages && (
            <button
              onClick={handleDeleteAllImages}
              disabled={deletingImages}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/30 hover:border-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deletingImages ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              {deletingImages ? 'Удаление...' : 'Удалить все изображения'}
            </button>
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            Загрузка...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <MessageSquare size={48} className="mb-4 opacity-50" />
            <p>Нет сообщений от пользователей</p>
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <div key={suggestion.id} className="bg-[#1a1a20] border border-gray-800 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white font-medium">{suggestion.user_email}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${categoryStyles[suggestion.category]}`}>
                      {categoryNames[suggestion.category]}
                    </span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {new Date(suggestion.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  {statusNames[suggestion.status]}
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4 whitespace-pre-wrap">{suggestion.content}</p>

              {suggestion.screenshot_url && (
                <div className="mb-4 rounded-lg overflow-hidden border border-gray-700">
                  <img
                    src={suggestion.screenshot_url}
                    alt="Screenshot"
                    className="w-full max-h-80 object-cover"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                {suggestion.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(suggestion.id, 'reviewed')}
                      className="px-3 py-1.5 text-sm border border-gray-700 text-gray-400 rounded-md hover:bg-gray-800 transition-all"
                    >
                      Принять в рассмотрение
                    </button>
                    <button
                      onClick={() => handleStatusChange(suggestion.id, 'implemented')}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500/10 text-green-400 border border-green-500/30 rounded-md hover:bg-green-500/20 transition-all"
                    >
                      <Check size={14} />
                      Реализовано
                    </button>
                  </>
                )}
                {suggestion.status === 'reviewed' && (
                  <button
                    onClick={() => handleStatusChange(suggestion.id, 'implemented')}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-500/10 text-green-400 border border-green-500/30 rounded-md hover:bg-green-500/20 transition-all"
                  >
                    <Check size={14} />
                    Отметить реализованным
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
