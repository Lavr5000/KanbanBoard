import React, { useState } from 'react';
import { Plus, Settings, LogOut, KanbanSquare } from 'lucide-react';
import { useKanbanStore } from '@/shared/store/kanbanStore';
import { Project } from '@/shared/types/project';
import { ProjectModal } from './ProjectModal';

interface ProjectSidebarProps {
  onProjectSelect?: (project: Project) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  onProjectSelect
}) => {
  const {
    projects,
    currentProjectId,
    setCurrentProject,
    createProject,
    updateProject,
    deleteProject
  } = useKanbanStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const currentProject = projects.find(p => p.id === currentProjectId);

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project.id);
    onProjectSelect?.(project);
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleModalSave = (projectData: any) => {
    if (editingProject) {
      updateProject(editingProject.id, projectData);
    } else {
      createProject(projectData);
    }
    setIsModalOpen(false);
  };

  return (
    <aside className="w-[280px] border-r border-[#30363D] bg-[#010409] p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 text-white">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white shadow-lg">
          <KanbanSquare size={20} />
        </div>
        <div>
          <h1 className="font-bold text-xl">Kanban Pro</h1>
          <p className="text-caption text-gray-400">Task Management</p>
        </div>
      </div>

      {/* Current Project Info */}
      {currentProject && (
        <div className="mb-6 p-3 rounded-lg border border-[#30363D] bg-[#161B22]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: currentProject.color }}
            />
            <span className="text-sm font-medium text-white">
              {currentProject.name}
            </span>
          </div>
          {currentProject.description && (
            <p className="text-xs text-gray-400 line-clamp-2">
              {currentProject.description}
            </p>
          )}
          <div className="mt-2 text-xs text-gray-500">
            {currentProject.taskCount} задач
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Проекты
          </h3>
          <button
            onClick={handleCreateProject}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#30363D] transition-colors"
            title="Создать проект"
          >
            <Plus size={16} />
          </button>
        </div>

        <nav className="space-y-1">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                project.id === currentProjectId
                  ? 'bg-[#1F6FEB] text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#161B22]'
              }`}
              onClick={() => handleProjectClick(project)}
            >
              <div className="flex items-center gap-2 flex-1">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="text-sm font-medium truncate">
                  {project.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xs ${
                  project.id === currentProjectId
                    ? 'text-blue-200'
                    : 'text-gray-500'
                }`}>
                  {project.taskCount}
                </span>
                {project.id !== 'default-project' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProject(project);
                    }}
                    className={`p-1 rounded transition-colors ${
                      project.id === currentProjectId
                        ? 'hover:bg-blue-600 text-white'
                        : 'hover:bg-[#30363D] text-gray-400'
                    }`}
                    title="Настройки проекта"
                  >
                    <Settings size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-[#30363D]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 cursor-pointer hover:bg-[#161B22]">
          <LogOut size={20} />
          <span className="text-sm font-medium">Выйти</span>
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        project={editingProject}
      />
    </aside>
  );
};