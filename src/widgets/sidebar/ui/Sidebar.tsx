"use client";

import { Home, Users, LayoutDashboard, ListTodo, PieChart, Play, Download, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { useBoardStats, useBoardStore } from "@/entities/task/model/store";
import { exportToJson } from "@/shared/lib/exportData";
import { useState } from "react";
import { Modal } from "@/shared/ui/Modal";
import { TeamModal } from "@/features/team/ui/TeamModal";

const navItems = [
  { icon: Home, label: "На главную", id: "home" },
  { icon: Users, label: "Команда", id: "team" },
  { icon: LayoutDashboard, label: "Канбан", id: "kanban" },
  { icon: ListTodo, label: "Все задачи", id: "all-tasks" },
  { icon: PieChart, label: "Отчет", id: "reports" },
];

export const Sidebar = () => {
  const stats = useBoardStats();
  const { tasks, columns, clearBoard, confirmClearBoard, setSearchQuery, members, isConfirmClearOpen, setConfirmClearOpen } = useBoardStore();
  const [activeItem, setActiveItem] = useState("kanban");
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  const handleExport = () => {
    exportToJson({ tasks, columns, exportedAt: new Date().toISOString() });
  };

  const handleNavClick = (itemId: string, label: string) => {
    setActiveItem(itemId);

    // Simple navigation logic
    switch (itemId) {
      case "kanban":
        setSearchQuery(""); // Show all tasks
        break;
      case "all-tasks":
        setSearchQuery(""); // Show all tasks (same as kanban for now)
        break;
      case "home":
        // Navigation to home - Coming soon
        break;
      case "team":
        setIsTeamModalOpen(true); // Open team modal
        break;
      case "reports":
        // Show report with statistics
        const report = `
📊 ОТЧЁТ ПО ПРОЕКТУ

Общее количество задач: ${stats.total}
├─ Новые задачи: ${stats.todo}
├─ Выполняется: ${stats.inProgress}
├─ Ожидает проверки: ${stats.awaitingReview}
├─ На тестировании: ${stats.testing}
├─ В доработке: ${stats.revision}
└─ Готово: ${stats.done}

Прогресс: ${Math.round((stats.done / (stats.total || 1)) * 100)}%
        `.trim();
        alert(report);
        break;
    }
  };

  return (
    <aside className="w-64 border-r border-gray-800 flex flex-col h-screen sticky top-0 bg-[#121218]">
      <div className="p-6 mb-8 flex items-center gap-2">
        <div className="bg-white rounded-lg p-1">
          <Play className="fill-black text-black" size={20} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-white text-lg tracking-tight">Kanban</span>
          <span className="text-gray-500 text-xs font-medium">University</span>
        </div>
      </div>

      <nav className="flex-grow px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavClick(item.id, item.label)}
            className={clsx(
              "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
              activeItem === item.id
                ? "bg-[#1c1c24] text-white shadow-lg border border-gray-800"
                : "text-gray-500 hover:text-gray-300 hover:bg-[#1c1c24]/50"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon
                size={20}
                className={activeItem === item.id ? "text-blue-500" : "group-hover:text-blue-400"}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {item.label === "Канбан" && (
              <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30">
                {stats.total}
              </span>
            )}
            {item.label === "Все задачи" && (
              <span className="bg-gray-700/50 text-gray-400 text-[10px] px-2 py-0.5 rounded-full border border-gray-700">
                {stats.done}/{stats.total}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-2 border-t border-gray-800">
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <Download size={14} />
          Экспортировать данные
        </button>
        <button
          onClick={confirmClearBoard}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
        >
          <Trash2 size={14} />
          Очистить доску
        </button>
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-[#1c1c24] p-4 rounded-2xl border border-gray-800">
          <p className="text-xs text-gray-400 mb-2">Проект</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white font-medium truncate">
              Kanban Board 2.0
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title="Наша команда"
      >
        <TeamModal members={members} />
      </Modal>

      <Modal
        isOpen={isConfirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Подтверждение"
      >
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            Вы уверены, что хотите удалить <span className="font-bold text-red-500">ВСЕ задачи</span>?
            Это действие нельзя отменить.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmClearOpen(false)}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-all"
            >
              Отмена
            </button>
            <button
              onClick={clearBoard}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg transition-all"
            >
              Удалить всё
            </button>
          </div>
        </div>
      </Modal>
    </aside>
  );
};
