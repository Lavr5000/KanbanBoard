import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task, Column } from '@/shared/types/task';
import { KanbanCard } from './KanbanCard';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  count: number;
  onAddTask: () => void;
}

export const KanbanColumn = ({ column, tasks, count, onAddTask }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'Column', status: column.id }
  });

  return (
    <div className="w-[280px] flex-shrink-0 flex flex-col glass-column rounded-container h-[calc(100vh-140px)] overflow-hidden">
      {/* Header - no caps, subtle styling */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[13px] font-semibold text-text-secondary tracking-wide">
            {column.title}
          </h3>
          <span className="text-[11px] text-text-muted bg-white/[0.05] px-2 py-0.5 rounded-full font-medium">
            {count}
          </span>
        </div>

        {/* Ghost add button */}
        <button
          onClick={onAddTask}
          className="btn-ghost p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label="Добавить задачу"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Task List (Droppable Area) */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto column-scrollbar space-y-2.5 transition-colors duration-200 ${
          isOver ? 'bg-accent/[0.03]' : ''
        }`}
      >
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}

        {/* Minimal empty state */}
        {tasks.length === 0 && (
          <div
            className={`empty-drop-zone h-24 flex items-center justify-center transition-all duration-200 ${
              isOver ? 'active border-accent bg-accent/[0.05]' : ''
            }`}
          >
            <span className="text-[11px] text-text-subtle font-medium">
              {isOver ? 'Отпустите здесь' : 'Перетащите задачу'}
            </span>
          </div>
        )}
      </div>

      {/* Bottom add button - always visible but subtle */}
      <div className="p-3 pt-0">
        <button
          onClick={onAddTask}
          className="w-full py-2 flex items-center justify-center gap-2 text-[12px] font-medium text-text-muted hover:text-text-primary hover:bg-white/[0.03] rounded-lg transition-all border border-transparent hover:border-border-subtle group"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-200" />
          <span>Добавить</span>
        </button>
      </div>
    </div>
  );
};
