'use client';

import { Task } from '@/entities/task/model/types';
import { SwipeableTaskCard } from '@/features/swipe-handler';
import { ChevronLeft, ChevronRight, Flag, Sparkles, Edit2, Trash2 } from 'lucide-react';
import { useTaskAI, TaskAISuggestions, AISuggestionIcon } from '@/features/task-ai-suggestions';
import { useAISuggestions } from '@/features/ai-suggestions/hooks/useAISuggestions';

interface MobileTaskCardProps {
  task: Task;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  previousColumnTitle: string;
  nextColumnTitle: string;
  columnTitle: string;
  boardName: string;
  allTasks: Task[];
}

export function MobileTaskCard({
  task,
  onSwipeLeft,
  onSwipeRight,
  onEdit,
  onDelete,
  previousColumnTitle,
  nextColumnTitle,
  columnTitle,
  boardName,
  allTasks,
}: MobileTaskCardProps) {
  const { suggestions, loading, error, visible, generateSuggestions, hideSuggestions, restoreSuggestions } = useTaskAI({
    taskId: String(task.id),
  });

  // Load saved AI suggestions from database
  const { suggestions: savedSuggestions } = useAISuggestions({ taskId: String(task.id) });

  // Use saved suggestions if available, otherwise use current suggestions
  const displaySuggestions = savedSuggestions || suggestions;

  const getPriorityStyles = () => {
    switch (task.priority) {
      case 'high':
        return {
          bg: 'bg-red-500/10',
          text: 'text-red-400',
          border: 'border-red-500/20',
          label: 'Срочно',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-400',
          border: 'border-yellow-500/20',
          label: 'Обычно',
        };
      case 'low':
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          border: 'border-blue-500/20',
          label: 'Низкий',
        };
      default:
        return {
          bg: 'bg-gray-500/10',
          text: 'text-gray-400',
          border: 'border-gray-500/20',
          label: 'Обычно',
        };
    }
  };

  const priorityStyles = getPriorityStyles();

  // Open AI panel for this task
  const handleAIClick = () => {
    // If we have saved suggestions, restore them instead of generating new ones
    if (savedSuggestions) {
      restoreSuggestions();
      return;
    }

    // Otherwise generate new suggestions
    generateSuggestions(
      task.content,
      columnTitle,
      boardName,
      allTasks.map(t => ({ content: t.content }))
    );
  };

  return (
    <SwipeableTaskCard
      onSwipeLeft={previousColumnTitle ? onSwipeLeft : undefined}
      onSwipeRight={nextColumnTitle ? onSwipeRight : undefined}
      className="mb-3"
    >
      <div
        data-mobile-tour="swipe-task"
        className="bg-[#1c1c24] p-4 rounded-xl border border-gray-800 relative"
      >
        {/* Action buttons - top right */}
        <div className="absolute top-3 right-3 flex gap-2">
          {/* AI button or icon */}
          {!visible && displaySuggestions ? (
            // Show icon when there are hidden suggestions
            <AISuggestionIcon onRestore={restoreSuggestions} className="text-xs" />
          ) : (
            // Show generate button when no suggestions
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAIClick();
              }}
              disabled={loading}
              className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:scale-105 transition-transform shadow-lg hover:shadow-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="AI подсказки"
            >
              <Sparkles size={12} className="text-white" />
            </button>
          )}

          {/* Edit button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="p-1.5 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors active:scale-95"
            title="Редактировать"
          >
            <Edit2 size={12} className="text-white" />
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="p-1.5 bg-red-500 rounded-lg hover:bg-red-600 transition-colors active:scale-95"
            title="Удалить"
          >
            <Trash2 size={12} className="text-white" />
          </button>
        </div>

        {/* Priority badge */}
        <div className="flex items-center gap-2 mb-2 pr-20">
          <span
            className={`
              px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1
              ${priorityStyles.bg} ${priorityStyles.text} ${priorityStyles.border}
            `}
          >
            <Flag size={12} />
            {priorityStyles.label}
          </span>
        </div>

        {/* Task content */}
        <p className="text-gray-300 text-sm mb-3 leading-relaxed">
          {task.content}
        </p>

        {/* AI Loading indicator */}
        {loading && (
          <div className="mb-3 pt-3 border-t border-gray-700/50 animate-pulse">
            <div className="text-xs text-purple-400">💡 Загрузка AI-предложений...</div>
          </div>
        )}

        {/* AI Error */}
        {error && (
          <div className="mb-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Swipe hints */}
        <div className="flex justify-between text-xs text-gray-500">
          {previousColumnTitle && (
            <div className="flex items-center gap-1">
              <ChevronLeft size={14} />
              <span>{previousColumnTitle}</span>
            </div>
          )}
          <div className="flex-1" />
          {nextColumnTitle && (
            <div className="flex items-center gap-1">
              <span>{nextColumnTitle}</span>
              <ChevronRight size={14} />
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions Panel */}
      {visible && displaySuggestions && (
        <TaskAISuggestions
          data={displaySuggestions}
          onHide={hideSuggestions}
          isSaved={!!savedSuggestions}
        />
      )}
    </SwipeableTaskCard>
  );
}
