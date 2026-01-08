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
  forceShowAI?: boolean; // For onboarding tour - force show AI suggestions
  isMobile?: boolean; // Mobile mode
}

export const TaskCard = ({
  task,
  onDeleteTrigger,
  newlyCreated = false,
  columnTitle,
  boardName,
  allTasks = [],
  forceShowAI = false,
  isMobile = false,
}: Props) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // AI suggestions hook
  const { suggestions, loading, error, visible, generateSuggestions, hideSuggestions, restoreSuggestions } = useTaskAI({ taskId: String(task.id) })

  // Force show AI for onboarding tour
  useEffect(() => {
    if (forceShowAI && !visible) {
      generateSuggestions(task.content, columnTitle || 'Демо колонка', boardName || 'Демо проект', [])
    }
  }, [forceShowAI])

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

  // Handle tap on mobile
  const handleTap = () => {
    if (isMobile) {
      setIsEditModalOpen(true)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={isMobile ? handleTap : undefined}
        onDoubleClick={!isMobile ? () => setIsEditModalOpen(true) : undefined}
        className={clsx(
          "bg-[#1c1c24] rounded-xl shadow-lg border border-transparent group transition-all",
          isMobile
            ? "p-4 active:scale-[0.98] active:bg-[#252530]"
            : "p-4 hover:border-gray-700 cursor-grab active:cursor-grabbing"
        )}
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
            {/* AI Icon (shown when suggestions exist but hidden) - with glow effect */}
            {!visible && displaySuggestions && (
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-md animate-pulse" />
                <AISuggestionIcon onRestore={restoreSuggestions} />
              </div>
            )}
          </div>
          <div className={clsx(
            "flex items-center gap-1 transition-opacity",
            isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            {/* AI Button with enhanced visibility */}
            <button
              data-tour="task-ai-icon"
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
              className={clsx(
                "relative p-1.5 rounded-lg transition-all",
                isMobile
                  ? "bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30"
                  : "text-gray-500 hover:text-purple-400 hover:bg-purple-500/10"
              )}
              title="Get AI suggestions"
            >
              {/* Glow effect for mobile */}
              {isMobile && (
                <div className="absolute inset-0 bg-purple-500/20 rounded-lg blur-sm" />
              )}
              <Sparkles size={isMobile ? 18 : 14} className="relative z-10" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTrigger?.(task.id);
              }}
              className={clsx(
                "transition-colors p-1.5 rounded-lg",
                isMobile
                  ? "text-gray-500 active:text-red-500 active:bg-red-500/10"
                  : "text-gray-500 hover:text-red-500"
              )}
            >
              <Trash2 size={isMobile ? 18 : 14} />
            </button>
            {!isMobile && (
              <button
                className="text-gray-500 hover:text-white pointer-events-none"
                onPointerDownCapture={(e) => e.stopPropagation()}
              >
                <MoreVertical size={16} />
              </button>
            )}
          </div>
        </div>

        <p className={clsx(
          "text-gray-400 mb-2 leading-relaxed",
          isMobile ? "text-sm line-clamp-4" : "text-xs line-clamp-3"
        )}>
          {task.content}
        </p>

        {/* AI Suggestions */}
        {error && (
          <div className="mt-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center gap-2 text-purple-400">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">AI анализирует...</span>
            </div>
          </div>
        )}

        {displaySuggestions && visible && (
          <div data-tour="task-ai-suggestions" className="relative">
            {/* Subtle glow border for AI suggestions */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl blur-sm" />
            <div className="relative">
              <TaskAISuggestions
                data={displaySuggestions}
                onHide={hideSuggestions}
                isSaved={!!savedSuggestions}
              />
            </div>
          </div>
        )}

        <div className={clsx(
          "flex items-center text-gray-500 gap-1.5 border-t border-gray-800 pt-3",
          isMobile && "mt-2"
        )}>
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
