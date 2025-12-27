"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../model/types";
import { Calendar, MoreVertical, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { EditTaskModal } from "@/features/task-operations/ui/EditTaskModal";
import { getTypeStyle } from "../lib/getColorByType";
import { useBoardStore } from "../model/store";

interface Props {
  task: Task;
  onDeleteTrigger?: (id: Task["id"]) => void;
}

export const TaskCard = ({ task, onDeleteTrigger }: Props) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const typeStyle = getTypeStyle(task.type);
  const members = useBoardStore((state) => state.members);
  const assignee = members.find((m) => m.id === task.assigneeId);
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
              "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block",
              typeStyle.bg,
              typeStyle.color
            )}
          >
            {typeStyle.label}
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

        <div className="flex items-center justify-between mb-3">
          <span
            className={clsx(
              "text-[10px] font-bold uppercase tracking-wider",
              task.priority === "high" ? "text-red-500" : "text-green-500"
            )}
          >
            • {task.status === "active" ? "Активен" : "В ожидании"}
          </span>
          <span className="text-[10px] text-gray-500">
            {task.priority === "high" ? "Срочно" : task.priority === "medium" ? "Обычно" : "Низкий"}
          </span>
        </div>

        <p className="text-gray-400 text-xs mb-4 line-clamp-3 leading-relaxed">
          {task.content}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {task.tags?.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-[#252530] text-gray-300 text-[10px] rounded-md border border-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-gray-800 pt-3">
          <div className="flex items-center text-gray-500 gap-1.5">
            <Calendar size={12} />
            <span className="text-[10px]">
              {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex -space-x-2">
            {assignee ? (
              <div className={clsx("w-6 h-6 rounded-full border-2 border-[#1c1c24] flex items-center justify-center text-[8px] text-white font-bold", assignee.avatarColor)}>
                {assignee.initials}
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center text-[8px] text-gray-500">
                ?
              </div>
            )}
          </div>
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
