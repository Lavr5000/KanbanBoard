"use client";
import { KanbanSquare, Search, Bell, LogOut, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { useKanbanStore } from "@/shared/store/kanbanStore";
import { ProjectSidebar } from "@/features/projects/ui/ProjectSidebar";
import { ProjectModal } from "@/features/projects/ui/ProjectModal";
import { Project } from "@/shared/types/project";
import { KanbanBoard } from "@/features/kanban/ui/KanbanBoard";

export default function Home() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleSaveProjectSettings = (projectData: any) => {
    // Update default project settings
    const { updateProject, projects } = useKanbanStore.getState();
    updateProject('default-project', projectData);

    // Update current project state if it's the default project
    if (currentProject?.id === 'default-project' || !currentProject) {
      const updatedProject = projects.find(p => p.id === 'default-project');
      if (updatedProject) {
        setCurrentProject(updatedProject);
      }
    }

    handleCloseSettings();
  };

  // Get default project data for modal
  const getDefaultProjectData = () => {
    if (currentProject?.id === 'default-project') {
      return currentProject;
    }

    return {
      id: 'default-project',
      name: 'Канбан доска',
      description: 'Основной проект для управления задачами',
      color: '#3b82f6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskCount: 0,
      isActive: true
    };
  };

  return (
    <>
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
                  {currentProject.id === 'default-project' && (
                    <button
                      onClick={handleOpenSettings}
                      className="p-2 hover:bg-[#30363D] rounded-lg transition-colors"
                      title="Редактировать проект"
                    >
                      <Settings className="text-gray-400 hover:text-white" size={18} />
                    </button>
                  )}
                </>
              )}
              {!currentProject && (
                <>
                  <h2 className="text-2xl font-semibold text-white">Канбан доска</h2>
                  <button
                    onClick={handleOpenSettings}
                    className="p-2 hover:bg-[#30363D] rounded-lg transition-colors"
                    title="Редактировать проект"
                  >
                    <Settings className="text-gray-400 hover:text-white" size={18} />
                  </button>
                </>
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
            {!mounted ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-gray-500 text-center">
                  <div className="w-8 h-8 border-2 border-gray-600 rounded-full animate-spin border-t-blue-400 mx-auto mb-3"></div>
                  <div>Загрузка канбан доски...</div>
                </div>
              </div>
            ) : (
              <KanbanBoard />
            )}
          </div>
        </section>
      </main>

      {/* Project Settings Modal */}
      <ProjectModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveProjectSettings}
        project={getDefaultProjectData()}
      />
    </>
  );
}