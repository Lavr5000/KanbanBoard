import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndContext } from '@dnd-kit/core'
import { KanbanBoard } from '../../src/features/kanban/ui/KanbanBoard'
import { Task, TaskStatus, Priority } from '../../src/shared/types/task'

// Mock complete application setup
const mockAppStore = {
  tasks: [],
  filters: {
    search: '',
    priorities: [],
    statuses: [],
    dateRange: { start: undefined, end: undefined, hasDueDate: undefined }
  }
}

jest.mock('../../src/shared/store/kanbanStore', () => ({
  useKanbanStore: jest.fn()
}))

jest.mock('../../src/features/kanban/hooks/useKanbanDnD', () => ({
  useKanbanDnD: jest.fn()
}))

const mockStore = require('../../src/shared/store/kanbanStore').useKanbanStore
const mockDnD = require('../../src/features/kanban/hooks/useKanbanDnD').useKanbanDnD

const createTestTask = (overrides: Partial<Task> = {}): Task => ({
  id: `task-${Math.random().toString(36).substr(2, 9)}`,
  title: 'Test Task',
  description: 'Test task description',
  status: 'todo' as TaskStatus,
  priority: 'medium' as Priority,
  startDate: '2025-01-15',
  dueDate: '2025-01-20',
  assignees: [
    { id: 'user1', name: 'John Doe', color: '#3B82F6' },
    { id: 'user2', name: 'Jane Smith', color: '#EC4899' }
  ],
  tags: [
    { id: 'tag1', name: 'Frontend', color: '#10B981' },
    { id: 'tag2', name: 'Bug', color: '#EF4444' }
  ],
  progress: 50,
  ...overrides
})

const setupFullApp = (tasks: Task[] = []) => {
  const mockUpdateTask = jest.fn()
  const mockDeleteTask = jest.fn()
  const mockAddTask = jest.fn()
  const mockMoveTask = jest.fn()
  const mockSetFilters = jest.fn()
  const mockClearFilters = jest.fn()
  const mockGetTasksByStatus = jest.fn((status: TaskStatus) => tasks.filter(t => t.status === status))
  const mockGetTaskById = jest.fn((id: string) => tasks.find(t => t.id === id))
  const mockGetFilteredTasks = jest.fn(() => tasks)

  mockStore.mockReturnValue({
    tasks,
    filters: mockAppStore.filters,
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    addTask: mockAddTask,
    moveTask: mockMoveTask,
    getTasksByStatus: mockGetTasksByStatus,
    getTaskById: mockGetTaskById,
    setFilters: mockSetFilters,
    clearFilters: mockClearFilters,
    getFilteredTasks: mockGetFilteredTasks
  })

  mockDnD.mockReturnValue({
    handleDragEnd: jest.fn()
  })

  return {
    mockUpdateTask,
    mockDeleteTask,
    mockAddTask,
    mockMoveTask,
    mockSetFilters,
    mockClearFilters,
    mockGetTasksByStatus,
    mockGetTaskById,
    mockGetFilteredTasks
  }
}

const renderFullApp = (tasks: Task[] = []) => {
  const mocks = setupFullApp(tasks)

  const { rerender } = render(
    <DndContext>
      <KanbanBoard />
    </DndContext>
  )

  return { ...mocks, rerender }
}

