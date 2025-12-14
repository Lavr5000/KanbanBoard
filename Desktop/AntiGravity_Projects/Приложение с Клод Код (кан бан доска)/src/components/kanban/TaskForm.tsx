'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  onSubmit: (title: string, description: string) => void;
  onCancel: () => void;
  initialTitle?: string;
  initialDescription?: string;
  submitButtonText?: string;
  placeholderTitle?: string;
  placeholderDescription?: string;
  className?: string;
}

export function TaskForm({
  onSubmit,
  onCancel,
  initialTitle = '',
  initialDescription = '',
  submitButtonText = 'Save',
  placeholderTitle = 'Enter task title...',
  placeholderDescription = 'Enter task description (optional)...',
  className,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      onSubmit(title.trim(), description.trim());
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit(e as React.FormEvent);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      descriptionInputRef.current?.focus();
    } else {
      handleKeyDown(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-3', className)}>
      {/* Title Input */}
      <div>
        <textarea
          ref={titleInputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          placeholder={placeholderTitle}
          rows={1}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200"
          style={{
            minHeight: '40px',
            maxHeight: '120px',
            height: 'auto',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
          disabled={isSubmitting}
          aria-label="Task title"
          aria-required="true"
        />
      </div>

      {/* Description Input */}
      <div>
        <textarea
          ref={descriptionInputRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderDescription}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors duration-200"
          style={{
            minHeight: '60px',
            maxHeight: '200px',
            height: 'auto',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
          disabled={isSubmitting}
          aria-label="Task description"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="flex-1 h-9"
          size="sm"
        >
          {isSubmitting ? 'Saving...' : submitButtonText}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-9"
          size="sm"
        >
          Cancel
        </Button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div>• <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd> to save</div>
        <div>• <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd> to cancel</div>
      </div>
    </form>
  );
}