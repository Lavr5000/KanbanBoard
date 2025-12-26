"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Column as ColumnType, Task } from "../../task/model/types";
import { TaskCard } from "../../task/ui/TaskCard";
import { Plus } from "lucide-react";
import { useBoardStore } from "../../task/model/store";

interface Props {
  column: ColumnType;
  tasks: Task[];
  onDeleteTrigger?: (id: Task["id"]) => void;
}

export const Column = ({ column, tasks, onDeleteTrigger }: Props) => {
  const addTask = useBoardStore((state) => state.addTask);
  const taskIds = tasks.map((t) => t.id);
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div className="flex flex-col w-[300px] min-h-[500px]">
      <div className="flex items-center justify-between mb-4 group">
        <div className="flex items-center gap-2">
          <Plus
            size={18}
            className="text-gray-500 cursor-pointer hover:text-white border border-gray-700 rounded p-0.5"
            onClick={() => addTask(column.id)}
          />
          <h3 className="text-gray-200 font-semibold text-sm">
            {column.title}
          </h3>
        </div>
      </div>

      <div ref={setNodeRef} className="flex-grow flex flex-col gap-4 bg-[#121218]/50 rounded-xl p-3 border-2 border-transparent transition-colors">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDeleteTrigger={onDeleteTrigger} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
