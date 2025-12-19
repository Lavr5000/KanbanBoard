"use client";
import { KanbanSquare, Search, Bell, LayoutGrid, Users, Settings, LogOut } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Beautiful loading component
const BoardLoader = () => (
  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0f0f17] to-[#1a1a2e]">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-white/10 rounded-full animate-spin border-t-blue-400"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-spin border-b-purple-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <div className="text-white/80 font-medium mb-2">Загрузка канбан доски</div>
      <div className="text-white/50 text-sm animate-pulse">Инициализация рабочего пространства...</div>
    </div>
  </div>
);

// Dynamic import to prevent Hydration Error
const KanbanBoard = dynamic(() => import("@/features/kanban/ui/KanbanBoard"), {
  ssr: false,
  loading: BoardLoader
});

export default function Home() {
  return (
    <main className="flex h-screen w-full bg-[#0D1117] text-gray-300 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[250px] border-r border-[#30363D] bg-[#010409] p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8 text-white font-bold text-xl px-2">
          <div className="p-1 bg-purple-600 rounded text-white"><KanbanSquare size={20}/></div>
          Kanban v.1
        </div>

        <nav className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white cursor-pointer hover:bg-[#161B22]">
                <LayoutGrid size={20} /> <span className="text-sm font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white cursor-pointer hover:bg-[#161B22]">
                <Users size={20} /> <span className="text-sm font-medium">Команда</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#1F6FEB] text-white cursor-pointer">
                <KanbanSquare size={20} /> <span className="text-sm font-medium">Канбан</span>
            </div>
             <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white cursor-pointer hover:bg-[#161B22]">
                <Settings size={20} /> <span className="text-sm font-medium">Настройки</span>
            </div>
        </nav>

        <div className="mt-auto">
             <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 cursor-pointer hover:bg-[#161B22]">
                <LogOut size={20} /> <span className="text-sm font-medium">Выйти</span>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-[70px] border-b border-[#30363D] flex items-center justify-between px-8 shrink-0 bg-[#0D1117]">
          <h2 className="text-2xl font-bold text-white">Канбан доска</h2>
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2 bg-[#161B22] border border-[#30363D] px-3 py-1.5 rounded-lg text-sm text-gray-400 min-w-[200px]">
                <Search size={16} /> <span>Поиск...</span>
            </div>
            <Bell className="text-gray-400 hover:text-white cursor-pointer" size={20} />
            <div className="w-9 h-9 rounded-full bg-blue-500 border border-[#30363D]" />
          </div>
        </header>

        {/* Board Area */}
        <div className="flex-1 p-6 overflow-hidden bg-[#0D1117] min-h-0">
           <Suspense fallback={<div className="text-gray-500 p-10">Loading Board...</div>}>
             <KanbanBoard />
           </Suspense>
        </div>
      </section>
    </main>
  );
}