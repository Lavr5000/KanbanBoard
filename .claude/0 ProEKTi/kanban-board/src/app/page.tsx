"use client";
import { KanbanSquare, Search, Bell, LogOut } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { useKanbanStore } from "@/shared/store/kanbanStore";
import { ProjectSidebar } from "@/features/projects/ui/ProjectSidebar";
import { Project } from "@/shared/types/project";

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
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
  };

  return (
    <main className="flex h-screen w-full bg-[#0D1117] text-gray-300 font-sans overflow-hidden">
      {/* Dynamic Project Sidebar */}
      <ProjectSidebar onProjectSelect={handleProjectSelect} />

      {/* Main Content */}
      <section className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-[70px] border-b border-[#30363D] flex items-center justify-between px-8 shrink-0 bg-[#0D1117]">
          <div className="flex items-center gap-3">
            {currentProject && (
              <>
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentProject.color }}
                />
                <h2 className="text-2xl font-semibold text-white">
                  {currentProject.name}
                </h2>
              </>
            )}
            {!currentProject && (
              <h2 className="text-2xl font-semibold text-white">Канбан доска</h2>
            )}
          </div>
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