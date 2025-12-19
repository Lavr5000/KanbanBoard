import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKanbanStore } from '@/shared/store/kanbanStore';
import { Task, Priority } from '@/shared/types/task';
import { GripVertical, Trash2 } from 'lucide-react';
import { ProgressBar } from '@/shared/ui/ProgressBar';
import { AssigneeGroup } from '@/shared/ui/AssigneeAvatar';
import { CompactDateRange } from '@/shared/ui/DateRange';
import { DueDateIndicator, CompactDueDate } from '@/shared/ui/DueDateIndicator';
import { PriorityBadge, PrioritySelector } from '@/shared/ui/PriorityBadge';
import { TagGroup, TagSelector } from '@/shared/ui/TagSystem';

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

  const gradientClass = task.priority === 'urgent' ? 'from-red-600/20 to-red-400/5' :
                        task.priority === 'high' ? 'from-red-500/10 to-pink-500/5' :
                        task.priority === 'medium' ? 'from-yellow-500/10 to-orange-500/5' :
                        'from-green-500/10 to-emerald-500/5';

  const dueDateBorderClass = dueDateStatus === 'overdue' ? 'border-l-4 border-l-red-500' :
                              dueDateStatus === 'due-today' ? 'border-l-4 border-l-orange-500' :
                              dueDateStatus === 'due-soon' ? 'border-l-2 border-l-yellow-500' :
                              'border-l-2 border-l-transparent';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group glass-card bg-gradient-to-br ${gradientClass} ${dueDateBorderClass} p-4 rounded-xl shadow-lg transition-all duration-200 card-entrance ${
        isDragging ? 'drag-preview' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} size="xs" />
        </div>
        <div className="flex items-center gap-1">
          <div
            {...attributes}
            {...listeners}
            className="opacity-40 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-white/30 hover:text-white/80 transition-all duration-200 hover:bg-white/10 p-2 rounded-lg backdrop-blur-sm"
          >
            <GripVertical size={20} />
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

          {/* Priority and Construction Fields Editing */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            {/* Priority */}
            <div>
              <label className="text-[9px] text-gray-400 block mb-1">Priority</label>
              <PrioritySelector
                value={task.priority}
                onChange={(priority) => updateTask(task.id, { priority })}
                size="xs"
              />
            </div>

            {/* Dates */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[9px] text-gray-400 block mb-1">Start Date</label>
                <input
                  type="date"
                  className="w-full bg-white/5 text-white text-xs border border-white/10 rounded px-2 py-1 outline-none focus:border-blue-400/50 transition-all"
                  value={task.startDate || ''}
                  onChange={(e) => updateTask(task.id, { startDate: e.target.value || undefined })}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex-1">
                <label className="text-[9px] text-gray-400 block mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full bg-white/5 text-white text-xs border border-white/10 rounded px-2 py-1 outline-none focus:border-blue-400/50 transition-all"
                  value={task.dueDate || ''}
                  onChange={(e) => updateTask(task.id, { dueDate: e.target.value || undefined })}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Tags */}
            <div onPointerDown={(e) => e.stopPropagation()}>
              <label className="text-[9px] text-gray-400 block mb-1">Tags</label>
              <TagSelector
                selectedTags={task.tags || []}
                onTagsChange={(tags) => updateTask(task.id, { tags })}
                size="xs"
              />
            </div>

            {/* Progress */}
            <div>
              <label className="text-[9px] text-gray-400 block mb-1">
                Progress: {task.progress || 0}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                value={task.progress || 0}
                onChange={(e) => {
                  const progress = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                  updateTask(task.id, { progress });
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      ) : (
        <div onClick={() => setIsEditing(true)} className="cursor-text">
          <h4 className="text-white font-semibold text-sm mb-1.5 leading-tight">{task.title}</h4>
          {task.description && (
            <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-3">
              {task.description}
            </p>
          )}

          {/* Construction Fields Display */}
          <div className="space-y-2">
            {/* Due Date */}
            <div
              className="mb-2 cursor-pointer hover:bg-white/5 p-1 rounded transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {task.dueDate ? (
                <DueDateIndicator
                  dueDate={task.dueDate}
                  startDate={task.startDate}
                  size="xs"
                  showStatus={true}
                  showDaysCount={true}
                />
              ) : (
                <div className="text-[9px] text-gray-500 italic">
                  + Add due date
                </div>
              )}
            </div>

            {/* Assignees */}
            {task.assignees && task.assignees.length > 0 && (
              <div className="mb-2">
                <AssigneeGroup
                  assignees={task.assignees}
                  maxVisible={3}
                  size="xs"
                />
              </div>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="mb-2">
                <TagGroup
                  tags={task.tags}
                  maxVisible={4}
                  size="xs"
                  onTagClick={(tag) => console.log('Tag clicked:', tag)}
                />
              </div>
            )}
            {!task.tags || task.tags.length === 0 ? (
              <div
                className="text-[9px] text-gray-500 italic mb-2 p-1 cursor-pointer hover:bg-white/5 rounded transition-colors"
                onClick={() => setIsEditing(true)}
              >
                + Add tags
              </div>
            ) : null}

            {/* Progress */}
            {task.progress !== undefined ? (
              <ProgressBar
                progress={task.progress}
                size="sm"
                showLabel={task.progress > 0}
                color={task.progress >= 75 ? 'green' :
                       task.progress >= 50 ? 'yellow' :
                       task.progress >= 25 ? 'blue' : 'red'}
                editable={true}
                onProgressChange={(newProgress) => updateTask(task.id, { progress: newProgress })}
              />
            ) : (
              <div
                className="text-[9px] text-gray-500 italic p-1 cursor-pointer hover:bg-white/5 rounded transition-colors"
                onClick={() => {
                  updateTask(task.id, { progress: 0 });
                }}
              >
                + Add progress
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <PriorityBadge priority={task.priority} size="xs" showLabel={true} />
      </div>
    </div>
  );
};