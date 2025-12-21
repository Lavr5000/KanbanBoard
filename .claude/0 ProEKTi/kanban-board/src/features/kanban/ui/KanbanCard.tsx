import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKanbanStore } from '@/shared/store/kanbanStore';
import { Task, Priority } from '@/shared/types/task';
import { GripVertical, Trash2, Calendar, Clock } from 'lucide-react';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { AssigneeGroup } from '@/shared/ui/AssigneeAvatar';
import { DueDateIndicator } from '@/shared/ui/DueDateIndicator';
import { PriorityBadge, PrioritySelector } from '@/shared/ui/PriorityBadge';

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

  // Calculate due date status
  const getDueDateStatus = () => {
    if (!task.dueDate) return null;

    const now = new Date();
    const due = new Date(task.dueDate);
    const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return 'overdue';
    if (daysDiff === 0) return 'due-today';
    if (daysDiff <= 3) return 'due-soon';
    return 'normal';
  };

  const dueDateStatus = getDueDateStatus();

  // Subtle left border based on priority
  const priorityBorder = task.priority === 'urgent' ? 'border-l-2 border-l-red-500' :
                         task.priority === 'high' ? 'border-l-2 border-l-orange-500' :
                         task.priority === 'medium' ? 'border-l-2 border-l-yellow-500' :
                         'border-l-2 border-l-emerald-500';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group glass-card inner-glow ${priorityBorder} p-4 rounded-card card-entrance ${
        isDragging ? 'drag-preview' : ''
      }`}
    >
      {/* Top row: Priority + Actions */}
      <div className="flex items-center justify-between mb-3">
        <PriorityBadge priority={task.priority} size="xs" />

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            {...attributes}
            {...listeners}
            className="btn-ghost p-1.5 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={14} className="text-text-subtle" />
          </div>
          <button
            onClick={() => deleteTask(task.id)}
            className="btn-ghost p-1.5 rounded hover:text-error hover:bg-error/10"
          >
            <Trash2 size={14} className="text-text-subtle" />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3 relative z-[100]">
          <input
            autoFocus
            placeholder="Название задачи..."
            className="w-full bg-white/[0.03] text-text-primary border border-border-subtle rounded-button px-3 py-2 text-[14px] outline-none focus:border-accent/50 transition-colors placeholder:text-text-subtle"
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
          />
          <textarea
            placeholder="Описание..."
            className="w-full bg-white/[0.03] text-text-secondary border border-border-subtle rounded-button px-3 py-2 text-[12px] outline-none min-h-[60px] focus:border-accent/30 transition-colors resize-none placeholder:text-text-subtle"
            value={task.description}
            onChange={(e) => updateTask(task.id, { description: e.target.value })}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') {
                e.preventDefault();
                setIsEditing(false);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />

          {/* Priority and Fields Editing */}
          <div className="space-y-3 pt-3 border-t border-border-subtle">
            <div>
              <label className="text-[11px] text-text-muted block mb-1.5 font-medium">Приоритет</label>
              <PrioritySelector
                value={task.priority}
                onChange={(priority) => updateTask(task.id, { priority })}
                size="xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-text-muted block mb-1.5 font-medium">Начало</label>
                <input
                  type="date"
                  className="w-full bg-white/[0.03] text-text-primary text-[12px] border border-border-subtle rounded-button px-2 py-1.5 outline-none focus:border-accent/50 transition-colors"
                  value={task.startDate || ''}
                  onChange={(e) => updateTask(task.id, { startDate: e.target.value || undefined })}
                  onPointerDown={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <label className="text-[11px] text-text-muted block mb-1.5 font-medium">Дедлайн</label>
                <input
                  type="date"
                  className="w-full bg-white/[0.03] text-text-primary text-[12px] border border-border-subtle rounded-button px-2 py-1.5 outline-none focus:border-accent/50 transition-colors"
                  value={task.dueDate || ''}
                  onChange={(e) => updateTask(task.id, { dueDate: e.target.value || undefined })}
                  onPointerDown={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-text-muted block mb-1.5 font-medium">
                Прогресс: {task.progress || 0}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent"
                value={task.progress || 0}
                onChange={(e) => {
                  const progress = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                  updateTask(task.id, { progress });
                }}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      ) : (
        <div onClick={() => setIsEditing(true)} className="cursor-text">
          {/* Title */}
          <h4 className="text-text-primary font-medium text-[14px] mb-1 leading-snug line-clamp-2">
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-text-muted text-[12px] line-clamp-2 leading-relaxed mb-3">
              {task.description}
            </p>
          )}

          {/* Meta info */}
          <div className="space-y-2 mt-3">
            {/* Due Date */}
            {task.dueDate ? (
              <DueDateIndicator
                dueDate={task.dueDate}
                startDate={task.startDate}
                size="xs"
                showStatus={true}
                showDaysCount={true}
              />
            ) : (
              <div
                className="flex items-center gap-1.5 text-[11px] text-text-subtle hover:text-text-muted transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
              >
                <Calendar size={12} />
                <span>Добавить дату</span>
              </div>
            )}

            {/* Assignees */}
            {task.assignees && task.assignees.length > 0 && (
              <AssigneeGroup
                assignees={task.assignees}
                maxVisible={3}
                size="xs"
              />
            )}

            {/* Progress */}
            {task.progress !== undefined && task.progress > 0 ? (
              <ProgressBar
                progress={task.progress}
                size="sm"
                showLabel={true}
                color={task.progress >= 75 ? 'green' :
                       task.progress >= 50 ? 'yellow' :
                       task.progress >= 25 ? 'blue' : 'red'}
                editable={true}
                onProgressChange={(newProgress) => updateTask(task.id, { progress: newProgress })}
              />
            ) : (
              <div
                className="flex items-center gap-1.5 text-[11px] text-text-subtle hover:text-text-muted transition-colors cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  updateTask(task.id, { progress: 0 });
                  setIsEditing(true);
                }}
              >
                <Clock size={12} />
                <span>Добавить прогресс</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
