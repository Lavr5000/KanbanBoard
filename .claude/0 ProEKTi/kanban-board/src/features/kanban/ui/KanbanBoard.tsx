import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useKanbanStore } from '@/shared/store/kanbanStore';
import { useKanbanDnD } from '@/features/kanban/hooks/useKanbanDnD';
import { KanbanColumn } from './KanbanColumn';
import { FilterPanel } from './FilterPanel';
import { Task, Column } from '@/shared/types/task';

export const KanbanBoard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Loading state - NO hooks called yet
  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="w-8 h-8 border-2 border-gray-600 rounded-full animate-spin border-t-blue-400 mx-auto mb-3"></div>
          <div>Initializing Kanban Board...</div>
        </div>
      </div>
    );
  }

  // Return the actual board component
  return <KanbanBoardContent />;
};

// Inner component that contains all the hooks
const KanbanBoardContent = () => {
  // Now all hooks are called consistently in every render
  const { addTask, filters, setFilters, getCurrentProjectTasks } = useKanbanStore();
  const { handleDragEnd } = useKanbanDnD();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Define columns configuration following AppFlowy pattern
  const columnConfig: Column[] = [
    { id: 'todo', title: 'Новая задача', taskIds: [] },
    { id: 'in-progress', title: 'Выполняется', taskIds: [] },
    { id: 'review', title: 'Ожидает проверки', taskIds: [] },
    { id: 'testing', title: 'Тестирование', taskIds: [] },
    { id: 'done', title: 'Готово', taskIds: [] }
  ];

  // Get current project tasks
  const currentProjectTasks = getCurrentProjectTasks();

  // Apply filters to current project tasks
  const filteredTasks = currentProjectTasks.filter(task => {
    // Search filter
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !task.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Priority filter
    if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
      return false;
    }

    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const startDate = new Date(filters.dateRange.start);
      if (taskDate < startDate) return false;
    }

    if (filters.dateRange.end && task.dueDate) {
      const taskDate = new Date(task.dueDate);
      const endDate = new Date(filters.dateRange.end);
      if (taskDate > endDate) return false;
    }

    if (filters.dateRange.hasDueDate !== undefined) {
      const hasDueDate = !!task.dueDate;
      if (filters.dateRange.hasDueDate !== hasDueDate) return false;
    }

    return true;
  });

  // Create columns with current task data
  const columnsWithData: (Column & { tasks: Task[] })[] = columnConfig.map(column => {
    const tasks = filteredTasks.filter(task => task.status === column.id);
    return {
      ...column,
      taskIds: tasks.map((t: Task) => t.id),
      tasks
    };
  });

  return (
    <div className="flex flex-col h-full">
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        taskCount={filteredTasks.length}
      />
      <div className="flex-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-8 overflow-x-auto pb-6 w-full kanban-scrollbar p-4">
            <div className="flex gap-8 min-w-max">
              {columnsWithData.map((column, index) => (
                <SortableContext
                  key={column.id}
                  id={column.id}
                  items={column.taskIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    className="card-entrance"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <KanbanColumn
                      column={column}
                      tasks={column.tasks}
                      count={column.tasks.length}
                      onAddTask={() => addTask(column.id)}
                    />
                  </div>
                </SortableContext>
              ))}
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;