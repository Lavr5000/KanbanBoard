"use client";

import { LayoutDashboard, PieChart, Play, Download, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { useBoardStore } from "@/entities/task/model/store";
import { useBoardData } from "@/hooks/useBoardData";
import { useUIStore } from "@/entities/ui/model/store";
import { exportToJson } from "@/shared/lib/exportData";
import { useState, useMemo } from "react";
import { useAuth } from "@/providers/AuthProvider";

const navItems = [
  { icon: LayoutDashboard, label: "Канбан", id: "kanban" },
  { icon: PieChart, label: "Отчет", id: "reports" },
];

export const Sidebar = () => {
  const { columns, tasks } = useBoardData();
  const { setSearchQuery } = useUIStore();
  const [activeItem, setActiveItem] = useState("kanban");
  const { user, signOut } = useAuth();

  // Calculate stats from Supabase tasks
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => {
        const col = columns.find(c => c.id === t.column_id);
        return col?.title.toLowerCase().includes('новая') || col?.title.toLowerCase().includes('new');
      }).length,
      inProgress: tasks.filter(t => {
        const col = columns.find(c => c.id === t.column_id);
        return col?.title.toLowerCase().includes('выполняется') || col?.title.toLowerCase().includes('progress');
      }).length,
      awaitingReview: tasks.filter(t => {
        const col = columns.find(c => c.id === t.column_id);
        return col?.title.toLowerCase().includes('проверки') || col?.title.toLowerCase().includes('review');
      }).length,
      testing: tasks.filter(t => {
        const col = columns.find(c => c.id === t.column_id);
        return col?.title.toLowerCase().includes('тестировании') || col?.title.toLowerCase().includes('testing');
      }).length,
      revision: tasks.filter(t => {
        const col = columns.find(c => c.id === t.column_id);
        return col?.title.toLowerCase().includes('доработку') || col?.title.toLowerCase().includes('revision');
      }).length,
      done: tasks.filter(t => {
        const col = columns.find(c => c.id === t.column_id);
        return col?.title.toLowerCase().includes('готово') || col?.title.toLowerCase().includes('done');
      }).length,
    };
  }, [tasks, columns]);

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
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
        >
          <LogOut size={14} />
          Выйти
        </button>
      </div>

      <div className="p-4 mt-auto space-y-3">
        {user && (
          <div className="bg-[#1c1c24] p-3 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-400 mb-1">Пользователь</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
        <div className="bg-[#1c1c24] p-4 rounded-2xl border border-gray-800">
          <p className="text-xs text-gray-400 mb-2">Проект</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white font-medium truncate">
              Dashboard дизайн
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </aside>
  );
};
