'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Column } from '@/entities/task/model/types';
import { MobileTaskCard } from './MobileTaskCard';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './MobileHeader';
import { TaskDetailSheet } from './TaskDetailSheet';
import { Modal } from '@/shared/ui/Modal';
import { AddTaskModal } from '@/features/task-operations/ui/AddTaskModal';
import { RoadmapPanel } from '@/features/roadmap/ui/RoadmapPanel';
import { RefreshCw } from 'lucide-react';

interface Props {
  columns: Column[];
  tasks: Task[];
  boardId: string | null;
  boardName: string;
  progressStats: { total: number; done: number; percentage: number };
  onMoveTask: (taskId: string, columnId: string, position: number) => void;
  onRefresh: () => void;
  loading?: boolean;
}

type Tab = 'board' | 'roadmap' | 'add' | 'settings';

export function MobileBoard({
  columns,
  tasks,
  boardId,
  boardName,
  progressStats,
  onMoveTask,
  onRefresh,
  loading,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('board');
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get current column
  const currentColumn = columns[activeColumnIndex];

  // Filter tasks for current column and sort by priority
  const filteredTasks = useMemo(() => {
    if (!currentColumn) return [];

    return tasks
      .filter((t) => t.columnId === currentColumn.id)
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityA = priorityOrder[a.priority] ?? 1;
        const priorityB = priorityOrder[b.priority] ?? 1;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, currentColumn]);

  // Handle task move via swipe
  const handleMoveTask = useCallback(
    (taskId: string, newColumnId: string) => {
      const targetColumnTasks = tasks.filter((t) => t.columnId === newColumnId);
      onMoveTask(taskId, newColumnId, targetColumnTasks.length);
    },
    [tasks, onMoveTask]
  );

  // Handle pull to refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handle tab change
  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  // Handle add task
  const handleAddTask = () => {
    setIsAddModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-[#121218]">
      {/* Header */}
      <MobileHeader
        boardName={boardName}
        progressStats={progressStats}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || loading}
      />

      {/* Content */}
      <main className="flex-1 overflow-hidden pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'board' && (
            <motion.div
              key="board"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col"
            >
              {/* Column tabs */}
              <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
                {columns.map((column, index) => {
                  const columnTaskCount = tasks.filter((t) => t.columnId === column.id).length;
                  return (
                    <button
                      key={String(column.id)}
                      onClick={() => setActiveColumnIndex(index)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                        index === activeColumnIndex
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-gray-800/50 text-gray-400 border border-transparent'
                      }`}
                    >
                      <span className="text-sm font-medium">{column.title}</span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          index === activeColumnIndex ? 'bg-purple-500/30' : 'bg-gray-700'
                        }`}
                      >
                        {columnTaskCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tasks list */}
              <div className="flex-1 overflow-y-auto px-4 pt-2">
                {/* Pull to refresh indicator */}
                {isRefreshing && (
                  <div className="flex justify-center py-4">
                    <RefreshCw size={20} className="text-purple-400 animate-spin" />
                  </div>
                )}

                {filteredTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <p className="text-sm">Нет задач</p>
                    <button
                      onClick={handleAddTask}
                      className="mt-2 text-purple-400 text-sm"
                    >
                      Добавить первую задачу
                    </button>
                  </div>
                ) : (
                  <motion.div layout>
                    {filteredTasks.map((task) => (
                      <MobileTaskCard
                        key={String(task.id)}
                        task={task}
                        columns={columns}
                        onMoveTask={handleMoveTask}
                        onOpenDetail={setSelectedTask}
                      />
                    ))}
                  </motion.div>
                )}

                {/* Bottom padding for safe area */}
                <div className="h-4" />
              </div>
            </motion.div>
          )}

          {activeTab === 'roadmap' && (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <RoadmapPanel boardId={boardId} isMobile />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full p-4"
            >
              <MobileSettings />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAddTask={handleAddTask}
      />

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Новая задача"
      >
        <AddTaskModal
          columnId={currentColumn ? String(currentColumn.id) : ''}
          onClose={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}

function MobileSettings() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Настройки</h2>

      <div className="bg-[#1c1c24] rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Версия приложения</span>
          <span className="text-gray-500">1.0.0</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-300">Тема</span>
          <span className="text-gray-500">Тёмная</span>
        </div>
      </div>

      <div className="text-center text-gray-500 text-xs mt-8">
        <p>Lavr Kanban AI</p>
        <p>PWA Edition</p>
      </div>
    </div>
  );
}
