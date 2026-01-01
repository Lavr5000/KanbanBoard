"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../model/types";
import { Calendar, MoreVertical, Trash2, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { useState, useEffect } from "react";
import { Modal } from "@/shared/ui/Modal";
import { EditTaskModal } from "@/features/task-operations/ui/EditTaskModal";
import { useTaskAI, TaskAISuggestions, AISuggestionIcon } from "@/features/task-ai-suggestions";
import { useAISuggestions } from "@/features/ai-suggestions/hooks/useAISuggestions";

interface Props {
  task: Task;
  onDeleteTrigger?: (id: Task["id"]) => void;
  newlyCreated?: boolean;
  columnTitle?: string;
  boardName?: string;
  allTasks?: Task[];
}

export const TaskCard = ({
  task,
  onDeleteTrigger,
  newlyCreated = false,
  columnTitle,
  boardName,
  allTasks = []
}: Props) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // AI suggestions hook
  const { suggestions, loading, error, visible, generateSuggestions, hideSuggestions, restoreSuggestions } = useTaskAI({ taskId: String(task.id) })

  // Load saved AI suggestions from database
  const { suggestions: savedSuggestions } = useAISuggestions({ taskId: String(task.id) })

  // Use saved suggestions if available, otherwise use current suggestions
  const displaySuggestions = savedSuggestions || suggestions

  // Generate AI suggestions for newly created tasks
  useEffect(() => {
    if (newlyCreated && columnTitle && boardName) {
      // Find nearby tasks (3-5 tasks around this one)
      const taskIndex = allTasks.findIndex(t => t.id === task.id)
      const nearbyTasks: Task[] = []

      // Add 2 tasks before
      for (let i = Math.max(0, taskIndex - 2); i < taskIndex; i++) {
        nearbyTasks.push(allTasks[i])
      }

      // Add 2 tasks after (excluding current task)
      for (let i = taskIndex + 1; i < Math.min(allTasks.length, taskIndex + 3); i++) {
        nearbyTasks.push(allTasks[i])
      }

      generateSuggestions(
        task.content,
        columnTitle,
        boardName,
        nearbyTasks.map(t => ({ content: t.content }))
      )
    }
  }, [newlyCreated])

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { type: "Task", task },
    });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 min-h-[150px] items-center flex border-2 border-blue-500 rounded-xl p-4 bg-[#1c1c24]"
      />
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onDoubleClick={() => setIsEditModalOpen(true)}
        className="bg-[#1c1c24] p-4 rounded-xl shadow-lg border border-transparent hover:border-gray-700 group cursor-grab active:cursor-grabbing"
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                task.priority === "high"
                  ? "bg-red-500/20 text-red-500 border border-red-500/30"
                  : task.priority === "medium"
                  ? "bg-green-500/20 text-green-500 border border-green-500/30"
                  : "bg-blue-500/20 text-blue-500 border border-blue-500/30"
              )}
            >
              {task.priority === "high" ? "Срочно" : task.priority === "medium" ? "Обычно" : "Низкий"}
            </span>
            {/* AI Icon (shown when suggestions exist but hidden) */}
            {!visible && displaySuggestions && <AISuggestionIcon onRestore={restoreSuggestions} />}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (columnTitle && boardName) {
                  const taskIndex = allTasks.findIndex(t => t.id === task.id)
                  const nearbyTasks: Task[] = []
                  for (let i = Math.max(0, taskIndex - 2); i < taskIndex; i++) {
                    nearbyTasks.push(allTasks[i])
                  }
                  for (let i = taskIndex + 1; i < Math.min(allTasks.length, taskIndex + 3); i++) {
                    nearbyTasks.push(allTasks[i])
                  }
                  generateSuggestions(task.content, columnTitle, boardName, nearbyTasks.map(t => ({ content: t.content })))
                }
              }}
              className="text-gray-500 hover:text-purple-400 transition-colors p-1"
              title="Get AI suggestions"
            >
              <Sparkles size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTrigger?.(task.id);
              }}
              className="text-gray-500 hover:text-red-500 transition-colors p-1"
            >
              <Trash2 size={14} />
            </button>
            <button
              className="text-gray-500 hover:text-white pointer-events-none"
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        <p className="text-gray-400 text-xs mb-2 line-clamp-3 leading-relaxed">
          {task.content}
        </p>

        {/* AI Suggestions */}
        {error && (
          <div className="mt-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-3 pt-3 border-t border-gray-700/50 animate-pulse">
            <div className="text-xs text-purple-400">💡 Загрузка AI-предложений...</div>
          </div>
        )}

        {displaySuggestions && visible && (
          <TaskAISuggestions
            data={displaySuggestions}
            onHide={hideSuggestions}
            isSaved={!!savedSuggestions}
          />
        )}

        <div className="flex items-center text-gray-500 gap-1.5 border-t border-gray-800 pt-3">
          <Calendar size={12} />
          <span className="text-[10px]">
            {new Date(task.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Редактировать задачу"
      >
        <EditTaskModal
          task={task}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </>
  );
};
