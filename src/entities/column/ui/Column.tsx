"use client";

import { useState } from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Column as ColumnType, Task } from "../../task/model/types";
import { TaskCard } from "../../task/ui/TaskCard";
import { Plus } from "lucide-react";
import { Modal } from "@/shared/ui/Modal";
import { AddTaskModal } from "@/features/task-operations/ui/AddTaskModal";
import { ColumnHeader } from "./ColumnHeader";
import { clsx } from "clsx";

interface Props {
  column: ColumnType;
  tasks: Task[];
  onDeleteTrigger?: (id: Task["id"]) => void;
  boardName?: string;
  isFirst?: boolean;
  onColumnUpdate?: (columnId: string, newTitle: string) => void;
  onColumnDelete?: (columnId: string) => void;
  forceShowAITask?: string; // Task ID to force show AI suggestions for onboarding
}

export const Column = ({ column, tasks, onDeleteTrigger, boardName, isFirst = false, onColumnUpdate, onColumnDelete, forceShowAITask }: Props) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const taskIds = tasks.map((t) => t.id);
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div className="flex flex-col w-[300px] min-h-[500px]">
      <div className="flex items-center gap-2 mb-4">
        <Plus
          data-tour="add-task-btn"
          size={18}
          className="text-white/50 cursor-pointer hover:text-white border border-white/10 rounded-lg p-1 flex-shrink-0 transition-all duration-300 hover:bg-white/10 hover:border-white/30"
          onClick={() => setIsAddModalOpen(true)}
        />
        <ColumnHeader
          columnId={String(column.id)}
          title={column.title}
          isFirst={isFirst}
          onColumnUpdated={onColumnUpdate}
          onColumnDelete={onColumnDelete}
        />
      </div>

      <div
        ref={setNodeRef}
        className={clsx(
          "flex-grow flex flex-col gap-4 glass-dark rounded-xl p-4 border transition-all duration-300 glass-optimized relative",
          isOver
            ? "border-purple-500/50 drop-zone-active bg-purple-500/5"
            : "border-white/10 hover:border-white/20"
        )}
      >
        {/* Rim light effect */}
        <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"></div>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDeleteTrigger={onDeleteTrigger}
              columnTitle={column.title}
              boardName={boardName}
              allTasks={tasks}
              forceShowAI={forceShowAITask === String(task.id)}
            />
          ))}
        </SortableContext>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Новая задача"
      >
        <AddTaskModal
          columnId={String(column.id)}
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>
    </div>
  );
};
