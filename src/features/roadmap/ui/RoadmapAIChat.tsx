'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, Sparkles } from 'lucide-react'
import { useRoadmapAI } from '../hooks/useRoadmapAI'
import styles from './RoadmapAIChat.module.css'

interface RoadmapAIChatProps {
  boardId: string | null
  onApply: (content: string) => void
  onClose: () => void
}

export function RoadmapAIChat({ boardId, onApply, onClose }: RoadmapAIChatProps) {
  const { messages, loading, error, sendMessage, startSession, getFinalRoadmap, hasFinalResult, isPendingApproval } = useRoadmapAI()
  const [input, setInput] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startSession()
  }, [startSession])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }, [])

  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (trimmed && !loading) {
      sendMessage(trimmed)
      setInput('')
    }
  }, [input, loading, sendMessage])

  const handleOptionClick = useCallback((option: string) => {
    if (!loading) {
      // Check if this is an approval option
      const isApprove = option.toLowerCase().includes('утверждаю')
      if (isApprove && isPendingApproval()) {
        // User approved - apply the roadmap
        let roadmap = getFinalRoadmap()
        if (roadmap) {
          // Clean up the roadmap text - remove confirmation question if present
          roadmap = roadmap.replace(/Вы утверждаете[\s\S]*?хотите что-то добавить[\s\S]*?$/gi, '')
          roadmap = roadmap.replace(/ВАРИАНТЫ:\s*\[[^\]]*\]/gi, '')
          roadmap = roadmap.trim()

          onApply(roadmap)
          showToast('success', 'Roadmap применён!')
          setTimeout(() => onClose(), 500)
        }
      } else {
        // Normal option - send to AI
        sendMessage(option)
      }
    }
  }, [loading, sendMessage, isPendingApproval, getFinalRoadmap, onApply, onClose, showToast])

  const handleApply = useCallback(() => {
    const roadmap = getFinalRoadmap()
    if (roadmap) {
      onApply(roadmap)
      showToast('success', 'Roadmap применён!')
      setTimeout(() => onClose(), 500)
    } else {
      showToast('error', 'AI ещё не сгенерировал финальную roadmap')
    }
  }, [getFinalRoadmap, onApply, onClose, showToast])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.chatModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.chatHeader}>
          <h3><Sparkles size={18} /> AI Генерация Roadmap</h3>
          <button onClick={onClose} className={styles.iconButton}><X size={20} /></button>
        </div>

        <div className={styles.chatMessages}>
          {messages.length === 0 && (
            <div className={styles.welcomeMessage}>
              <p>👋 Привет! Расскажите мне о вашей идее для проекта, и я помогу создать структурированную дорожную карту.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
              <div className={styles.messageContent}>{msg.content}</div>
              {msg.options && (
                <div className={styles.messageOptions}>
                  {msg.options.map((opt, j) => (
                    <button
                      key={j}
                      onClick={() => handleOptionClick(opt)}
                      className={styles.optionButton}
                      disabled={loading}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className={`${styles.message} ${styles.assistant}`}>
              <div className={styles.typing}>AI печатает...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className={styles.errorBanner}>
            ⚠️ {error}. Попробуйте ещё раз.
          </div>
        )}

        <div className={styles.chatInput}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите ваш ответ..."
            className={styles.inputField}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            className={styles.sendButton}
            disabled={!input.trim() || loading}
          >
            <Send size={18} />
          </button>
        </div>

        <div className={styles.chatActions}>
          {!isPendingApproval() && (
            <button
              onClick={handleApply}
              className={styles.applyButton}
              disabled={!hasFinalResult}
            >
              ✓ Применить
            </button>
          )}
          <button onClick={onClose} className={styles.cancelButton}>
            Отмена
          </button>
        </div>

        {toast && (
          <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
            {toast.type === 'success' ? '✓' : '✗'} {toast.message}
          </div>
        )}
      </div>
    </div>
  )
}
