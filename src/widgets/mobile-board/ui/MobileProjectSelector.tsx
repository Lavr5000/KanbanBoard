'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Folder, Pencil, Check, X, Trash2, X as CloseIcon } from 'lucide-react';
import { useBoards } from '@/hooks/useBoards';
import { clsx } from 'clsx';

interface MobileProjectSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onBoardChange: () => void;
}

/**
 * Mobile modal for project selection and management
 * Shows as full-screen modal on mobile devices
 */
export function MobileProjectSelector({ isOpen, onClose, onBoardChange }: MobileProjectSelectorProps) {
  const { boards, activeBoardId, switchBoard, createBoard, updateBoard, deleteBoard } = useBoards();
  const [newBoardName, setNewBoardName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setNewBoardName('');
      setCreating(false);
      setEditingId(null);
      setEditName('');
      setError(null);
    }
  }, [isOpen]);

  const handleCreate = async () => {
    const trimmed = newBoardName.trim();

    if (!trimmed) {
      setError('Название не может быть пустым');
      return;
    }

    if (trimmed.length > 100) {
      setError('Название слишком длинное (максимум 100 символов)');
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const newBoard = await createBoard(trimmed);
      setNewBoardName('');
      switchBoard(newBoard.id);
      onBoardChange();
      onClose();
    } catch (err) {
      setError('Не удалось создать проект');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreate();
    } else if (e.key === 'Escape') {
      setNewBoardName('');
      setError(null);
    }
  };

  const startEdit = (boardId: string, name: string) => {
    setEditingId(boardId);
    setEditName(name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setError(null);
  };

  const handleSaveEdit = async () => {
    const trimmed = editName.trim();

    if (!trimmed) {
      setError('Название не может быть пустым');
      return;
    }

    if (trimmed.length > 100) {
      setError('Название слишком длинное (максимум 100 символов)');
      return;
    }

    try {
      await updateBoard(editingId!, trimmed);
      setEditingId(null);
      setEditName('');
    } catch (err) {
      setError('Не удалось сохранить название');
      console.error(err);
    }
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  const handleDelete = async (boardId: string, boardName: string) => {
    if (boards.length === 1) {
      setError('Нельзя удалить единственный проект');
      return;
    }

    if (!confirm(`Удалить проект "${boardName}"? Все задачи и колонки будут удалены.`)) {
      return;
    }

    try {
      await deleteBoard(boardId);
      if (boardId === activeBoardId) {
        onBoardChange();
      }
    } catch (err) {
      setError('Не удалось удалить проект');
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-[#1a1a20] w-full sm:max-w-md sm:rounded-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Выберите проект</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={editingId !== null}
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Board list */}
          <div className="space-y-2 mb-4">
            {boards.map((board) => {
              const isActive = board.id === activeBoardId;
              const isEditing = editingId === board.id;

              return (
                <div
                  key={board.id}
                  className={clsx(
                    'bg-[#1c1c24] rounded-xl border transition-all',
                    isActive ? 'border-blue-500/50' : 'border-gray-800'
                  )}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 p-3">
                      <input
                        ref={inputRef}
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={handleEditKeyDown}
                        className="flex-1 bg-[#121218] text-white text-sm px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-2 text-green-400 hover:text-green-300"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-2 text-gray-400 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3">
                      <button
                        onClick={() => {
                          switchBoard(board.id);
                          onBoardChange();
                          onClose();
                        }}
                        className="flex items-center gap-2 flex-1 min-w-0 text-left"
                      >
                        <Folder
                          size={18}
                          className={isActive ? 'text-blue-400' : 'text-gray-500'}
                        />
                        <span
                          className={clsx(
                            'text-sm truncate',
                            isActive ? 'text-white font-medium' : 'text-gray-300'
                          )}
                        >
                          {board.name}
                        </span>
                      </button>
                      <button
                        onClick={() => startEdit(board.id, board.name)}
                        className="p-2 text-gray-500 hover:text-gray-300"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(board.id, board.name)}
                        className="p-2 text-gray-500 hover:text-red-400"
                        title="Удалить проект"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Create new board */}
          <div className="border-t border-gray-800 pt-4">
            <p className="text-sm text-gray-400 mb-2">Новый проект</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => {
                  setNewBoardName(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleCreateKeyDown}
                placeholder="Название проекта..."
                disabled={creating}
                className={clsx(
                  'flex-1 bg-[#1c1c24] text-white text-sm px-4 py-3 rounded-xl border focus:outline-none transition-colors',
                  error ? 'border-red-500' : 'border-gray-700 focus:border-blue-500'
                )}
              />
              <button
                onClick={handleCreate}
                disabled={creating || !newBoardName.trim()}
                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                {creating ? '...' : 'OK'}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
