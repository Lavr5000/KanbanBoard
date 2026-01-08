'use client';

import { Task } from '@/entities/task/model/types';
import { SwipeableTaskCard } from '@/features/swipe-handler';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useState } from 'react';

interface MobileTaskCardProps {
  task: Task;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  previousColumnTitle: string;
  nextColumnTitle: string;
}

export function MobileTaskCard({
  task,
  onSwipeLeft,
  onSwipeRight,
  previousColumnTitle,
  nextColumnTitle,
}: MobileTaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);

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

  return (
    <SwipeableTaskCard
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      className="mb-3"
    >
      <div
        data-mobile-tour="swipe-task"
        className={`
          bg-[#1c1c24] p-4 rounded-xl border border-gray-800
          ${isDragging ? 'scale-[0.98]' : 'scale-100'}
          transition-transform
        `}
      >
        {/* Priority badge */}
        <div className="flex items-center gap-2 mb-2">
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
    </SwipeableTaskCard>
  );
}
