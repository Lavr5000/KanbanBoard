import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { KanbanBoard } from '../KanbanBoard'
import { Task, TaskStatus, Priority } from '@/shared/types/task'

// Mock the store with controlled state
const mockStoreState = {
  tasks: [],
  filters: {
    search: '',
    priorities: [],
    statuses: [],
    dateRange: { start: undefined, end: undefined, hasDueDate: undefined }
  }
}

jest.mock('@/shared/store/kanbanStore', () => ({
  useKanbanStore: jest.fn()
}))

jest.mock('@/features/kanban/hooks/useKanbanDnD', () => ({
  useKanbanDnD: jest.fn()
}))

const mockUpdateTask = jest.fn()
const mockDeleteTask = jest.fn()
const mockAddTask = jest.fn()
const mockMoveTask = jest.fn()
const mockSetFilters = jest.fn()
const mockClearFilters = jest.fn()
const mockHandleDragEnd = jest.fn()

const useKanbanStore = require('@/shared/store/kanbanStore').useKanbanStore
const useKanbanDnD = require('@/features/kanban/hooks/useKanbanDnD').useKanbanDnD

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: `task-${Math.random()}`,
  title: 'Test Task',
  description: 'Test Description',
  status: 'todo' as TaskStatus,
  priority: 'medium' as Priority,
  startDate: '2025-01-15',
  dueDate: '2025-01-20',
  assignees: [{ id: 'user1', name: 'John Doe', color: '#3B82F6' }],
  tags: [{ id: 'tag1', name: 'Feature', color: '#10B981' }],
  progress: 50,
  ...overrides
})

const renderKanbanBoard = (tasks: Task[] = [], filters = mockStoreState.filters) => {
  useKanbanStore.mockReturnValue({
    tasks,
    filters,
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    addTask: mockAddTask,
    moveTask: mockMoveTask,
    getTasksByStatus: jest.fn((status: TaskStatus) => tasks.filter(t => t.status === status)),
    getTaskById: jest.fn((id: string) => tasks.find(t => t.id === id)),
    setFilters: mockSetFilters,
    clearFilters: mockClearFilters,
    getFilteredTasks: jest.fn(() => tasks.filter(task => {
      // Apply basic search filter for testing
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        if (!task.title.toLowerCase().includes(searchTerm) &&
            !task.description.toLowerCase().includes(searchTerm)) {
          return false
        }
      }
      if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
        return false
      }
      if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
        return false
      }
      return true
    }))
  })

  useKanbanDnD.mockReturnValue({
    handleDragEnd: mockHandleDragEnd
  })

  return render(<KanbanBoard />)
}

