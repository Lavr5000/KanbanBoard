import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@/entities/ui/model/store'

describe('UI Store (Zustand)', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUIStore.setState({
      searchQuery: '',
      priorityFilter: 'all',
      isTaskModalOpen: false,
      selectedTaskId: null,
      dragPreview: { taskId: null, columnId: null },
      selectedColumnFilter: 'all',
    })
  })

  it('has default initial state', () => {
    const state = useUIStore.getState()
    expect(state.searchQuery).toBe('')
    expect(state.priorityFilter).toBe('all')
    expect(state.isTaskModalOpen).toBe(false)
    expect(state.selectedTaskId).toBeNull()
    expect(state.dragPreview.taskId).toBeNull()
    expect(state.dragPreview.columnId).toBeNull()
    expect(state.selectedColumnFilter).toBe('all')
  })

  it('updates search query', () => {
    useUIStore.getState().setSearchQuery('test query')
    expect(useUIStore.getState().searchQuery).toBe('test query')
  })

  it('updates priority filter', () => {
    useUIStore.getState().setPriorityFilter('high')
    expect(useUIStore.getState().priorityFilter).toBe('high')
  })

  it('opens and closes task modal', () => {
    useUIStore.getState().openTaskModal('task-123')
    expect(useUIStore.getState().isTaskModalOpen).toBe(true)
    expect(useUIStore.getState().selectedTaskId).toBe('task-123')

    useUIStore.getState().closeTaskModal()
    expect(useUIStore.getState().isTaskModalOpen).toBe(false)
    expect(useUIStore.getState().selectedTaskId).toBeNull()
  })

  it('opens task modal without taskId', () => {
    useUIStore.getState().openTaskModal()
    expect(useUIStore.getState().isTaskModalOpen).toBe(true)
    expect(useUIStore.getState().selectedTaskId).toBeNull()
  })

  it('updates drag preview', () => {
    useUIStore.getState().setDragPreview('task-1', 'col-1')
    const preview = useUIStore.getState().dragPreview
    expect(preview.taskId).toBe('task-1')
    expect(preview.columnId).toBe('col-1')
  })

  it('clears drag preview', () => {
    useUIStore.getState().setDragPreview('task-1', 'col-1')
    expect(useUIStore.getState().dragPreview.taskId).toBe('task-1')

    useUIStore.getState().setDragPreview(null, null)
    expect(useUIStore.getState().dragPreview.taskId).toBeNull()
    expect(useUIStore.getState().dragPreview.columnId).toBeNull()
  })

  it('updates selected column filter', () => {
    useUIStore.getState().setSelectedColumnFilter('col-1')
    expect(useUIStore.getState().selectedColumnFilter).toBe('col-1')
  })

  it('works with React 19 concurrent features', () => {
    const initialQuery = useUIStore.getState().searchQuery

    useUIStore.getState().setSearchQuery('concurrent test')

    expect(useUIStore.getState().searchQuery).toBe('concurrent test')
    expect(useUIStore.getState().searchQuery).not.toBe(initialQuery)
  })
})
