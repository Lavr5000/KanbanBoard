"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateColumn } from "@/lib/supabase/queries/columns";

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
  const supabase = createClient();

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
      await updateColumn(supabase, columnId, { title: trimmedTitle });
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
              className="bg-[#1e1e24] text-gray-200 text-sm font-semibold px-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-blue-500 flex-1"
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
            className="text-gray-200 font-semibold text-sm cursor-pointer hover:bg-[#1e1e24] px-2 py-1 rounded transition-colors flex-1"
            title="Click to edit"
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
