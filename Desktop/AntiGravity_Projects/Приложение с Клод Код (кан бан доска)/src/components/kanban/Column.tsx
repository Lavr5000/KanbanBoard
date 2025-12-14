'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Task } from './Task';
import { TaskForm } from './TaskForm';
import { Column as ColumnType, Task as TaskType } from '@/types/kanban';
import { Plus, Trash2, X, Edit2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColumnProps {
  column: ColumnType;
  onUpdateColumn: (columnId: string, title: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddTask: (columnId: string, title: string, description: string) => void;
  onUpdateTask: (taskId: string, title: string, description: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function Column({
  column,
  onUpdateColumn,
  onDeleteColumn,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
}: ColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const handleSaveTitle = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      onUpdateColumn(column.id, editTitle.trim());
    } else {
      setEditTitle(column.title);
    }
    setIsEditingTitle(false);
  };

  const handleCancelTitle = () => {
    setEditTitle(column.title);
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      handleCancelTitle();
    }
  };

  const handleAddTask = (title: string, description: string) => {
    onAddTask(column.id, title, description);
    setIsAddingTask(false);
  };

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Column Header */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2">
        {isEditingTitle ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-2 py-1 text-sm font-semibold border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleSaveTitle}
              disabled={!editTitle.trim()}
              className="h-7 w-7 p-0"
              aria-label="Save column title"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelTitle}
              className="h-7 w-7 p-0"
              aria-label="Cancel edit"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                {column.title}
              </h2>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                {column.tasks.length}
              </span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditingTitle(true)}
                className="h-7 w-7 p-0"
                aria-label="Edit column"
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDeleteColumn(column.id)}
                className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                aria-label="Delete column"
                disabled={column.tasks.length > 0}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <div className="flex-shrink-0 px-3 pb-2">
        {!isAddingTask ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingTask(true)}
            className="w-full justify-start h-8 text-gray-600 dark:text-gray-400 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Plus className="h-3 w-3 mr-2" />
            Add task
          </Button>
        ) : (
          <Card className="p-3">
            <TaskForm
              onSubmit={handleAddTask}
              onCancel={() => setIsAddingTask(false)}
              submitButtonText="Add task"
              placeholderTitle="Task title"
              placeholderDescription="Task description (optional)"
            />
          </Card>
        )}
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 px-3 pb-3 overflow-y-auto min-h-0 transition-colors duration-200',
          isOver && 'bg-blue-50 dark:bg-blue-900/10 rounded-lg'
        )}
      >
        {column.tasks.length === 0 && !isAddingTask && (
          <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
            No tasks yet. Click &quot;Add task&quot; to create one.
          </div>
        )}

        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {column.tasks.map((task) => (
              <Task
                key={task.id}
                task={task}
                onEdit={onUpdateTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}