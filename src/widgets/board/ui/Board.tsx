"use client";

import React, { useState, useEffect } from "react";
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
import { supabaseTaskToUI, supabaseColumnToUI } from "@/lib/adapters/taskAdapter";
import { BoardContext } from "@/widgets/board/model/BoardContext";
import { Column } from "@/entities/column/ui/Column";
import { TaskCard } from "@/entities/task/ui/TaskCard";
import { Task, Id } from "@/entities/task/model/types";
import { DeleteConfirmModal } from "@/features/task-operations/ui/DeleteConfirmModal";

export const Board = () => {
  const { searchQuery } = useUIStore();
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

  // Convert Supabase data to UI format
  const columns = supabaseColumns.map(supabaseColumnToUI);
  const tasks = supabaseTasks.map(supabaseTaskToUI);

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<Id | null>(null);

  // Log tasks changes for debugging
  useEffect(() => {
    console.log('📊 Tasks updated:', tasks.map(t => ({ id: t.id, content: t.content?.substring(0, 20) || 'No content', columnId: t.columnId })));
  }, [tasks]);

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(
    (t) =>
      (t.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ?? false)
  );

  console.log('🔍 Filtered tasks:', filteredTasks.length, 'Total:', tasks.length);

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

  return (
    <BoardContext.Provider value={{ addTask, updateTask, deleteTask, moveTask }}>
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
    </BoardContext.Provider>
  );
};
