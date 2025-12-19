import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKanbanStore } from '@/shared/store/kanbanStore';
import { Task } from '@/shared/types/task';
import { GripVertical, Trash2 } from 'lucide-react';

export const KanbanCard = ({ task }: { task: Task }) => {
  const { updateTask, deleteTask } = useKanbanStore();
  const [isEditing, setIsEditing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, data: { type: 'Task', task } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const gradientClass = task.priority === 'high' ? 'from-red-500/10 to-pink-500/5' :
                        task.priority === 'medium' ? 'from-yellow-500/10 to-orange-500/5' :
                        'from-green-500/10 to-emerald-500/5';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group glass-card bg-gradient-to-br ${gradientClass} p-4 rounded-xl shadow-lg transition-all duration-200 card-entrance ${
        isDragging ? 'drag-preview' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-colors ${
            task.priority === 'high' ? 'bg-red-500' :
            task.priority === 'medium' ? 'bg-yellow-500' :
            'bg-green-500'
          }`} />
          <span className="text-[9px] text-gray-400 font-mono tracking-tighter bg-white/5 px-2 py-0.5 rounded">#{task.id.slice(0, 5)}</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/80 transition-all duration-200 hover:bg-white/10 p-1.5 rounded-lg backdrop-blur-sm"
          >
            <GripVertical size={14} />
          </div>
          <button
            onClick={() => deleteTask(task.id)}
            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all duration-200 p-1.5 rounded-lg hover:bg-red-500/20 backdrop-blur-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-2 relative z-[100]">
          <input
            autoFocus
            placeholder={task.title ? "" : "Название задачи..."}
            className="w-full bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400/50 transition-all placeholder-blue-400/50"
            value={task.title}
            onChange={(e) => updateTask(task.id, { title: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.preventDefault();
                setIsEditing(false);
              }
              if (e.key === 'Escape') setIsEditing(false);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          />
          <textarea
            placeholder={task.description ? "" : "Описание..."}
            className="w-full bg-white/5 text-white/90 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none min-h-[60px] focus:border-blue-400/30 transition-all resize-none placeholder-blue-400/50"
            value={task.description}
            onChange={(e) => updateTask(task.id, { description: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape' && !e.shiftKey) {
                e.preventDefault();
                setIsEditing(false);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          />
        </div>
      ) : (
        <div onClick={() => setIsEditing(true)} className="cursor-text">
          <h4 className="text-white font-semibold text-sm mb-1.5 leading-tight">{task.title}</h4>
          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className={`text-[9px] px-2 py-1 rounded uppercase font-bold ${
          task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
          'bg-green-500/20 text-green-300'
        }`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
};