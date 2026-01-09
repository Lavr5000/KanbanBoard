'use client';

import { useState, useMemo, useEffect } from 'react';
import { Task, Column as UIColumn } from '@/entities/task/model/types';
import { ColumnFilter } from './ColumnFilter';
import { TaskListView } from './TaskListView';
import { MobileProjectSelector } from './MobileProjectSelector';
import { Plus, Search, X, ChevronDown, Menu } from 'lucide-react';
import { useUIStore } from '@/entities/ui/model/store';
import { useMobileUIStore } from '@/entities/ui/model/mobileStore';
import { AddTaskModal } from '@/features/task-operations/ui/AddTaskModal';
import { EditTaskModal } from '@/features/task-operations/ui/EditTaskModal';
import { Modal } from '@/shared/ui/Modal';
import { DonationModal, useDonationModal } from '@/features/donation';
import { FeedbackModal, useFeedbackModal } from '@/features/feedback';
import { MobileFAB, MobileLeftDrawer, MobileRightDrawer } from '@/widgets/mobile';
import { useMobileOnboarding } from '@/features/mobile-onboarding';

interface MobileBoardProps {
  columns: UIColumn[];
  tasks: Task[];
  onMoveTask: (taskId: string, newColumnId: string, position: number) => Promise<void>;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onTasksRefetch?: () => Promise<void>;
  boardName: string;
  boardId?: string | null;
  closeRoadmapTimestamp?: number;
  loading?: boolean;
  error?: Error | null;
}

export function MobileBoard({
  columns,
  tasks,
  onMoveTask,
  onUpdateTask,
  onDeleteTask,
  onTasksRefetch,
  boardName,
  boardId,
  closeRoadmapTimestamp,
  loading,
  error,
}: MobileBoardProps) {
  const [selectedColumnId, setSelectedColumnId] = useState<string>(() => String(columns[0]?.id || ''));
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useUIStore();
  const { openLeftDrawer, openRightDrawer } = useMobileUIStore();
  const { isOpen: isDonationOpen, open: openDonation, close: closeDonation } = useDonationModal();
  const { isOpen: isFeedbackOpen, open: openFeedback, close: closeFeedback } = useFeedbackModal();
  const { startTour } = useMobileOnboarding();

  // Calculate task count per column
  const tasksCount = useMemo(() => {
    const count: Record<string, number> = {};
    columns.forEach((col) => {
      count[col.id] = tasks.filter((t) => t.columnId === col.id).length;
    });
    return count;
  }, [columns, tasks]);

  // Filter tasks by column
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => t.columnId === selectedColumnId);
  }, [tasks, selectedColumnId]);

  // Determine which column to add task to
  const getTargetColumnId = () => {
    return selectedColumnId || String(columns[0]?.id || '');
  };

  // Open add task modal
  const handleOpenAddTaskModal = () => {
    setEditingTask(null); // Clear editing task
    setIsAddTaskModalOpen(true);
  };

  // Handle board change - reload to fetch new board data
  const handleBoardChange = () => {
    window.location.reload();
  };

  // Find task by ID
  const findTaskById = (taskId: string) => {
    return tasks.find((t) => String(t.id) === taskId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121218]">
        <div className="text-white">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121218]">
        <div className="text-red-500">Ошибка: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#121218] pb-16">
      {/* Header */}
      <header className="sticky top-0 bg-[#121218]/90 backdrop-blur-sm z-20 border-b border-gray-800">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsProjectSelectorOpen(true)}
            className="flex items-center gap-2 hover:bg-gray-800/50 -ml-2 px-2 py-1 rounded-lg transition-colors"
          >
            <h1 className="text-xl font-bold text-white">{boardName}</h1>
            <ChevronDown size={18} className="text-gray-400" />
          </button>

          {/* Action buttons */}
          <button
            onClick={openLeftDrawer}
            className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors active:scale-95"
            title="Меню"
          >
            <Menu size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Поиск задач..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1c1c24] border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
            />
          </div>
        </div>
      </header>

      {/* Column Filter */}
      <ColumnFilter
        columns={columns}
        selectedColumnId={selectedColumnId}
        onSelectColumn={setSelectedColumnId}
        tasksCount={tasksCount}
      />

      {/* Task List */}
      <div className="flex-1 px-4 py-4">
        <TaskListView
          tasks={filteredTasks}
          columns={columns}
          onMoveTask={onMoveTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onEditTask={(task) => {
            // Open edit modal
            setEditingTask(task);
            setIsAddTaskModalOpen(true);
          }}
          boardName={boardName}
          allTasks={tasks}
        />
      </div>

      {/* FAB Buttons */}
      <MobileFAB
        onAddTask={handleOpenAddTaskModal}
        onOpenRoadmap={openRightDrawer}
      />

      {/* Add/Edit Task Modal */}
      <Modal
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? "Редактировать задачу" : "Новая задача"}
      >
        {editingTask ? (
          <EditTaskModal
            task={editingTask}
            isOpen={isAddTaskModalOpen}
            onClose={() => {
              setIsAddTaskModalOpen(false);
              setEditingTask(null);
            }}
          />
        ) : (
          <AddTaskModal
            columnId={getTargetColumnId()}
            onClose={() => setIsAddTaskModalOpen(false)}
          />
        )}
      </Modal>

      {/* Mobile Drawers */}
      <MobileLeftDrawer onStartOnboarding={startTour} />
      <MobileRightDrawer boardId={boardId || null} />

      {/* Project Selector Modal */}
      <MobileProjectSelector
        isOpen={isProjectSelectorOpen}
        onClose={() => setIsProjectSelectorOpen(false)}
        onBoardChange={handleBoardChange}
      />

      {/* Donation Modal */}
      <DonationModal />

      {/* Feedback Modal */}
      <FeedbackModal />
    </div>
  );
}