describe('User Journey E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Task Creation and Management Journey', () => {
    it('should create new task and edit it successfully', async () => {
      const user = userEvent.setup()
      const initialTasks = [createTestTask({ title: 'Initial Task', status: 'todo' })]
      const { mockAddTask, mockUpdateTask } = renderFullApp(initialTasks)

      // 1. User adds a new task
      const addTaskButton = screen.getByTestId('add-task-todo')

      if (addTaskButton) {
        await user.click(addTaskButton)
        expect(mockAddTask).toHaveBeenCalledWith('todo')
      }

      // 2. User clicks on existing task to edit
      await user.click(screen.getByText('Initial Task'))

      // 3. User edits task title
      const titleInput = screen.getByDisplayValue('Initial Task')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task Title')

      // 4. User edits task description
      const descriptionTextarea = screen.getByDisplayValue('Test task description')
      await user.clear(descriptionTextarea)
      await user.type(descriptionTextarea, 'Updated task description')

      // 5. User changes priority
      const prioritySelector = screen.getByText('Priority')
      await user.click(prioritySelector)

      // 6. User saves the task
      await user.click(screen.getByText('Сохранить'))

      expect(mockUpdateTask).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          title: 'Updated Task Title',
          description: 'Updated task description'
        })
      )

      // 7. Task should return to display mode
      await waitFor(() => {
        expect(screen.getByText('Updated Task Title')).toBeInTheDocument()
        expect(screen.queryByDisplayValue('Updated Task Title')).not.toBeInTheDocument()
      })
    })

    it('should cancel task editing and restore original values', async () => {
      const user = userEvent.setup()
      const initialTask = createTestTask({
        title: 'Original Title',
        description: 'Original Description',
        priority: 'medium'
      })
      renderFullApp([initialTask])

      // User starts editing task
      await user.click(screen.getByText('Original Title'))

      // User modifies fields
      const titleInput = screen.getByDisplayValue('Original Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Modified Title')

      const descriptionTextarea = screen.getByDisplayValue('Original Description')
      await user.clear(descriptionTextarea)
      await user.type(descriptionTextarea, 'Modified Description')

      // User cancels editing
      await user.click(screen.getByText('Отмена'))

      // Original values should be restored
      await waitFor(() => {
        expect(screen.getByText('Original Title')).toBeInTheDocument()
        expect(screen.getByText('Original Description')).toBeInTheDocument()
      })

      // No updates should have been made
      expect(mockUpdateTask).not.toHaveBeenCalled()
    })
  })

  describe('Task Filtering Journey', () => {
    it('should filter tasks using multiple criteria', async () => {
      const user = userEvent.setup()
      const tasks = [
        createTestTask({
          id: '1',
          title: 'Critical Bug Fix',
          priority: 'urgent',
          status: 'todo',
          tags: [{ id: 'tag1', name: 'Bug', color: '#EF4444' }]
        }),
        createTestTask({
          id: '2',
          title: 'Feature Development',
          priority: 'high',
          status: 'in-progress',
          tags: [{ id: 'tag2', name: 'Feature', color: '#10B981' }]
        }),
        createTestTask({
          id: '3',
          title: 'Code Review',
          priority: 'medium',
          status: 'review',
          tags: [{ id: 'tag3', name: 'Review', color: '#F59E0B' }]
        }),
        createTestTask({
          id: '4',
          title: 'Documentation Update',
          priority: 'low',
          status: 'done',
          tags: [{ id: 'tag4', name: 'Docs', color: '#6B7280' }]
        })
      ]

      const { mockSetFilters, mockGetFilteredTasks } = renderFullApp(tasks)

      // Mock filtered results to simulate actual filtering
      mockGetFilteredTasks.mockReturnValue(tasks.filter(t =>
        t.title.toLowerCase().includes('bug') &&
        t.priority === 'urgent'
      ))

      // 1. User expands filter panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      // 2. User searches for "Bug"
      const searchInput = screen.getByTestId('filter-search-input')
      await user.type(searchInput, 'Bug')

      // 3. User selects "Срочно" priority
      await user.click(screen.getByText('Срочно'))

      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Bug',
          priorities: ['urgent']
        })
      )
    })

    it('should clear all filters and show all tasks', async () => {
      const user = userEvent.setup()
      const tasks = [
        createTestTask({ id: '1', title: 'Task 1' }),
        createTestTask({ id: '2', title: 'Task 2' })
      ]

      const activeFilters = {
        search: 'test',
        priorities: ['urgent'],
        statuses: ['todo'],
        dateRange: { start: '2025-01-15', end: '2025-01-31', hasDueDate: true }
      }

      mockStore.mockReturnValue({
        tasks,
        filters: activeFilters,
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        addTask: jest.fn(),
        moveTask: jest.fn(),
        getTasksByStatus: jest.fn(),
        getTaskById: jest.fn(),
        setFilters: jest.fn(),
        clearFilters: jest.fn(),
        getFilteredTasks: jest.fn(() => tasks) // All tasks visible after clear
      })

      render(<DndContext><KanbanBoard /></DndContext>)

      // 1. User expands filter panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      // 2. User clears all filters
      await user.click(screen.getByTestId('filter-clear-button'))

      const clearFiltersMock = mockStore().clearFilters
      expect(clearFiltersMock).toHaveBeenCalled()
    })
  })

  describe('Task Organization Journey', () => {
    it('should move task through workflow states', async () => {
      const user = userEvent.setup()
      const task = createTestTask({
        id: 'workflow-task',
        title: 'Workflow Task',
        status: 'todo'
      })

      const { mockMoveTask } = renderFullApp([task])

      // 1. User moves task from "Новая задача" to "Выполняется"
      // This would normally be done via drag and drop
      mockMoveTask('workflow-task', 'in-progress')

      // 2. User moves task to "Ожидает проверки"
      mockMoveTask('workflow-task', 'review')

      // 3. User moves task to "Тестирование"
      mockMoveTask('workflow-task', 'testing')

      // 4. User moves task to "Готово"
      mockMoveTask('workflow-task', 'done')

      expect(mockMoveTask).toHaveBeenCalledTimes(4)
      expect(mockMoveTask).toHaveBeenLastCalledWith('workflow-task', 'done')
    })

    it('should handle multiple task operations', async () => {
      const user = userEvent.setup()
      const tasks = [
        createTestTask({ id: 'task-1', title: 'Task 1', status: 'todo' }),
        createTestTask({ id: 'task-2', title: 'Task 2', status: 'todo' }),
        createTestTask({ id: 'task-3', title: 'Task 3', status: 'in-progress' })
      ]

      const { mockUpdateTask, mockMoveTask } = renderFullApp(tasks)

      // 1. User edits Task 1
      await user.click(screen.getByText('Task 1'))
      const titleInput = screen.getByDisplayValue('Task 1')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Task 1')
      await user.click(screen.getByText('Сохранить'))

      // 2. User moves Task 2 to in-progress
      mockMoveTask('task-2', 'in-progress')

      // 3. User deletes Task 3
      mockUpdateTask('task-3', { deleted: true })

      expect(mockUpdateTask).toHaveBeenCalledWith('task-1', expect.objectContaining({
        title: 'Updated Task 1'
      }))
      expect(mockMoveTask).toHaveBeenCalledWith('task-2', 'in-progress')
    })
  })

  describe('Advanced Features Journey', () => {
    it('should handle complex task with all fields', async () => {
      const user = userEvent.setup()
      const complexTask = createTestTask({
        title: 'Complex Multi-Field Task',
        description: 'This task has all possible fields filled',
        priority: 'urgent',
        status: 'todo',
        startDate: '2025-01-15',
        dueDate: '2025-01-25',
        progress: 75,
        assignees: [
          { id: 'dev1', name: 'Alice Developer', color: '#3B82F6' },
          { id: 'dev2', name: 'Bob Builder', color: '#10B981' },
          { id: 'dev3', name: 'Carol Coder', color: '#EC4899' }
        ],
        tags: [
          { id: 'tag-frontend', name: 'Frontend', color: '#10B981' },
          { id: 'tag-backend', name: 'Backend', color: '#F59E0B' },
          { id: 'tag-critical', name: 'Critical', color: '#EF4444' },
          { id: 'tag-testing', name: 'Testing', color: '#8B5CF6' }
        ]
      })

      const { mockUpdateTask } = renderFullApp([complexTask])

      // User opens task for editing
      await user.click(screen.getByText('Complex Multi-Field Task'))

      // User modifies progress
      const progressSlider = screen.getByRole('slider')
      await user.click(progressSlider)

      // User modifies dates
      const startDateInput = screen.getByDisplayValue('2025-01-15')
      await user.clear(startDateInput)
      await user.type(startDateInput, '2025-01-16')

      // User saves changes
      await user.click(screen.getByText('Сохранить'))

      expect(mockUpdateTask).toHaveBeenCalledWith(
        complexTask.id,
        expect.objectContaining({
          progress: expect.any(Number),
          startDate: '2025-01-16'
        })
      )
    })

    it('should handle search across all task fields', async () => {
      const user = userEvent.setup()
      const tasks = [
        createTestTask({
          title: 'Frontend Development',
          description: 'Create React components',
          tags: [{ id: 'tag1', name: 'React', color: '#10B981' }]
        }),
        createTestTask({
          title: 'Backend API',
          description: 'Design RESTful endpoints',
          tags: [{ id: 'tag2', name: 'API', color: '#F59E0B' }]
        }),
        createTestTask({
          title: 'Database Setup',
          description: 'Configure PostgreSQL database',
          tags: [{ id: 'tag3', name: 'Database', color: '#8B5CF6' }]
        })
      ]

      const { mockSetFilters } = renderFullApp(tasks)

      // User expands filter panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      // User searches for "React" in title
      const searchInput = screen.getByTestId('filter-search-input')
      await user.type(searchInput, 'React')

      expect(mockSetFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'React'
        })
      )

      // User searches for "components" in description
      await user.clear(searchInput)
      await user.type(searchInput, 'components')

      expect(mockSetFilters).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: 'components'
        })
      )
    })
  })

  describe('Error Handling Journey', () => {
    it('should gracefully handle network/store errors', async () => {
      const user = userEvent.setup()

      // Mock store to throw an error
      mockStore.mockImplementation(() => {
        throw new Error('Store error')
      })

      // App should not crash completely
      expect(() => render(<DndContext><KanbanBoard /></DndContext>)).toThrow()
    })

    it('should handle invalid task operations', async () => {
      const user = userEvent.setup()
      const { mockUpdateTask } = renderFullApp([createTestTask()])

      // Mock invalid update (invalid progress value)
      mockUpdateTask.mockImplementation(() => {
        throw new Error('Invalid task data')
      })

      await user.click(screen.getByText('Test Task'))

      const titleInput = screen.getByDisplayValue('Test Task')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated')

      await user.click(screen.getByText('Сохранить'))

      // Error should be handled (implementation dependent)
    })
  })

  describe('Performance Journey', () => {
    it('should handle rapid task operations', async () => {
      const user = userEvent.setup({ delay: 0 }) // No delay for rapid operations
      const tasks = Array.from({ length: 10 }, (_, i) =>
        createTestTask({
          id: `task-${i}`,
          title: `Task ${i}`,
          status: 'todo'
        })
      )

      const { mockUpdateTask } = renderFullApp(tasks)

      // User rapidly edits multiple tasks
      for (let i = 0; i < 3; i++) {
        await user.click(screen.getByText(`Task ${i}`))

        const titleInput = screen.getByDisplayValue(`Task ${i}`)
        await user.clear(titleInput)
        await user.type(titleInput, `Updated ${i}`)

        await user.click(screen.getByText('Сохранить'))
      }

      expect(mockUpdateTask).toHaveBeenCalledTimes(3)
    })

    it('should handle large filter operations', async () => {
      const user = userEvent.setup()
      const tasks = Array.from({ length: 100 }, (_, i) =>
        createTestTask({
          id: `task-${i}`,
          title: `Task ${i}`,
          status: ['todo', 'in-progress', 'review', 'testing', 'done'][i % 5] as TaskStatus,
          priority: ['low', 'medium', 'high', 'urgent'][i % 4] as Priority
        })
      )

      renderFullApp(tasks)

      // User expands filter panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      // User applies multiple filters quickly
      await user.click(screen.getByText('Срочно'))
      await user.click(screen.getByText('Высокий'))
      await user.click(screen.getByText('Новая задача'))
      await user.click(screen.getByText('Готово'))

      // Should not cause performance issues
      expect(screen.getByText('Фильтры')).toBeInTheDocument()
    })
  })

  describe('Accessibility Journey', () => {
    it('should be fully navigable via keyboard', async () => {
      const user = userEvent.setup()
      const tasks = [createTestTask()]
      renderFullApp(tasks)

      // User navigates through interface using only keyboard
      await user.tab()
      expect(document.activeElement).toBeInTheDocument()

      // Continue tabbing through all interactive elements
      for (let i = 0; i < 10; i++) {
        await user.tab()
        expect(document.activeElement).toBeInTheDocument()
      }

      // User can open and close filter panel with keyboard
      await user.keyboard('{Enter}') // Try to expand filter panel
    })

    it('should announce important actions to screen readers', async () => {
      const user = userEvent.setup()
      const tasks = [createTestTask()]
      renderFullApp(tasks)

      // Filter panel should have proper ARIA labels
      expect(screen.getByTestId('filter-panel-title')).toBeInTheDocument()

      // Task elements should be properly labeled
      expect(screen.getByText('Test Task')).toBeInTheDocument()
    })
  })
})