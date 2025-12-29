"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
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
import { Bell, Search, LogOut, Filter } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export const Board = () => {
  const { searchQuery, priorityFilter, setSearchQuery, setPriorityFilter } = useUIStore();
  const { user, signOut } = useAuth();
  const { activeBoard } = useBoards();
  const boardName = activeBoard?.name || 'Проект';

  const {
    columns: supabaseColumns,
    tasks: supabaseTasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask
  } = useBoardData();

  // Convert Supabase data to UI format (memoized to prevent infinite re-renders)
  const columns = useMemo(() => supabaseColumns.map(supabaseColumnToUI), [supabaseColumns]);
  const tasks = useMemo(() => supabaseTasks.map(supabaseTaskToUI), [supabaseTasks]);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<Id | null>(null);

  // Log tasks changes for debugging
  useEffect(() => {
    console.log('📊 Tasks updated:', tasks.map(t => ({ id: t.id, content: t.content?.substring(0, 20) || 'No content', columnId: t.columnId })));
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

  console.log('🔍 Filtered tasks:', filteredTasks.length, 'Total:', tasks.length, 'Priority:', priorityFilter);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
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

      console.log('🎯 DragOver: Task over Task', {
        activeTask: activeTaskObj?.content?.substring(0, 30),
        fromColumn: activeTaskObj?.columnId,
        toColumn: overTaskObj?.columnId
      });

      if (activeTaskObj && overTaskObj && activeTaskObj.columnId !== overTaskObj.columnId) {
        // Calculate position (place at end of target column)
        const targetColumnTasks = supabaseTasks.filter((t) => t.column_id === String(overTaskObj.columnId));
        const newPosition = targetColumnTasks.length;

        console.log('✅ Moving task from', activeTaskObj.columnId, 'to', overTaskObj.columnId, 'at position', newPosition);
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

        console.log('✅ Moving task from', activeTaskObj.columnId, 'to column', overColumnId, 'at position', newPosition);
        moveTask(String(activeId), String(overColumnId), newPosition);
      }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    console.log('🏁 DragEnd:', { activeId: event.active.id, overId: event.over?.id });
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

    console.log('📊 Board.tsx: Progress stats calculated:', { total, done, percentage });

    return { total, done, percentage };
  }, [supabaseTasks, supabaseColumns]);

  // Loading state
  if (loading) {
    return (
      <div className="flex w-full items-center justify-center min-h-screen bg-[#121218]">
        <div className="text-white text-lg">Loading board data...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex w-full items-center justify-center min-h-screen bg-[#121218]">
        <div className="text-red-500 text-lg">Error loading board: {error.message}</div>
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

  return (
    <BoardContext.Provider value={{ addTask, updateTask, deleteTask, moveTask, progressStats }}>
      <div className="flex-grow flex flex-col">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-10 bg-[#121218]/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">Канбан доска</h1>
              <div className="hidden md:flex flex-col ml-4 border-l border-gray-800 pl-4">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                  Прогресс
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
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
                className="bg-[#1c1c24] border border-gray-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 w-64 transition-all"
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
        <div className="flex w-full overflow-x-auto overflow-y-hidden px-10 pt-10 gap-8 bg-[#121218] min-h-screen scrollbar-hide">
        <DndContext
          sensors={sensors}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
        <div className="flex gap-8">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.columnId === col.id);
            console.log(`📋 Column "${col.title}":`, columnTasks.length, 'tasks');
            return (
              <Column
                key={col.id}
                column={col}
                tasks={columnTasks}
                onDeleteTrigger={setDeletingTaskId}
                boardName={boardName}
              />
            );
          })}
        </div>

        {typeof document !== "undefined" &&
          createPortal(
            <DragOverlay
              dropAnimation={{
                sideEffects: defaultDropAnimationSideEffects({
                  styles: {
                    active: {
                      opacity: "0.5",
                    },
                  },
                }),
              }}
            >
              {activeTask && <TaskCard task={activeTask} />}
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
      </div>
    </BoardContext.Provider>
  );
};
