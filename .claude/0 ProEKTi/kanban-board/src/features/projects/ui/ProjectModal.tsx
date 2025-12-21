import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Project, CreateProjectInput, PROJECT_COLORS } from '@/shared/types/project';
import { ColorPicker } from '@/shared/ui/ColorPicker';
import { useKanbanStore } from '@/shared/store/kanbanStore';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: CreateProjectInput) => void;
  project?: Project | null; // null for create mode
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project
}) => {
  const { deleteProject } = useKanbanStore();

  const [formData, setFormData] = useState<CreateProjectInput>({
    name: project?.name || '',
    description: project?.description || '',
    color: project?.color || PROJECT_COLORS[0]
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    onSave(formData);
  };

  const handleDelete = () => {
    if (project) {
      deleteProject(project.id);
      onClose();
    }
  };

  const isEditing = !!project;
  const isDefaultProject = project?.id === 'default-project';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isEditing ? 'Редактировать проект' : 'Создать проект'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#30363D] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Название проекта
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Введите название проекта"
              className="w-full px-3 py-2 bg-[#161B22] border border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Описание (необязательно)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Введите описание проекта"
              rows={3}
              className="w-full px-3 py-2 bg-[#161B22] border border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Color */}
          <ColorPicker
            selectedColor={formData.color as any}
            onColorSelect={(color) => setFormData({ ...formData, color })}
          />

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-2">
              {isEditing && !isDefaultProject && (
                <>
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Удалить
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">Уверены?</span>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Да
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                      >
                        Отмена
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#30363D] rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={!formData.name.trim()}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Plus size={16} />
                {isEditing ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};