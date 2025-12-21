import { useDroppable } from '@dnd-kit/core';
import { Task, Column } from '@/shared/types/task';
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
    <div
      ref={setNodeRef}
      data-testid={`column-${column.id}`}
      className={`w-[300px] flex-shrink-0 flex flex-col glass-column rounded-2xl h-[calc(100vh-140px)] shadow-xl overflow-hidden transition-all duration-300 ${
        isOver ? 'ring-2 ring-blue-400/60 ring-offset-2 ring-offset-transparent shadow-2xl scale-[1.02]' : ''
      }`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-white/[0.03] border-b border-white/5 backdrop-blur-sm">
        <h3 className="text-[13px] font-medium text-zinc-200 uppercase tracking-wider">{column.title}</h3>
        <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-[10px] px-2.5 py-1 rounded-full border border-blue-400/30 font-bold backdrop-blur-sm shadow-[0_0_12px_rgba(59,130,246,0.3)]">
          {count}
        </span>
      </div>

      {/* Add Button at the top */}
      <div className="px-3 pt-3">
        <button
          data-testid={`add-task-${column.id}`}
          onClick={onAddTask}
          className="w-full py-2.5 flex items-center justify-center gap-2 text-[11px] font-bold text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.08] rounded-xl transition-all border border-white/15 group backdrop-blur-sm"
        >
          <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
          ДОБАВИТЬ ЗАДАЧУ
        </button>
      </div>

      {/* Task List */}
      <div
        className={`flex-1 p-3 overflow-y-auto space-y-4 min-h-[200px] transition-all duration-300 rounded-xl mx-3 ${
          tasks.length === 0 ? 'border-2 border-white/[0.08] bg-white/[0.01]' : 'border-transparent bg-transparent'
        }`}
      >
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}

        {/* Empty state indicator */}
        {tasks.length === 0 && (
          <div className="h-full min-h-[150px] flex items-center justify-center">
            <div className={`border-2 border-solid rounded-xl p-8 text-center transition-all duration-300 flex flex-col items-center gap-4 ${
              isOver
                ? 'border-blue-400/80 bg-blue-500/20 scale-105'
                : 'border-white/15 opacity-50'
            }`}>
              <ArrowDown size={24} className={`${isOver ? 'text-blue-300 scale-110' : 'text-blue-400/70'} transition-all duration-300`} />
              <span className={`text-[10px] uppercase tracking-widest font-semibold transition-all duration-300 ${
                isOver ? 'text-blue-200' : 'text-blue-300/80'
              }`}>Перетащите сюда</span>
              <span className={`text-[8px] transition-all duration-300 ${
                isOver ? 'text-blue-300/70' : 'text-blue-400/50'
              }`}>для добавления задачи</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};