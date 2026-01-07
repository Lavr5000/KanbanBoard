'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/entities/task/model/types';
import { X, Calendar, Tag, Edit2, Trash2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { Modal } from '@/shared/ui/Modal';
import { EditTaskModal } from '@/features/task-operations/ui/EditTaskModal';
import { useBoardContext } from '@/widgets/board/model/BoardContext';

interface Props {
  task: Task | null;
  onClose: () => void;
}

export function TaskDetailSheet({ task, onClose }: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { deleteTask } = useBoardContext();

  const handleDelete = async () => {
    if (task) {
      await deleteTask(String(task.id));
      onClose();
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {task && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 z-50"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#1c1c24] rounded-t-3xl z-50 max-h-[80vh] overflow-hidden"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'px-2 py-0.5 rounded text-[10px] font-bold uppercase',
                      task.priority === 'high'
                        ? 'bg-red-500/20 text-red-500'
                        : task.priority === 'medium'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-blue-500/20 text-blue-500'
                    )}
                  >
                    {task.priority === 'high' ? 'Срочно' : task.priority === 'medium' ? 'Обычно' : 'Низкий'}
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                {/* Task content */}
                <p className="text-white text-base leading-relaxed mb-4">
                  {task.content}
                </p>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                      >
                        <Tag size={10} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta info */}
                <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>
                      {new Date(task.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={handleEdit}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-500/20 text-purple-400 rounded-xl active:scale-95 transition-transform"
                  >
                    <Edit2 size={18} />
                    <span>Редактировать</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/20 text-red-400 rounded-xl active:scale-95 transition-transform"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Safe area padding */}
              <div className="h-safe-area-bottom" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {task && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Редактировать задачу"
        >
          <EditTaskModal
            task={task}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              onClose();
            }}
          />
        </Modal>
      )}
    </>
  );
}
