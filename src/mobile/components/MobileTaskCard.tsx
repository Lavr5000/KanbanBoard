'use client';

import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Task, Column } from '@/entities/task/model/types';
import { Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  task: Task;
  columns: Column[];
  onMoveTask: (taskId: string, newColumnId: string) => void;
  onOpenDetail: (task: Task) => void;
}

const SWIPE_THRESHOLD = 80;

export function MobileTaskCard({ task, columns, onMoveTask, onOpenDetail }: Props) {
  const [isAnimating, setIsAnimating] = useState(false);
  const x = useMotionValue(0);

  // Find current column index
  const currentColumnIndex = columns.findIndex(c => c.id === task.columnId);
  const canSwipeRight = currentColumnIndex < columns.length - 1;
  const canSwipeLeft = currentColumnIndex > 0;

  // Background colors based on swipe direction
  const backgroundColor = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    [
      canSwipeLeft ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0,0,0,0)',
      'rgba(0,0,0,0)',
      canSwipeRight ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0,0,0,0)',
    ]
  );

  // Icon opacity
  const leftOpacity = useTransform(x, [-SWIPE_THRESHOLD, -40, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 40, SWIPE_THRESHOLD], [0, 0.5, 1]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeDistance = info.offset.x;
    const velocity = info.velocity.x;

    // Right swipe (move to next column)
    if ((swipeDistance > SWIPE_THRESHOLD || velocity > 500) && canSwipeRight) {
      setIsAnimating(true);
      const nextColumn = columns[currentColumnIndex + 1];
      onMoveTask(String(task.id), String(nextColumn.id));
      setTimeout(() => setIsAnimating(false), 300);
    }
    // Left swipe (move to previous column)
    else if ((swipeDistance < -SWIPE_THRESHOLD || velocity < -500) && canSwipeLeft) {
      setIsAnimating(true);
      const prevColumn = columns[currentColumnIndex - 1];
      onMoveTask(String(task.id), String(prevColumn.id));
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const getNextColumnName = () => {
    if (currentColumnIndex < columns.length - 1) {
      return columns[currentColumnIndex + 1].title;
    }
    return '';
  };

  const getPrevColumnName = () => {
    if (currentColumnIndex > 0) {
      return columns[currentColumnIndex - 1].title;
    }
    return '';
  };

  return (
    <div className="relative overflow-hidden rounded-xl mb-3">
      {/* Swipe indicators */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-4"
        style={{ backgroundColor }}
      >
        {/* Left indicator (swipe left = previous column) */}
        <motion.div
          className="flex items-center gap-2 text-red-400"
          style={{ opacity: leftOpacity }}
        >
          <ChevronLeft size={20} />
          <span className="text-xs font-medium">{getPrevColumnName()}</span>
        </motion.div>

        {/* Right indicator (swipe right = next column) */}
        <motion.div
          className="flex items-center gap-2 text-green-400"
          style={{ opacity: rightOpacity }}
        >
          <span className="text-xs font-medium">{getNextColumnName()}</span>
          <ChevronRight size={20} />
        </motion.div>
      </motion.div>

      {/* Card content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={isAnimating ? { x: 0 } : undefined}
        onClick={() => onOpenDetail(task)}
        className="relative bg-[#1c1c24] p-4 rounded-xl border border-gray-800 touch-pan-y"
      >
        {/* Priority badge */}
        <div className="flex justify-between items-start mb-2">
          <span
            className={clsx(
              'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
              task.priority === 'high'
                ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                : task.priority === 'medium'
                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                : 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
            )}
          >
            {task.priority === 'high' ? 'Срочно' : task.priority === 'medium' ? 'Обычно' : 'Низкий'}
          </span>

          {/* Swipe hint */}
          <div className="flex items-center gap-1 text-gray-600">
            {canSwipeLeft && <ChevronLeft size={14} />}
            {canSwipeRight && <ChevronRight size={14} />}
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-300 text-sm mb-3 line-clamp-2 leading-relaxed">
          {task.content}
        </p>

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[10px] rounded"
              >
                #{tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-gray-500 text-[10px]">+{task.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center text-gray-500 gap-1.5 border-t border-gray-800 pt-3">
          <Calendar size={12} />
          <span className="text-[10px]">
            {new Date(task.createdAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
