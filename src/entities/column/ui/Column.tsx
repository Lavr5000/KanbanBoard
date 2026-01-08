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

interface Props {
  column: ColumnType;
  tasks: Task[];
  onDeleteTrigger?: (id: Task["id"]) => void;
  boardName?: string;
  isFirst?: boolean;
  onColumnUpdate?: (columnId: string, newTitle: string) => void;
  onColumnDelete?: (columnId: string) => void;
  forceShowAITask?: string; // Task ID to force show AI suggestions for onboarding
  isMobile?: boolean; // Mobile mode
}

export const Column = ({ column, tasks, onDeleteTrigger, boardName, isFirst = false, onColumnUpdate, onColumnDelete, forceShowAITask, isMobile = false }: Props) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const taskIds = tasks.map((t) => t.id);
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div className={`flex flex-col ${isMobile ? 'w-full h-full' : 'w-[300px] min-h-[500px]'}`}>
      {/* Hide header on mobile - it's shown in MobileBoard */}
      {!isMobile && (
        <div className="flex items-center gap-2 mb-4">
          <Plus
            data-tour="add-task-btn"
            size={18}
            className="text-gray-500 cursor-pointer hover:text-white border border-gray-700 rounded p-0.5 flex-shrink-0"
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
      )}

      <div
        ref={setNodeRef}
        className={`flex-grow flex flex-col gap-4 bg-[#121218]/50 rounded-xl p-3 border-2 border-transparent transition-colors ${
          isMobile ? 'overflow-y-auto pb-24' : ''
        }`}
      >
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
              isMobile={isMobile}
            />
          ))}
        </SortableContext>

        {/* Empty state for mobile */}
        {isMobile && tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="text-gray-600">
              <p className="text-lg mb-2">Нет задач</p>
              <p className="text-sm">Нажмите + чтобы добавить</p>
            </div>
          </div>
        )}
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
