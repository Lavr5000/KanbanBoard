'use client';

import { Task, Column as UIColumn } from '@/entities/task/model/types';
import { MobileTaskCard } from './MobileTaskCard';
import { useUIStore } from '@/entities/ui/model/store';

interface TaskListViewProps {
  tasks: Task[];
  columns: UIColumn[];
  onMoveTask: (taskId: string, newColumnId: string, position: number) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onEditTask?: (task: Task) => void;
  boardName: string;
  allTasks: Task[];
}

export function TaskListView({
  tasks,
  columns,
  onMoveTask,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  boardName,
  allTasks,
}: TaskListViewProps) {
  const { searchQuery } = useUIStore();

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

  // Sort by priority (high -> medium -> low)
  const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityA = priorityOrder[a.priority || 'none'] ?? 3;
    const priorityB = priorityOrder[b.priority || 'none'] ?? 3;
    return priorityA - priorityB;
  });

  if (sortedTasks.length === 0) {
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
      {sortedTasks.map((task) => {
        const { prevColumn, nextColumn } = getAdjacentColumns(String(task.columnId));
        const currentColumn = columns.find((c) => String(c.id) === String(task.columnId));

        return (
          <div key={task.id} className="relative group">
            <MobileTaskCard
              task={task}
              onSwipeLeft={() => handleSwipeLeft(task)}
              onSwipeRight={() => handleSwipeRight(task)}
              onEdit={() => onEditTask && onEditTask(task)}
              onDelete={() => onDeleteTask(String(task.id))}
              previousColumnTitle={prevColumn?.title || ''}
              nextColumnTitle={nextColumn?.title || ''}
              columnTitle={currentColumn?.title || ''}
              boardName={boardName}
              allTasks={allTasks}
            />
          </div>
        );
      })}
    </div>
  );
}
