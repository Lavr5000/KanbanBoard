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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useKanbanStore } from '@/shared/store/kanbanStore';
import { useKanbanDnD } from '@/features/kanban/hooks/useKanbanDnD';
import { KanbanColumn } from './KanbanColumn';
import { Task, Column } from '@/shared/types/task';

export const KanbanBoard = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-text-muted text-center">
          <div className="w-8 h-8 border-2 border-border-default rounded-full animate-spin border-t-accent mx-auto mb-3"></div>
          <div className="text-[13px]">Инициализация...</div>
        </div>
      </div>
    );
  }

  return <KanbanBoardContent />;
};

const KanbanBoardContent = () => {
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

  // Column configuration - no caps in titles
  const columnConfig: Column[] = [
    { id: 'todo', title: 'Новые', taskIds: [] },
    { id: 'in-progress', title: 'В работе', taskIds: [] },
    { id: 'review', title: 'На проверке', taskIds: [] },
    { id: 'testing', title: 'Тестирование', taskIds: [] },
    { id: 'done', title: 'Готово', taskIds: [] }
  ];

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
      <div className="flex h-full gap-4 overflow-x-auto pb-4 w-full kanban-scrollbar px-2">
        <div className="flex gap-4 min-w-max">
          {columnsWithData.map((column, index) => (
            <SortableContext
              key={column.id}
              id={column.id}
              items={column.taskIds}
              strategy={verticalListSortingStrategy}
            >
              <div
                className="card-entrance group"
                style={{ animationDelay: `${index * 50}ms` }}
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
