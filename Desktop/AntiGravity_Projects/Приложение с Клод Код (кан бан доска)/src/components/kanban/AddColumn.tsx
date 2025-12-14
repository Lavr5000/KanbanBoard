'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddColumnProps {
  onAddColumn: (title: string) => void;
  disabled?: boolean;
}

export function AddColumn({ onAddColumn, disabled = false }: AddColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddColumn(title.trim());
      setTitle('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isAdding) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 w-72 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4 shadow-sm"
        onKeyDown={handleKeyDown}
      >
        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter column title..."
              className="w-full px-3 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={!title.trim()}
              className="flex-1 h-8"
              aria-label="Add new column"
            >
              Add column
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 h-8"
              aria-label="Cancel adding column"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="flex-shrink-0 w-72">
      <Button
        variant="ghost"
        onClick={() => setIsAdding(true)}
        disabled={disabled}
        className={cn(
          'w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg',
          'hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50',
          'transition-all duration-200 group',
          'flex flex-col items-center justify-center gap-2',
          'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Add new column to board"
      >
        <Plus
          className={cn(
            'h-8 w-8 transition-transform duration-200',
            'group-hover:scale-110'
          )}
        />
        <span className="text-sm font-medium">Add Column</span>
      </Button>
    </div>
  );
}