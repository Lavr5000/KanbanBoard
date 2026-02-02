"use client";

import { useBoardContext } from "@/widgets/board/model/BoardContext";
import { Task } from "@/entities/task/model/types";
import { useState, useEffect } from "react";

export const EditTaskModal = ({
  task,
  isOpen,
  onClose,
}: {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { updateTask } = useBoardContext();
  const [content, setContent] = useState(task.content);
  const [priority, setPriority] = useState(task.priority);

  useEffect(() => {
    setContent(task.content);
    setPriority(task.priority);
  }, [task]);

  const handleSave = () => {
    // Convert UI fields to Supabase format
    updateTask(String(task.id), {
      title: content,
      priority: priority,
    });
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">
          Описание задачи
        </label>
        <textarea
          data-testid="task-content-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Введите текст..."
          className="w-full bg-[#121218] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 outline-none h-32 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">
          Приоритет
        </label>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as const).map((p) => {
            const isActive = priority === p;
            const colorStyles = {
              low: isActive
                ? "bg-blue-500 border-blue-500 text-white"
                : "bg-[#121218] border-gray-800 text-blue-500 hover:border-blue-500",
              medium: isActive
                ? "bg-green-500 border-green-500 text-white"
                : "bg-[#121218] border-gray-800 text-green-500 hover:border-green-500",
              high: isActive
                ? "bg-red-500 border-red-500 text-white"
                : "bg-[#121218] border-gray-800 text-red-500 hover:border-red-500",
            };
            return (
              <button
                key={p}
                data-testid={`priority-${p}`}
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border transition-all ${colorStyles[p]}`}
              >
                {p === "high" ? "Срочно" : p === "medium" ? "Обычно" : "Низкий"}
              </button>
            );
          })}
        </div>
      </div>

      <button
        data-testid="save-task-button"
        onClick={handleSave}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all mt-4"
      >
        Сохранить изменения
      </button>
    </div>
  );
};
