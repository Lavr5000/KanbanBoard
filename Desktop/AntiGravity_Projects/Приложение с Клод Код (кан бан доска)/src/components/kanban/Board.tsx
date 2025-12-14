'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useKanbanStore } from '@/lib/stores/kanbanStore';
import { Column } from './Column';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function Board() {
  const {
    columns,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    moveColumn,
    setDraggedTask,
    setDraggedColumn,
  } = useKanbanStore();

  const [isAddingColumn, setIsAddingColumn] = React.useState(false);
  const [newColumnTitle, setNewColumnTitle] = React.useState('');

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;

    // Check if dragging a task
    const task = columns
      .flatMap(col => col.tasks)
      .find(task => task.id === active.id);

    if (task) {
      setDraggedTask(task);
      return;
    }

    // Check if dragging a column
    const column = columns.find(col => col.id === active.id);
    if (column) {
      setDraggedColumn(column);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setDraggedTask(null);
      setDraggedColumn(null);
      return;
    }

    // Handle column reordering
    const activeColumn = columns.find(col => col.id === active.id);
    const overColumn = columns.find(col => col.id === over.id);

    if (activeColumn && overColumn && activeColumn.id !== overColumn.id) {
      const activeIndex = columns.findIndex(col => col.id === activeColumn.id);
      const overIndex = columns.findIndex(col => col.id === overColumn.id);
      moveColumn(activeColumn.id, overIndex);
    }

    setDraggedTask(null);
    setDraggedColumn(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the active task
    const activeTask = columns
      .flatMap(col => col.tasks)
      .find(task => task.id === activeId);

    if (!activeTask) return;

    // Find the column we're over
    const overColumn = columns.find(col => col.id === overId);

    if (overColumn && activeTask.columnId !== overColumn.id) {
      // Move task to new column at the end
      const targetColumn = columns.find(col => col.id === overColumn.id);
      if (targetColumn) {
        moveTask(activeTask.id, overColumn.id, targetColumn.tasks.length);
      }
    }
  };

  const columnIds = columns.map(col => col.id);

  return (
    <div className="h-full flex flex-col">
      {/* Add Column Button */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        {!isAddingColumn ? (
          <Button
            variant="outline"
            onClick={() => setIsAddingColumn(true)}
            className="h-10 text-gray-600 dark:text-gray-400 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              placeholder="Column title..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddColumn();
                if (e.key === 'Escape') {
                  setIsAddingColumn(false);
                  setNewColumnTitle('');
                }
              }}
              className="flex-1"
              autoFocus
            />
            <Button onClick={handleAddColumn} disabled={!newColumnTitle.trim()}>
              Add
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingColumn(false);
                setNewColumnTitle('');
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Board Content */}
      <div className="flex-1 p-4 overflow-x-auto">
        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
            <div className="flex gap-4 h-full min-w-max">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="flex-shrink-0 w-80 h-full"
                >
                  <Column
                    column={column}
                    onUpdateColumn={updateColumn}
                    onDeleteColumn={deleteColumn}
                    onAddTask={addTask}
                    onUpdateTask={(taskId, title, description) => updateTask(taskId, { title, description })}
                    onDeleteTask={deleteTask}
                  />
                </div>
              ))}

              {/* Add Column Placeholder */}
              {columns.length === 0 && (
                <div className="flex-shrink-0 w-80 h-full flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No columns yet. Create your first column to get started!
                    </p>
                    <Button
                      onClick={() => setIsAddingColumn(true)}
                      variant="outline"
                      className="border-dashed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Column
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}