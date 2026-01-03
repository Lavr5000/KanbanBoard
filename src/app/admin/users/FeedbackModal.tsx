'use client'

import { useState, useEffect } from 'react'
import { X, MessageSquare, Check } from 'lucide-react'
import styles from './FeedbackModal.module.css'

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

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

// Category mapping to Russian
const categoryNames: Record<string, string> = {
  bug: 'Ошибка',
  feature: 'Фича',
  improvement: 'Улучшение',
  other: 'Другое'
}

// Category to CSS class mapping
const categoryStyles: Record<string, string> = {
  bug: 'feedbackTypeComplaint',
  feature: 'feedbackTypeSuggestion',
  improvement: 'feedbackTypeFeedback',
  other: 'feedbackTypeFeedback'
}

// Status mapping
const statusNames: Record<string, string> = {
  pending: 'На рассмотрении',
  reviewed: 'Рассмотрено',
  implemented: 'Реализовано',
  rejected: 'Отклонено'
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions()
    }
  }, [isOpen])

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

      // Update local state
      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestionId ? { ...s, status: newStatus as any } : s
        )
      )
    } catch (error) {
      console.error('Failed to update suggestion status:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Сообщения от пользователей</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {loading ? (
            <div className={styles.emptyState}>Загрузка...</div>
          ) : suggestions.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <p>Нет сообщений от пользователей</p>
            </div>
          ) : (
            suggestions.map((suggestion) => (
              <div key={suggestion.id} className={styles.feedbackItem}>
                <div className={styles.feedbackHeader}>
                  <div>
                    <div className={styles.feedbackEmail}>{suggestion.user_email}</div>
                    <div className={styles.feedbackDate}>
                      {new Date(suggestion.created_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  <div className={`${styles.feedbackType} ${styles[categoryStyles[suggestion.category] || 'feedbackTypeFeedback']}`}>
                    {categoryNames[suggestion.category] || suggestion.category}
                  </div>
                </div>

                <p className={styles.feedbackMessage}>{suggestion.content}</p>

                {suggestion.screenshot_url && (
                  <div className={styles.screenshotContainer}>
                    <img
                      src={suggestion.screenshot_url}
                      alt="Screenshot"
                      className={styles.screenshot}
                    />
                  </div>
                )}

                <div className={styles.feedbackActions}>
                  {suggestion.status === 'pending' && (
                    <>
                      <button
                        className={styles.feedbackAction}
                        onClick={() => handleStatusChange(suggestion.id, 'reviewed')}
                      >
                        Принять в рассмотрение
                      </button>
                      <button
                        className={styles.feedbackAction + ' ' + styles.feedbackActionResolved}
                        onClick={() => handleStatusChange(suggestion.id, 'implemented')}
                      >
                        <Check size={14} style={{ marginRight: 4 }} />
                        Реализовано
                      </button>
                    </>
                  )}
                  {suggestion.status === 'reviewed' && (
                    <button
                      className={styles.feedbackAction + ' ' + styles.feedbackActionResolved}
                      onClick={() => handleStatusChange(suggestion.id, 'implemented')}
                    >
                      <Check size={14} style={{ marginRight: 4 }} />
                      Отметить реализованным
                    </button>
                  )}
                  <div style={{ marginLeft: 'auto', color: '#6b7280', fontSize: 12 }}>
                    {statusNames[suggestion.status]}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
