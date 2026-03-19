"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { createPortal } from "react-dom";

import { useUIStore } from "@/entities/ui/model/store";
import { useBoardData } from "@/hooks/useBoardData";
import { useBoards } from "@/hooks/useBoards";
import { supabaseTaskToUI, supabaseColumnToUI } from "@/lib/adapters/taskAdapter";
import { BoardContext } from "@/widgets/board/model/BoardContext";
import { Column } from "@/entities/column/ui/Column";
import { TaskCard } from "@/entities/task/ui/TaskCard";
import { Task, Id } from "@/entities/task/model/types";
import { DeleteConfirmModal } from "@/features/task-operations/ui/DeleteConfirmModal";
import { AddColumnButton } from "@/features/add-column/ui/AddColumnButton";
import { RoadmapPanel } from "@/features/roadmap/ui/RoadmapPanel";
import { OnboardingTour, useOnboarding } from "@/features/onboarding";
import { MobileBoard } from "@/widgets/mobile-board";
import { Bell, Search, LogOut, Filter, Calendar } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useIsMobile } from "@/shared/lib/useMediaQuery";
import { BoardBackground } from "./BoardBackground";

// Drag preview with enhanced glass and glow effect
const DragPreviewTaskCard = ({ task, isDragging = false }: { task: Task; isDragging?: boolean }) => (
  <div className={`glass-card p-4 rounded-xl relative overflow-hidden border-2 border-purple-500/50 shadow-[0_0_40px_rgba(168,85,247,0.4),0_20px_60px_rgba(0,0,0,0.5)] scale-105 ${isDragging ? "opacity-90" : ""}`}>
    {/* Inner glow effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none" />

    {/* Priority badge */}
    <div className="flex justify-between items-start mb-2 relative z-10">
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
        task.priority === "high"
          ? "bg-red-500/30 text-red-400 border border-red-500/50 glow-red"
          : task.priority === "medium"
          ? "bg-amber-500/30 text-amber-400 border border-amber-500/50"
          : "bg-blue-500/30 text-blue-400 border border-blue-500/50"
      }`}>
        {task.priority === "high" ? "Срочно" : task.priority === "medium" ? "Обычно" : "Низкий"}
      </span>
    </div>

    <p className="text-white/90 text-sm mb-2 line-clamp-3 leading-relaxed font-light relative z-10">
      {task.content}
    </p>

    <div className="flex items-center text-gray-500 gap-1.5 border-t border-gray-700/50 pt-3 relative z-10">
      <Calendar size={12} />
      <span className="text-[10px]">
        {new Date(task.createdAt).toLocaleDateString()}
      </span>
    </div>
  </div>
);

export const Board = () => {
  const { searchQuery, priorityFilter, setSearchQuery, setPriorityFilter } = useUIStore();
  const { user, signOut } = useAuth();
  const { activeBoard } = useBoards();
  const boardName = activeBoard?.name || 'Проект';
  // Mobile detection
  const isMobile = useIsMobile();

  // Desktop onboarding state
  const { shouldRunTour, setTourCompleted } = useOnboarding();
  const [runTour, setRunTour] = useState(false);
  const [demoTaskAI, setDemoTaskAI] = useState(false);
  const [forceShowAITaskId, setForceShowAITaskId] = useState<string | null>(null);
  const [closeRoadmapTimestamp, setCloseRoadmapTimestamp] = useState<number>(0);

  const {
    columns: supabaseColumns,
    tasks: supabaseTasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    refetchColumns,
  } = useBoardData();

  // Convert Supabase data to UI format (memoized to prevent infinite re-renders)
  const columns = useMemo(() => supabaseColumns.map(supabaseColumnToUI), [supabaseColumns]);
  const tasks = useMemo(() => supabaseTasks.map(supabaseTaskToUI), [supabaseTasks]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<Id | null>(null);

  // Log tasks changes for debugging
  useEffect(() => {
    // logger.log('📊 Tasks updated:', tasks.map(t => ({ id: t.id, content: t.content?.substring(0, 20) || 'No content', columnId: t.columnId })));
  }, [tasks]);

  // Filter tasks based on search query and priority (memoized)
  const filteredTasks = useMemo(() =>
    tasks.filter(
      (t) => {
        // Search filter
        const matchesSearch =
          (t.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
          (t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ?? false);

        // Priority filter
        const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

        return matchesSearch && matchesPriority;
      }
    ), [tasks, searchQuery, priorityFilter]
  );

  // logger.log('🔍 Filtered tasks:', filteredTasks.length, 'Total:', tasks.length, 'Priority:', priorityFilter);
  // logger.log('📊 Board info:', { boardId: activeBoard?.id, boardName: activeBoard?.name, columnCount: columns.length });

  // Spring physics drop animation
  const dropAnimationConfig = useMemo(() => ({
    duration: 300,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' as const, // Bouncy spring effect
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
          transform: 'scale(1.05)',
        },
      },
    }),
  }), []);

  // Sensors optimized for both mouse and touch devices
  const sensors = useSensors(
    // Mouse/pointer - slight delay before drag starts
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Increased from 5 to prevent accidental drags
      },
    }),
    // Touch - long press activation for mobile
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long press on mobile before drag starts (ms)
        tolerance: 8, // Allow 8px movement during delay
      },
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // 1. Dropping a Task over another Task - just change column, don't reorder yet
    if (isActiveATask && isOverATask) {
      const activeTaskObj = tasks.find((t) => t.id === activeId);
      const overTaskObj = tasks.find((t) => t.id === overId);

      // logger.log('🎯 DragOver: Task over Task', {
      //   activeTask: activeTaskObj?.content?.substring(0, 30),
      //   fromColumn: activeTaskObj?.columnId,
      //   toColumn: overTaskObj?.columnId
      // });

      if (activeTaskObj && overTaskObj && activeTaskObj.columnId !== overTaskObj.columnId) {
        // Calculate position (place at end of target column)
        const targetColumnTasks = supabaseTasks.filter((t) => t.column_id === String(overTaskObj.columnId));
        const newPosition = targetColumnTasks.length;

        // logger.log('✅ Moving task from', activeTaskObj.columnId, 'to', overTaskObj.columnId, 'at position', newPosition);
        moveTask(String(activeId), String(overTaskObj.columnId), newPosition);
      }
    }

    // 2. Dropping a Task over a Column
    const overColumnId = over.id;
    const activeTaskObj = tasks.find((t) => t.id === activeId);

    if (activeTaskObj && columns.some((c) => c.id === overColumnId)) {
      if (activeTaskObj.columnId !== overColumnId) {
        // Calculate position (place at end of target column)
        const targetColumnTasks = supabaseTasks.filter((t) => t.column_id === String(overColumnId));
        const newPosition = targetColumnTasks.length;

        // logger.log('✅ Moving task from', activeTaskObj.columnId, 'to column', overColumnId, 'at position', newPosition);
        moveTask(String(activeId), String(overColumnId), newPosition);
      }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    // logger.log('🏁 DragEnd:', { activeId: event.active.id, overId: event.over?.id });
    setActiveTask(null);
  };

  // Calculate progress stats - tasks NOT in "Новая задача" are considered "in progress"
  // MUST be before early returns to maintain consistent hooks order
  const progressStats = useMemo(() => {
    const inProgressTasks = supabaseTasks.filter(t => {
      const col = supabaseColumns.find(c => c.id === t.column_id);
      const isNew = col?.title.toLowerCase().includes('новая');
      return !isNew;
    });

    const total = supabaseTasks.length;
    const done = inProgressTasks.length;
    const percentage = Math.round((done / (total || 1)) * 100);

    // logger.log('📊 Board.tsx: Progress stats calculated:', { total, done, percentage });

    return { total, done, percentage };
  }, [supabaseTasks, supabaseColumns]);

  // Start onboarding tour after delay
  useEffect(() => {
    if (shouldRunTour && !loading) {
      const timer = setTimeout(() => setRunTour(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldRunTour, loading]);

  // Handle resize (disable tour on mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && runTour) {
        setRunTour(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [runTour]);

  // Tour events handler
  const handleTourCallback = (data: { action: string; step: number }) => {
    const { action, step } = data;

    // Tour completed or closed
    if (action === 'destroy' || action === 'close') {
      setDemoTaskAI(false);
      setForceShowAITaskId(null);
      setTourCompleted();
      setRunTour(false);
    }
  };

  // Close roadmap panel handler for onboarding
  const handleCloseRoadmap = () => {
    setCloseRoadmapTimestamp(Date.now());
  };

  // Step change handler for AI panel
  const handleStepChange = (stepNumber: number) => {
    // Step 4 (0-indexed: 3) - открываем AI для первой задачи
    if (stepNumber === 4 && tasks.length > 0) {
      const firstTask = tasks[0];
      if (firstTask) {
        setForceShowAITaskId(String(firstTask.id));
      }
    }
    // Закрываем после шага 5
    if (stepNumber === 6) {
      setForceShowAITaskId(null);
    }
  };

  // Loading state — only show full spinner on initial load (no data yet)
  if (loading && columns.length === 0) {
    return (
      <div className="flex w-full items-center justify-center min-h-screen bg-[#121218]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-400 text-lg">Загрузка данных доски...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex w-full items-center justify-center min-h-screen bg-[#121218]">
        <div className="text-red-500 text-lg">Ошибка загрузки: {error.message}</div>
      </div>
    );
  }

  // Helper functions for user display
  const getUserInitials = () => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) {
      const words = fullName.trim().split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return fullName.substring(0, 2).toUpperCase();
    }
    if (!user?.email) return 'U';
    const email = user.email;
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    const fullName = user?.user_metadata?.full_name;
    if (fullName) {
      return fullName.trim();
    }
    if (!user?.email) return 'User';
    const email = user.email;
    const name = email.split('@')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  // Column operations
  const handleColumnUpdate = async (columnId: string, newTitle: string) => {
    // Refetch columns to get fresh data from Supabase
    await refetchColumns();
  };

  const handleColumnDelete = async (columnId: string) => {
    if (!activeBoard) return;

    // Get first column ID
    const firstColumnId = supabaseColumns[0]?.id;
    if (!firstColumnId) {
      console.error('No columns found');
      return;
    }

    if (columnId === firstColumnId) {
      console.error('Cannot delete first column');
      return;
    }

    try {
      // Move all tasks from deleted column to first column
      const tasksInColumn = supabaseTasks.filter(t => t.column_id === columnId);

      for (const task of tasksInColumn) {
        await moveTask(task.id, firstColumnId, 0);
      }

      // Delete the column
      await fetch(`/api/columns/${columnId}`, { method: 'DELETE' });
      // logger.log('Column deleted:', columnId);

      // Refetch columns to update UI
      await refetchColumns();
    } catch (error) {
      // logger.error('Failed to delete column:', error);
    }
  };

  return (
    <BoardContext.Provider value={{ addTask, updateTask, deleteTask, moveTask, progressStats }}>
      {isMobile ? (
        <>
          <MobileBoard
            columns={columns}
            tasks={tasks}
            onMoveTask={moveTask}
            onUpdateTask={async (taskId, updates) => {
              // Convert UI Task to Supabase Task format
              const supabaseUpdates = {
                title: updates.content,
                priority: updates.priority,
              };
              await updateTask(taskId, supabaseUpdates as any);
            }}
            onDeleteTask={deleteTask}
            onTasksRefetch={refetchColumns}
            boardName={boardName}
            boardId={activeBoard?.id || null}
            closeRoadmapTimestamp={closeRoadmapTimestamp}
            loading={loading}
            error={error}
          />
        </>
      ) : (
        <>
          <OnboardingTour run={runTour} onCallback={handleTourCallback} onStepChange={handleStepChange} onCloseRoadmap={handleCloseRoadmap} />
          {/* Atmospheric background layer */}
          <BoardBackground />
      <div className="flex-grow flex flex-col relative z-10">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-4 lg:px-10 bg-[#121218]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Канбан доска</h1>
              <div className="hidden md:flex flex-col ml-4 border-l border-gray-800 pl-4">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                  Прогресс
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 lg:w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${progressStats.percentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">{progressStats.percentage}%</span>
                </div>
              </div>
            </div>
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="Поиск задач..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1c1c24] border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 w-48 lg:w-64 transition-all"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2 border-l border-gray-800 pl-6">
              <Filter size={16} className="text-gray-500" />
              <div className="flex gap-1">
                {([
                  { value: 'all', label: 'Все' },
                  { value: 'high', label: 'Срочно' },
                  { value: 'medium', label: 'Обычно' },
                  { value: 'low', label: 'Низкий' },
                ] as const).map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setPriorityFilter(filter.value)}
                    className={`px-2 py-1 text-[10px] font-medium rounded transition-all ${
                      priorityFilter === filter.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-[#1c1c24] text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-white transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-[#121218]">
                3
              </span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-white font-medium">{getDisplayName()}</p>
                <p className="text-[10px] text-gray-500">{user?.email || 'User'}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 border border-white/10 flex items-center justify-center text-white font-bold">
                {getUserInitials()}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Board Content */}
        <div className="flex w-full overflow-x-auto overflow-y-hidden px-4 lg:px-10 pt-10 gap-8 bg-[#121218] min-h-screen scrollbar-hide" data-testid="board-container">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
        <div className="flex gap-8">
          {columns.map((col, index) => {
            const columnTasks = [...filteredTasks]
              .filter((t) => t.columnId === col.id)
              .sort((a, b) => {
                // Priority order: high > medium > low
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                const priorityA = priorityOrder[a.priority] ?? 1;
                const priorityB = priorityOrder[b.priority] ?? 1;

                if (priorityA !== priorityB) {
                  return priorityA - priorityB;
                }

                // If same priority, sort by creation date (newest first)
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              });
            // logger.log(`📋 Column "${col.title}":`, columnTasks.length, 'tasks');
            return (
              <Column
                key={col.id}
                column={col}
                tasks={columnTasks}
                onDeleteTrigger={setDeletingTaskId}
                boardName={boardName}
                isFirst={index === 0}
                onColumnUpdate={handleColumnUpdate}
                onColumnDelete={handleColumnDelete}
                forceShowAITask={forceShowAITaskId || undefined}
              />
            );
          })}
          <AddColumnButton
            boardId={activeBoard?.id || ''}
            currentColumnCount={columns.length}
            maxColumns={8}
            onColumnAdded={async () => await refetchColumns()}
          />
        </div>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay dropAnimation={dropAnimationConfig}>
              {activeTask && <DragPreviewTaskCard task={activeTask} isDragging={true} />}
            </DragOverlay>,
            document.body
          )}
      </DndContext>

      <DeleteConfirmModal
        taskId={deletingTaskId}
        isOpen={deletingTaskId !== null}
        onClose={() => setDeletingTaskId(null)}
      />
      </div>

      <RoadmapPanel boardId={activeBoard?.id || null} closeTimestamp={closeRoadmapTimestamp} />
      </div>
        </>
      )}
    </BoardContext.Provider>
  );
};
