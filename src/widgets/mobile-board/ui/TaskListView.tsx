'use client';

import { Task, Column as UIColumn } from '@/entities/task/model/types';
import { MobileTaskCard } from './MobileTaskCard';
import { useUIStore } from '@/entities/ui/model/store';
import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TaskListViewProps {
  tasks: Task[];
  columns: UIColumn[];
  onMoveTask: (taskId: string, newColumnId: string, position: number) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export function TaskListView({
  tasks,
  columns,
  onMoveTask,
  onUpdateTask,
  onDeleteTask,
}: TaskListViewProps) {
  const { searchQuery } = useUIStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Find adjacent columns for swipe
  const getAdjacentColumns = (currentColumnId: string) => {
    const currentIndex = columns.findIndex((c) => String(c.id) === currentColumnId);
    return {
      prevColumn: currentIndex > 0 ? columns[currentIndex - 1] : null,
      nextColumn: currentIndex < columns.length - 1 ? columns[currentIndex + 1] : null,
    };
  };

  // Handle swipe right (move to next column)
  const handleSwipeRight = async (task: Task) => {
    const { nextColumn } = getAdjacentColumns(String(task.columnId));
    if (nextColumn) {
      await onMoveTask(String(task.id), String(nextColumn.id), 0);
    }
  };

  // Handle swipe left (move to previous column)
  const handleSwipeLeft = async (task: Task) => {
    const { prevColumn } = getAdjacentColumns(String(task.columnId));
    if (prevColumn) {
      await onMoveTask(String(task.id), String(prevColumn.id), 0);
    }
  };

  // Filter tasks by search
  const filteredTasks = tasks.filter((task) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.content?.toLowerCase().includes(query) ||
      task.tags?.some((tag: string) => tag.toLowerCase().includes(query))
    );
  });

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-sm">Нет задач</p>
        {searchQuery && (
          <p className="text-xs mt-2">Попробуйте изменить поисковый запрос</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-0" data-mobile-tour="task-list">
      {filteredTasks.map((task) => {
        const { prevColumn, nextColumn } = getAdjacentColumns(String(task.columnId));

        return (
          <div key={task.id} className="relative group">
            <MobileTaskCard
              task={task}
              onSwipeLeft={() => handleSwipeLeft(task)}
              onSwipeRight={() => handleSwipeRight(task)}
              previousColumnTitle={prevColumn?.title || ''}
              nextColumnTitle={nextColumn?.title || ''}
            />

            {/* Action buttons (shown on long press or select) */}
            {selectedTaskId === task.id && (
              <div className="absolute top-2 right-2 flex gap-2 bg-[#1c1c24] rounded-lg p-1 shadow-lg">
                <button
                  onClick={() => {
                    // Open edit modal
                    setSelectedTaskId(null);
                  }}
                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    onDeleteTask(String(task.id));
                    setSelectedTaskId(null);
                  }}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
