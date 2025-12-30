'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Folder, Pencil, Check, X, Trash2 } from 'lucide-react'
import { useBoards } from '@/hooks/useBoards'
import { clsx } from 'clsx'

interface ProjectDropdownProps {
  onClose: () => void
  onBoardChange: (boardId: string) => void
}

/**
 * Dropdown with board list and inline creation
 * Allows switching, creating, and editing boards
 */
export function ProjectDropdown({ onClose, onBoardChange }: ProjectDropdownProps) {
  const { boards, activeBoardId, switchBoard, createBoard, updateBoard, deleteBoard } = useBoards()
  const [newBoardName, setNewBoardName] = useState('')
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (!editingId) {
          onClose()
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose, editingId])

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const handleCreate = async () => {
    const trimmed = newBoardName.trim()

    if (!trimmed) {
      setError('Название не может быть пустым')
      return
    }

    if (trimmed.length < 1) {
      setError('Название слишком короткое')
      return
    }

    if (trimmed.length > 100) {
      setError('Название слишком длинное (максимум 100 символов)')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const newBoard = await createBoard(trimmed)
      setNewBoardName('')
      switchBoard(newBoard.id)
      onBoardChange(newBoard.id)
      onClose()
    } catch (err) {
      setError('Не удалось создать проект')
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  const handleCreateKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreate()
    } else if (e.key === 'Escape') {
      setNewBoardName('')
      setError(null)
    }
  }

  const startEdit = (boardId: string, name: string) => {
    setEditingId(boardId)
    setEditName(name)
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setError(null)
  }

  const handleSaveEdit = async () => {
    const trimmed = editName.trim()

    if (!trimmed) {
      setError('Название не может быть пустым')
      return
    }

    if (trimmed.length < 1) {
      setError('Название слишком короткое')
      return
    }

    if (trimmed.length > 100) {
      setError('Название слишком длинное (максимум 100 символов)')
      return
    }

    try {
      await updateBoard(editingId!, trimmed)
      setEditingId(null)
      setEditName('')
    } catch (err) {
      setError('Не удалось сохранить название')
      console.error(err)
    }
  }

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const handleDelete = async (boardId: string, boardName: string) => {
    if (boards.length === 1) {
      setError('Нельзя удалить единственный проект')
      return
    }

    if (!confirm(`Удалить проект "${boardName}"? Все задачи и колонки будут удалены.`)) {
      return
    }

    try {
      await deleteBoard(boardId)
      if (boardId === activeBoardId) {
        onBoardChange('')
      }
    } catch (err) {
      setError('Не удалось удалить проект')
      console.error(err)
    }
  }

  return (
    <div ref={dropdownRef} className="mt-3 border-t border-gray-800 pt-3">
      {/* Board list */}
      <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
        {boards.map((board) => {
          const isActive = board.id === activeBoardId
          const isEditing = editingId === board.id

          return (
            <div
              key={board.id}
              className={clsx(
                'flex items-center justify-between px-2 py-2 rounded-lg group',
                isActive && 'bg-blue-500/10'
              )}
            >
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="flex-1 bg-[#121218] text-white text-sm px-2 py-1 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={handleSaveEdit}
                    className="text-green-400 hover:text-green-300 p-1"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      switchBoard(board.id)
                      onBoardChange(board.id)
                    }}
                    className="flex items-center gap-2 flex-1 min-w-0 text-left"
                  >
                    <Folder
                      size={14}
                      className={isActive ? 'text-blue-400' : 'text-gray-500'}
                    />
                    <span
                      className={clsx(
                        'text-sm truncate',
                        isActive ? 'text-blue-400 font-medium' : 'text-gray-300'
                      )}
                    >
                      {board.name}
                    </span>
                  </button>
                  <button
                    onClick={() => startEdit(board.id, board.name)}
                    className="text-gray-500 hover:text-gray-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDelete(board.id, board.name)}
                    className="text-gray-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить проект"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Create new board input */}
      <div className="border-t border-gray-700 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">+</span>
          <input
            type="text"
            value={newBoardName}
            onChange={(e) => {
              setNewBoardName(e.target.value)
              setError(null)
            }}
            onKeyDown={handleCreateKeyDown}
            placeholder="Название проекта..."
            disabled={creating}
            className={clsx(
              'flex-1 bg-[#121218] text-white text-sm px-2 py-1.5 rounded border focus:outline-none transition-colors',
              error ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
            )}
          />
        </div>
        {error && (
          <p className="text-red-400 text-xs mt-1">{error}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">Enter для создания</p>
      </div>
    </div>
  )
}
