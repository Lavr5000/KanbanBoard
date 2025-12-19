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
import { Task, TaskStatus, Column } from '@/shared/types/task';

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
  const { getTasksByStatus, addTask } = useKanbanStore();
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

  // Create columns with current task data using selectors
  const columnsWithData: (Column & { tasks: Task[] })[] = columnConfig.map(column => {
    const tasks = getTasksByStatus(column.id);
    return {
      ...column,
      taskIds: tasks.map((t: Task) => t.id),
      tasks
    };
  });

  return (
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
  );
};

export default KanbanBoard;