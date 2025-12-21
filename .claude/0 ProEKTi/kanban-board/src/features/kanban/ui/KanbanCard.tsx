import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useKanbanStore } from '@/shared/store/kanbanStore';
import { Task } from '@/shared/types/task';
import { GripVertical, Trash2 } from 'lucide-react';
import { DueDateIndicator } from '@/shared/ui/DueDateIndicator';

export const KanbanCard = ({ task }: { task: Task }) => {
  const { updateTask, deleteTask, projects } = useKanbanStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const editFormRef = useRef<HTMLDivElement>(null);

  // Get project color for this task
  const projectColor = projects.find(p => p.id === task.projectId)?.color || '#3B82F6';

  // Store temporary values during editing
  const [editValues, setEditValues] = useState({
    title: task.title,
    description: task.description,
    startDate: task.startDate,
    dueDate: task.dueDate
  });

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

  // Handle editing actions
  const handleStartEdit = () => {
    setEditValues({
      title: task.title,
      description: task.description,
      startDate: task.startDate,
      dueDate: task.dueDate
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updateTask(task.id, editValues);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = async (e: React.FocusEvent) => {
    // Don't save if clicking within the edit form
    if (editFormRef.current && editFormRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    await handleSave();
  };

  const handleCancel = () => {
    setEditValues({
      title: task.title,
      description: task.description,
      startDate: task.startDate,
      dueDate: task.dueDate
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
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

  // Use project color instead of priority gradients
  const cardStyle = {
    backgroundColor: projectColor + '20', // Add transparency to project color
    borderLeft: `4px solid ${projectColor}`,
  };

  const dueDateBorderClass = dueDateStatus === 'overdue' ? 'border-r-4 border-r-red-500' :
                              dueDateStatus === 'due-today' ? 'border-r-4 border-r-orange-500' :
                              dueDateStatus === 'due-soon' ? 'border-r-2 border-r-yellow-500' :
                              'border-r-2 border-r-transparent';

  return (
    <div
      ref={setNodeRef}
      style={{...style, ...cardStyle}}
      data-testid={`kanban-card-${task.id}`}
      className={`group bg-zinc-900/50 ${dueDateBorderClass} p-4 rounded-xl shadow-lg transition-all duration-300 card-entrance hover:shadow-xl hover:scale-[1.02] ${
        isDragging ? 'drag-preview' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-1">
          <div className="opacity-40 group-hover:opacity-100 text-white/30 hover:text-white/80 transition-all duration-300 hover:bg-white/10 p-2 rounded-lg backdrop-blur-sm hover:scale-105">
            <GripVertical size={20} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteTask(task.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            data-testid="delete-button"
            aria-label="Delete task"
            className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all duration-300 p-1.5 rounded-lg hover:bg-red-500/20 backdrop-blur-sm hover:scale-105"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div
          ref={editFormRef}
          className={`space-y-2 relative z-[100] ${isSaving ? 'opacity-70' : ''}`}
          onClick={(e) => e.stopPropagation()}
          onBlur={handleBlur}
        >
          <input
            autoFocus
            placeholder={task.title ? "" : "Название задачи..."}
            className="w-full bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400/50 transition-all placeholder-blue-400/50"
            value={editValues.title}
            onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          />
          <textarea
            placeholder={task.description ? "" : "Описание..."}
            className="w-full bg-white/5 text-white/90 border border-white/10 rounded-lg px-3 py-2 text-xs outline-none min-h-[60px] focus:border-blue-400/30 transition-all resize-none placeholder-blue-400/50"
            value={editValues.description}
            onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
          />

          {/* Dates Editing */}
          <div className="space-y-2 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
            {/* Dates */}
            <div className="flex gap-2">
              <div
                className="flex-1 cursor-pointer hover:bg-white/5 p-3 rounded-lg transition-colors border border-white/10"
                onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
              >
                <label className="text-xs text-gray-400 block mb-2">Дата начала</label>
                <input
                  type="date"
                  className="w-full bg-transparent text-sm text-white outline-none cursor-pointer"
                  value={editValues.startDate || ''}
                  onChange={(e) => setEditValues({ ...editValues, startDate: e.target.value || undefined })}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div
                className="flex-1 cursor-pointer hover:bg-white/5 p-3 rounded-lg transition-colors border border-white/10"
                onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
              >
                <label className="text-xs text-gray-400 block mb-2">Дата окончания</label>
                <input
                  type="date"
                  className="w-full bg-transparent text-sm text-white outline-none cursor-pointer"
                  value={editValues.dueDate || ''}
                  onChange={(e) => setEditValues({ ...editValues, dueDate: e.target.value || undefined })}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div onClick={handleStartEdit} className="cursor-text">
          <h4 data-testid="card-title" className="text-zinc-200 font-medium text-sm mb-1.5 leading-tight">{task.title}</h4>
          {task.description && (
            <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed mb-3">
              {task.description}
            </p>
          )}

          {/* Construction Fields Display */}
          <div className="space-y-2">
            {/* Due Date */}
            <div
              className="mb-2 cursor-pointer hover:bg-white/5 p-1 rounded transition-colors"
              onClick={handleStartEdit}
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
                <div className="text-caption text-zinc-500 italic">
                  + Add due date
                </div>
              )}
            </div>

            </div>
        </div>
      )}
    </div>
  );
};