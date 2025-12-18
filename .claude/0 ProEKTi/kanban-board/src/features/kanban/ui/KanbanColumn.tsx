import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Task, Column } from '@/shared/types/task';
import { useKanbanStore } from '@/shared/store/kanbanStore';
import { KanbanCard } from './KanbanCard';
import { Plus, ArrowDown } from 'lucide-react';

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
    <div className="w-[300px] flex-shrink-0 flex flex-col glass-column-enhanced rounded-2xl border h-[calc(100vh-140px)] shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-white/[0.03] border-b border-white/8 backdrop-blur-sm">
        <h3 className="text-[11px] font-black text-gray-300 uppercase tracking-widest">{column.title}</h3>
        <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-[10px] px-2.5 py-1 rounded-full border border-blue-400/30 font-bold backdrop-blur-sm shadow-[0_0_12px_rgba(59,130,246,0.3)]">
          {count}
        </span>
      </div>

      {/* Add Button at the top */}
      <div className="px-3 pt-3">
        <button
          onClick={onAddTask}
          className="w-full py-2.5 flex items-center justify-center gap-2 text-[11px] font-bold text-gray-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all border border-dashed border-white/15 group backdrop-blur-sm"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
          ДОБАВИТЬ ЗАДАЧУ
        </button>
      </div>

      {/* Task List (Droppable Area) */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto space-y-3 min-h-[200px] transition-all duration-300 border-dashed rounded-xl mx-3 ${
          tasks.length === 0 ? 'border-white/[0.08] bg-white/[0.01]' : 'border-transparent bg-transparent'
        } ${isOver ? 'drop-target-active border-blue-400/60' : ''}`}
      >
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}

        {/* Empty state indicator */}
        {tasks.length === 0 && (
          <div className="h-full min-h-[150px] flex items-center justify-center">
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-500 flex flex-col items-center gap-4 ${
              isOver
                ? 'border-blue-400/80 bg-gradient-to-br from-blue-500/10 to-purple-500/5 scale-[1.05] shadow-lg shadow-blue-500/30 pulse-glow-effect'
                : 'border-white/15 opacity-50 float-animation'
            }`}>
              <ArrowDown size={24} className="text-blue-400/70 float-animation" style={{ animationDelay: '0.5s' }} />
              <span className="text-[10px] uppercase tracking-widest text-blue-300/80 font-semibold">Перетащите сюда</span>
              <span className="text-[8px] text-blue-400/50">для добавления задачи</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};