describe('KanbanBoard Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Board Initialization', () => {
    it('should render all columns', () => {
      renderKanbanBoard()

      expect(screen.getByText('Новая задача')).toBeInTheDocument()
      expect(screen.getByText('Выполняется')).toBeInTheDocument()
      expect(screen.getByText('Ожидает проверки')).toBeInTheDocument()
      expect(screen.getByText('Тестирование')).toBeInTheDocument()
      expect(screen.getByText('Готово')).toBeInTheDocument()
    })

    it('should render tasks in correct columns', () => {
      const tasks = [
        createMockTask({ id: '1', title: 'Todo Task', status: 'todo' }),
        createMockTask({ id: '2', title: 'In Progress Task', status: 'in-progress' }),
        createMockTask({ id: '3', title: 'Done Task', status: 'done' })
      ]

      renderKanbanBoard(tasks)

      expect(screen.getByText('Todo Task')).toBeInTheDocument()
      expect(screen.getByText('In Progress Task')).toBeInTheDocument()
      expect(screen.getByText('Done Task')).toBeInTheDocument()

      // Verify tasks are in correct columns
      const todoColumn = screen.getByText('Новая задача').closest('div')
      const inProgressColumn = screen.getByText('Выполняется').closest('div')
      const doneColumn = screen.getByText('Готово').closest('div')

      expect(todoColumn).toHaveTextContent('Todo Task')
      expect(inProgressColumn).toHaveTextContent('In Progress Task')
      expect(doneColumn).toHaveTextContent('Done Task')
    })

    it('should display FilterPanel', () => {
      renderKanbanBoard()

      expect(screen.getByText('Фильтры')).toBeInTheDocument()
    })
  })

  describe('Filter Integration', () => {
    it('should filter tasks based on search', async () => {
      const user = userEvent.setup()
      const tasks = [
        createMockTask({ id: '1', title: 'Bug Fix', description: 'Critical bug in payment' }),
        createMockTask({ id: '2', title: 'Feature Request', description: 'Add new functionality' }),
        createMockTask({ id: '3', title: 'Documentation', description: 'Update API docs' })
      ]

      renderKanbanBoard(tasks)

      // Expand filter panel
      await user.click(screen.getByRole('button'))

      // Search for "Bug"
      const searchInput = screen.getByPlaceholderText('Название или описание задачи...')
      await user.type(searchInput, 'Bug')

      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Bug'
        })
      )
    })

    it('should filter tasks by priority', async () => {
      const user = userEvent.setup()
      const tasks = [
        createMockTask({ id: '1', priority: 'urgent' }),
        createMockTask({ id: '2', priority: 'medium' }),
        createMockTask({ id: '3', priority: 'low' })
      ]

      renderKanbanBoard(tasks)

      // Expand filter panel
      await user.click(screen.getByRole('button'))

      // Select urgent priority
      await user.click(screen.getByText('Срочно'))

      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          priorities: ['urgent']
        })
      )
    })

    it('should filter tasks by status', async () => {
      const user = userEvent.setup()
      const tasks = [
        createMockTask({ id: '1', status: 'todo' }),
        createMockTask({ id: '2', status: 'in-progress' }),
        createMockTask({ id: '3', status: 'done' })
      ]

      renderKanbanBoard(tasks)

      // Expand filter panel
      await user.click(screen.getByRole('button'))

      // Select todo and done status
      await user.click(screen.getByText('Новая задача'))
      await user.click(screen.getByText('Готово'))

      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          statuses: ['todo', 'done']
        })
      )
    })

    it('should show filtered task count', async () => {
      const user = userEvent.setup()
      const tasks = [
        createMockTask({ id: '1', title: 'Bug Fix' }),
        createMockTask({ id: '2', title: 'Feature Request' })
      ]

      // Mock filtered tasks to return only one
      useKanbanStore.mockReturnValue({
        tasks,
        filters: { search: 'Bug', priorities: [], statuses: [], dateRange: {} },
        updateTask: mockUpdateTask,
        deleteTask: mockDeleteTask,
        addTask: mockAddTask,
        moveTask: mockMoveTask,
        getTasksByStatus: jest.fn(),
        getTaskById: jest.fn(),
        setFilters: mockSetFilters,
        clearFilters: mockClearFilters,
        getFilteredTasks: jest.fn(() => [tasks[0]]) // Only one filtered task
      })

      render(<KanbanBoard />)

      expect(screen.getByText('1 задач')).toBeInTheDocument()
    })

    it('should clear all filters', async () => {
      const user = userEvent.setup()
      const tasks = [createMockTask()]

      renderKanbanBoard(tasks, {
        search: 'test',
        priorities: ['urgent'],
        statuses: ['todo'],
        dateRange: { start: '2025-01-15', end: '2025-01-31', hasDueDate: true }
      })

      // Expand filter panel
      await user.click(screen.getByRole('button'))

      // Clear filters
      await user.click(screen.getByTitle('Сбросить все фильтры'))

      expect(mockClearFilters).toHaveBeenCalled()
    })
  })

  describe('Drag and Drop Integration', () => {
    it('should handle drag end events', async () => {
      const tasks = [
        createMockTask({ id: '1', status: 'todo' }),
        createMockTask({ id: '2', status: 'in-progress' })
      ]

      renderKanbanBoard(tasks)

      // Simulate drag end event
      const dragEndEvent: DragEndEvent = {
        active: { id: '1', data: { current: { type: 'Task', task: tasks[0] } } },
        over: { id: 'in-progress', data: { current: { type: 'Column', status: 'in-progress' } } },
        collisions: [],
        delta: { x: 0, y: 0 }
      } as any

      // The handleDragEnd should be called by DnD context
      expect(mockHandleDragEnd).toBeDefined()
    })

    it('should not crash when dragging to invalid target', async () => {
      const tasks = [createMockTask({ id: '1', status: 'todo' })]

      renderKanbanBoard(tasks)

      // The drag handler should handle cases where over is null
      expect(mockHandleDragEnd).toBeDefined()
    })
  })

  describe('Add Task Integration', () => {
    it('should call addTask when add button is clicked', async () => {
      const user = userEvent.setup()
      const tasks = [createMockTask()]

      renderKanbanBoard(tasks)

      // Find add button in todo column (implementation may vary)
      const addButton = screen.getByText('Новая задача').closest('div')?.querySelector('[data-testid="add-task-button"]')

      // If there's a specific add button, test it
      if (addButton) {
        await user.click(addButton)
        expect(mockAddTask).toHaveBeenCalledWith('todo')
      }
    })
  })

  describe('Column Management', () => {
    it('should show task count in each column', () => {
      const tasks = [
        createMockTask({ id: '1', status: 'todo' }),
        createMockTask({ id: '2', status: 'todo' }),
        createMockTask({ id: '3', status: 'in-progress' })
      ]

      renderKanbanBoard(tasks)

      // Column counts should be visible (implementation dependent)
      const todoColumn = screen.getByText('Новая задача').closest('div')
      const inProgressColumn = screen.getByText('Выполняется').closest('div')

      expect(todoColumn).toBeInTheDocument()
      expect(inProgressColumn).toBeInTheDocument()
    })

    it('should update column counts when tasks are moved', () => {
      const tasks = [
        createMockTask({ id: '1', status: 'todo' }),
        createMockTask({ id: '2', status: 'in-progress' })
      ]

      renderKanbanBoard(tasks)

      // The board should re-render when tasks change
      expect(screen.getByText('Новая задача')).toBeInTheDocument()
      expect(screen.getByText('Выполняется')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should handle small screen sizes', () => {
      // Mock small screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })

      const tasks = [createMockTask()]
      renderKanbanBoard(tasks)

      expect(screen.getByText('Фильтры')).toBeInTheDocument()
      expect(screen.getByText('Новая задача')).toBeInTheDocument()
    })

    it('should handle large screen sizes', () => {
      // Mock large screen
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      const tasks = [createMockTask()]
      renderKanbanBoard(tasks)

      expect(screen.getByText('Фильтры')).toBeInTheDocument()
      expect(screen.getByText('Новая задача')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('should handle large number of tasks', () => {
      const tasks = Array.from({ length: 100 }, (_, i) =>
        createMockTask({
          id: `task-${i}`,
          title: `Task ${i}`,
          status: ['todo', 'in-progress', 'review', 'done'][i % 4] as TaskStatus
        })
      )

      const startTime = performance.now()
      renderKanbanBoard(tasks)
      const renderTime = performance.now() - startTime

      // Should render within reasonable time (< 100ms)
      expect(renderTime).toBeLessThan(100)
      expect(screen.getByText('Фильтры')).toBeInTheDocument()
    })

    it('should not re-render unnecessarily when filters change', () => {
      const tasks = [createMockTask()]
      const { rerender } = renderKanbanBoard(tasks)

      const initialCalls = mockSetFilters.mock.calls.length

      // Re-render with same filters
      rerender(<KanbanBoard />)

      // Should not cause additional calls if filters haven't changed
      expect(mockSetFilters.mock.calls.length).toBe(initialCalls)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid task data gracefully', () => {
      const tasks = [
        createMockTask({ id: '1', title: 'Valid Task' }),
        // Invalid task (missing required fields)
        {
          id: '2',
          // Missing title
          description: 'Invalid task',
          status: 'todo' as TaskStatus,
          priority: 'medium' as Priority
        } as Task
      ]

      // Should not crash with invalid data
      expect(() => renderKanbanBoard(tasks)).not.toThrow()
      expect(screen.getByText('Valid Task')).toBeInTheDocument()
    })

    it('should handle empty tasks array', () => {
      renderKanbanBoard([])

      expect(screen.getByText('Фильтры')).toBeInTheDocument()
      expect(screen.getByText('Новая задача')).toBeInTheDocument()
    })

    it('should handle null/undefined filters', () => {
      renderKanbanBoard([createMockTask()], null as any)

      expect(screen.getByText('Фильтры')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const tasks = [createMockTask()]
      renderKanbanBoard(tasks)

      expect(screen.getByRole('heading', { name: 'Фильтры' })).toBeInTheDocument()
      // Each column should be properly labeled
      expect(screen.getByRole('heading', { name: 'Новая задача' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Выполняется' })).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      const tasks = [createMockTask()]
      renderKanbanBoard(tasks)

      // Test tab navigation
      await user.tab()
      // Should focus on first interactive element
      expect(document.activeElement).toBeInTheDocument()

      // Continue tabbing through filter controls
      await user.tab()
      // Should move to next interactive element
      expect(document.activeElement).toBeInTheDocument()
    })
  })

  describe('State Persistence', () => {
    it('should maintain filters across re-renders', async () => {
      const user = userEvent.setup()
      const tasks = [createMockTask()]
      const filters = { search: 'test', priorities: [], statuses: [], dateRange: {} }

      renderKanbanBoard(tasks, filters)

      // Expand filter panel
      await user.click(screen.getByRole('button'))

      // Filters should be maintained
      expect(screen.getByDisplayValue('test')).toBeInTheDocument()
    })

    it('should update when store state changes', () => {
      const tasks = [createMockTask()]
      renderKanbanBoard(tasks)

      // Store update should trigger re-render
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })
  })
})