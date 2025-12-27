import { create } from 'zustand'

/**
 * UI State Store - только для UI состояния, НЕ для данных
 * Данные (tasks, columns, boards) теперь в Supabase
 */

interface UIState {
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Modal state
  isTaskModalOpen: boolean
  selectedTaskId: string | null
  openTaskModal: (taskId?: string) => void
  closeTaskModal: () => void

  // Drag preview state
  dragPreview: {
    taskId: string | null
    columnId: string | null
  }
  setDragPreview: (taskId: string | null, columnId: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Modal state
  isTaskModalOpen: false,
  selectedTaskId: null,
  openTaskModal: (taskId) =>
    set({ isTaskModalOpen: true, selectedTaskId: taskId || null }),
  closeTaskModal: () =>
    set({ isTaskModalOpen: false, selectedTaskId: null }),

  // Drag preview
  dragPreview: {
    taskId: null,
    columnId: null,
  },
  setDragPreview: (taskId, columnId) =>
    set({ dragPreview: { taskId, columnId } }),
}))
