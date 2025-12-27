"use client";

import { useBoardStore } from "@/entities/task/model/store";
import { useBoardContext } from "@/widgets/board/model/BoardContext";
import { uiTaskToSupabase } from "@/lib/adapters/taskAdapter";
import { Task, TaskType } from "@/entities/task/model/types";
import { useState, useEffect } from "react";
import { typeStyles } from "@/entities/task/lib/getColorByType";
import { clsx } from "clsx";

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
  const members = useBoardStore((state) => state.members);
  const [content, setContent] = useState(task.content);
  const [priority, setPriority] = useState(task.priority);
  const [type, setType] = useState<TaskType>(task.type || "feature");
  const [assigneeId, setAssigneeId] = useState<string | undefined>(task.assigneeId);

  useEffect(() => {
    setContent(task.content);
    setPriority(task.priority);
    setType(task.type || "feature");
    setAssigneeId(task.assigneeId);
  }, [task]);

  const handleSave = () => {
    // Convert UI fields to Supabase format
    // Only update fields that exist in Supabase schema
    updateTask(String(task.id), {
      title: content,
      priority: priority,
      // Note: type, assigneeId, status, tags not yet in Supabase schema
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
          className="w-full bg-[#121218] border border-gray-800 rounded-lg p-3 text-sm text-white focus:border-blue-500 outline-none h-32 resize-none"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">
          Тип задачи
        </label>
        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(typeStyles) as TaskType[]).map((t) => {
            const style = typeStyles[t];
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                  type === t
                    ? `${style.bg} ${style.color} border-current`
                    : "bg-[#121218] border-gray-800 text-gray-500 hover:border-gray-600"
                }`}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">
          Приоритет
        </label>
        <div className="flex gap-2">
          {(["low", "medium", "high"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase border transition-all ${
                priority === p
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-[#121218] border-gray-800 text-gray-500 hover:border-gray-600"
              }`}
            >
              {p === "high" ? "Срочно" : p === "medium" ? "Обычно" : "Низкий"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-2 uppercase tracking-widest font-bold">
          Исполнитель
        </label>
        <div className="flex gap-2 flex-wrap">
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setAssigneeId(assigneeId === m.id ? undefined : m.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                assigneeId === m.id
                  ? "border-blue-500 bg-blue-500/10 text-white"
                  : "border-gray-800 bg-[#121218] text-gray-400"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[6px] ${m.avatarColor}`}
              >
                {m.initials}
              </div>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all mt-4"
      >
        Сохранить изменения
      </button>
    </div>
  );
};
