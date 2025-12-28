"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../model/types";
import { Calendar, MoreVertical, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { EditTaskModal } from "@/features/task-operations/ui/EditTaskModal";

interface Props {
  task: Task;
  onDeleteTrigger?: (id: Task["id"]) => void;
}

export const TaskCard = ({ task, onDeleteTrigger }: Props) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
