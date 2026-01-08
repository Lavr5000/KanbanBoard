'use client';

import { useState, useMemo, useEffect } from 'react';
import { Task, Column as UIColumn } from '@/entities/task/model/types';
import { ColumnFilter } from './ColumnFilter';
import { TaskListView } from './TaskListView';
import { Plus, Search, X } from 'lucide-react';
import { useUIStore } from '@/entities/ui/model/store';
import { AddTaskModal } from '@/features/task-operations/ui/AddTaskModal';
import { EditTaskModal } from '@/features/task-operations/ui/EditTaskModal';
import { Modal } from '@/shared/ui/Modal';
import { RoadmapPanel } from '@/features/roadmap/ui/RoadmapPanel';

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
  const { searchQuery, setSearchQuery } = useUIStore();

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
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">{boardName}</h1>
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

      {/* Floating Add Button */}
      <button
        data-mobile-tour="add-task-mobile"
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors z-40 active:scale-95"
        onClick={handleOpenAddTaskModal}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

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

      {/* Roadmap Panel */}
      <RoadmapPanel
        boardId={boardId || null}
        closeTimestamp={closeRoadmapTimestamp}
        onTasksCreated={onTasksRefetch}
      />
    </div>
  );
}
