'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import { createPortal } from 'react-dom'

import { useUIStore } from '@/entities/ui/model/store'
import { useMobileUIStore } from '@/entities/ui/model/mobileStore'
import { useBoardData } from '@/hooks/useBoardData'
import { useBoards } from '@/hooks/useBoards'
import { useSwipe } from '@/hooks/useSwipe'
import { supabaseTaskToUI, supabaseColumnToUI } from '@/lib/adapters/taskAdapter'
import { BoardContext } from '@/widgets/board/model/BoardContext'
import { Column } from '@/entities/column/ui/Column'
import { TaskCard } from '@/entities/task/ui/TaskCard'
import { Task, Id } from '@/entities/task/model/types'
import { DeleteConfirmModal } from '@/features/task-operations/ui/DeleteConfirmModal'
import { MobileLayout } from '@/widgets/mobile'
import { Modal } from '@/shared/ui/Modal'
import { AddTaskModal } from '@/features/task-operations/ui/AddTaskModal'
import { hapticFeedback } from '@/shared/lib/mobile'

export const MobileBoard = () => {
  const { searchQuery, priorityFilter } = useUIStore()
  const { activeColumnIndex, setActiveColumnIndex, nextColumn, prevColumn } = useMobileUIStore()
  const { activeBoard } = useBoards()
  const boardName = activeBoard?.name || 'Проект'
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false)

  const {
    columns: supabaseColumns,
    tasks: supabaseTasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useBoardData()

  // Convert Supabase data to UI format
  const columns = useMemo(() => supabaseColumns.map(supabaseColumnToUI), [supabaseColumns])
  const tasks = useMemo(() => supabaseTasks.map(supabaseTaskToUI), [supabaseTasks])

  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<Id | null>(null)

  // Filter tasks
  const filteredTasks = useMemo(() =>
    tasks.filter((t) => {
      const matchesSearch =
        (t.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (t.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ?? false)
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter
      return matchesSearch && matchesPriority
    }), [tasks, searchQuery, priorityFilter]
  )

  // Progress stats
  const progressStats = useMemo(() => {
    const inProgressTasks = supabaseTasks.filter(t => {
      const col = supabaseColumns.find(c => c.id === t.column_id)
      const isNew = col?.title.toLowerCase().includes('новая')
      return !isNew
    })
    const total = supabaseTasks.length
    const done = inProgressTasks.length
    const percentage = Math.round((done / (total || 1)) * 100)
    return { total, done, percentage }
  }, [supabaseTasks, supabaseColumns])

  // Touch sensors for drag & drop
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

  // Swipe between columns
  const { swipeHandlers } = useSwipe({
    threshold: 80,
    onSwipeLeft: () => {
      if (activeColumnIndex < columns.length - 1) {
        hapticFeedback('light')
        nextColumn(columns.length)
      }
    },
    onSwipeRight: () => {
      if (activeColumnIndex > 0) {
        hapticFeedback('light')
        prevColumn()
      }
    },
  })

  // Scroll to active column
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const columnWidth = container.offsetWidth * 0.85 + 16 // 85% width + gap
      container.scrollTo({
        left: activeColumnIndex * columnWidth,
        behavior: 'smooth',
      })
    }
  }, [activeColumnIndex])

  // Sync scroll position with active column
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current && !activeTask) {
      const container = scrollContainerRef.current
      const columnWidth = container.offsetWidth * 0.85 + 16
      const newIndex = Math.round(container.scrollLeft / columnWidth)
      if (newIndex !== activeColumnIndex && newIndex >= 0 && newIndex < columns.length) {
        setActiveColumnIndex(newIndex)
      }
    }
  }, [activeColumnIndex, columns.length, setActiveColumnIndex, activeTask])

  // Drag handlers
  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      hapticFeedback('medium')
      setActiveTask(event.active.data.current.task)
    }
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === 'Task'
    const isOverATask = over.data.current?.type === 'Task'

    if (!isActiveATask) return

    if (isActiveATask && isOverATask) {
      const activeTaskObj = tasks.find((t) => t.id === activeId)
      const overTaskObj = tasks.find((t) => t.id === overId)

      if (activeTaskObj && overTaskObj && activeTaskObj.columnId !== overTaskObj.columnId) {
        const targetColumnTasks = supabaseTasks.filter((t) => t.column_id === String(overTaskObj.columnId))
        const newPosition = targetColumnTasks.length
        moveTask(String(activeId), String(overTaskObj.columnId), newPosition)
      }
    }

    const overColumnId = over.id
    const activeTaskObj = tasks.find((t) => t.id === activeId)

    if (activeTaskObj && columns.some((c) => c.id === overColumnId)) {
      if (activeTaskObj.columnId !== overColumnId) {
        const targetColumnTasks = supabaseTasks.filter((t) => t.column_id === String(overColumnId))
        const newPosition = targetColumnTasks.length
        moveTask(String(activeId), String(overColumnId), newPosition)
      }
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    hapticFeedback('light')
    setActiveTask(null)
  }

  // Add task handler
  const handleAddTask = useCallback(() => {
    setIsAddTaskModalOpen(true)
  }, [])

  // Loading state
  if (loading) {
    return (
      <MobileLayout
        boardId={activeBoard?.id || null}
        progressPercentage={0}
        onAddTask={handleAddTask}
      >
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-400">Загрузка...</span>
          </div>
        </div>
      </MobileLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <MobileLayout
        boardId={activeBoard?.id || null}
        progressPercentage={0}
        onAddTask={handleAddTask}
      >
        <div className="flex items-center justify-center h-full p-4">
          <div className="text-center">
            <p className="text-red-400 mb-2">Ошибка загрузки</p>
            <p className="text-gray-500 text-sm">{error.message}</p>
          </div>
        </div>
      </MobileLayout>
    )
  }

  return (
    <BoardContext.Provider value={{ addTask, updateTask, deleteTask, moveTask, progressStats }}>
      <MobileLayout
        boardId={activeBoard?.id || null}
        progressPercentage={progressStats.percentage}
        onAddTask={handleAddTask}
      >
        {/* Column Indicators */}
        <div className="flex items-center justify-center gap-2 py-3 px-4">
          {columns.map((col, index) => (
            <button
              key={col.id}
              onClick={() => {
                hapticFeedback('light')
                setActiveColumnIndex(index)
              }}
              className={`transition-all duration-300 ${
                index === activeColumnIndex
                  ? 'w-8 h-2 bg-blue-500 rounded-full'
                  : 'w-2 h-2 bg-gray-700 rounded-full hover:bg-gray-600'
              }`}
              aria-label={`Go to ${col.title}`}
            />
          ))}
        </div>

        {/* Column Title */}
        <div className="px-4 pb-2">
          <h2 className="text-lg font-bold text-white">
            {columns[activeColumnIndex]?.title || 'Колонка'}
          </h2>
          <p className="text-xs text-gray-500">
            {filteredTasks.filter(t => t.columnId === columns[activeColumnIndex]?.id).length} задач
          </p>
        </div>

        {/* Columns Container */}
        <div
          ref={scrollContainerRef}
          {...swipeHandlers}
          onScroll={handleScroll}
          className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide pb-20"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <div className="flex gap-4 px-4 h-full" style={{ minWidth: 'max-content' }}>
              {columns.map((col, index) => {
                const columnTasks = [...filteredTasks]
                  .filter((t) => t.columnId === col.id)
                  .sort((a, b) => {
                    const priorityOrder = { high: 0, medium: 1, low: 2 }
                    const priorityA = priorityOrder[a.priority] ?? 1
                    const priorityB = priorityOrder[b.priority] ?? 1
                    if (priorityA !== priorityB) return priorityA - priorityB
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  })

                return (
                  <div
                    key={col.id}
                    className="w-[85vw] flex-shrink-0 snap-center"
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    <Column
                      column={col}
                      tasks={columnTasks}
                      onDeleteTrigger={setDeletingTaskId}
                      boardName={boardName}
                      isFirst={index === 0}
                      isMobile={true}
                    />
                  </div>
                )
              })}
            </div>

            {typeof document !== 'undefined' &&
              createPortal(
                <DragOverlay
                  dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                      styles: { active: { opacity: '0.5' } },
                    }),
                  }}
                >
                  {activeTask && <TaskCard task={activeTask} />}
                </DragOverlay>,
                document.body
              )}
          </DndContext>
        </div>

        {/* Delete Confirm Modal */}
        <DeleteConfirmModal
          taskId={deletingTaskId}
          isOpen={deletingTaskId !== null}
          onClose={() => setDeletingTaskId(null)}
        />

        {/* Add Task Modal */}
        <Modal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          title="Добавить задачу"
        >
          <AddTaskModal
            columnId={columns[activeColumnIndex]?.id?.toString() || ''}
            onClose={() => setIsAddTaskModalOpen(false)}
          />
        </Modal>
      </MobileLayout>
    </BoardContext.Provider>
  )
}
