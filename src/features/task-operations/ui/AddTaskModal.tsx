"use client";

import { useBoardContext } from "@/widgets/board/model/BoardContext";
import { useState } from "react";

interface Props {
  columnId: string;
  onClose: () => void;
}

export const AddTaskModal = ({ columnId, onClose }: Props) => {
  const { addTask } = useBoardContext();
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  const handleSave = () => {
    if (!content.trim()) return; // Don't create empty tasks

    addTask(columnId, {
      title: content.trim(),
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
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Введите текст..."
          className="w-full bg-[#121218] border border-gray-800 rounded-lg p-3 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 outline-none h-32 resize-none"
          autoFocus
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
        onClick={handleSave}
        disabled={!content.trim()}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Создать задачу
      </button>
    </div>
  );
};
