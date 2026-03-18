"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Check, X } from "lucide-react";

interface Props {
  columnId: string;
  title: string;
  isFirst: boolean;
  onColumnUpdated?: (columnId: string, newTitle: string) => void;
  onColumnDelete?: (columnId: string) => void;
}

export const ColumnHeader = ({ columnId, title, isFirst, onColumnUpdated, onColumnDelete }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local state when title prop changes
  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedTitle(title);
  };

  const handleSave = async () => {
    const trimmedTitle = editedTitle.trim();

    if (!trimmedTitle) {
      // Title cannot be empty
      setEditedTitle(title);
      setIsEditing(false);
      return;
    }

    if (trimmedTitle === title) {
      // No changes
      setIsEditing(false);
      return;
    }

    try {
      const res = await fetch(`/api/columns/${columnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmedTitle }),
      });
      if (!res.ok) throw new Error('Failed to update column');
      onColumnUpdated?.(columnId, trimmedTitle);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update column:", error);
      setEditedTitle(title);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleDelete = async () => {
    if (isFirst) {
      // Cannot delete first column
      return;
    }

    if (!confirm("Move all tasks to first column and delete this column?")) {
      return;
    }

    setIsDeleting(true);
    try {
      onColumnDelete?.(columnId);
    } catch (error) {
      console.error("Failed to delete column:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between w-full group">
      <div className="flex items-center gap-2 flex-1">
        {isEditing ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              ref={inputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="glass text-white text-sm font-semibold px-3 py-1.5 rounded-lg border border-white/20 focus:outline-none focus:border-white/40 focus:bg-white/10 flex-1 transition-all"
              maxLength={50}
            />
            <button
              onClick={handleSave}
              className="text-green-500 hover:text-green-400 p-1"
              title="Save"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancel}
              className="text-red-500 hover:text-red-400 p-1"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <h3
            onClick={handleStartEdit}
            className="text-white font-semibold text-base cursor-pointer hover:bg-white/5 px-2 py-1.5 rounded-lg transition-all duration-300 flex-1"
            title="Нажмите для редактирования"
          >
            {title}
          </h3>
        )}
      </div>

      {!isFirst && !isEditing && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Delete column"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};
