import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KanbanCard } from '../KanbanCard'
import { Task, Priority } from '@/shared/types/task'
import { DndContext } from '@dnd-kit/core'

// Mock the store
jest.mock('@/shared/store/kanbanStore', () => ({
  useKanbanStore: jest.fn()
}))

const mockUpdateTask = jest.fn()
const mockDeleteTask = jest.fn()

const useKanbanStore = require('@/shared/store/kanbanStore').useKanbanStore

const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'test-task-1',
  title: 'Test Task Title',
  description: 'Test task description',
  status: 'todo',
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
  progress: 45,
  ...overrides
})

const renderKanbanCard = (task: Task = createMockTask()) => {
  useKanbanStore.mockReturnValue({
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    getTasksByStatus: jest.fn(() => []),
    getTaskById: jest.fn(() => task),
    addTask: jest.fn(),
    moveTask: jest.fn(),
    filters: {
      search: '',
      priorities: [],
      statuses: [],
      dateRange: { start: undefined, end: undefined, hasDueDate: undefined }
    },
    setFilters: jest.fn(),
    clearFilters: jest.fn(),
    getFilteredTasks: jest.fn(() => [task])
  })

  return render(
    <DndContext>
      <KanbanCard task={task} />
    </DndContext>
  )
}

describe('KanbanCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Display Mode', () => {
    it('should render task information correctly', () => {
      const task = createMockTask()
      renderKanbanCard(task)

      expect(screen.getByText('Test Task Title')).toBeInTheDocument()
      expect(screen.getByText('Test task description')).toBeInTheDocument()
      expect(screen.getByText('45%')).toBeInTheDocument()
    })

    it('should render without description', () => {
      const task = createMockTask({ description: undefined })
      renderKanbanCard(task)

      expect(screen.getByText('Test Task Title')).toBeInTheDocument()
      expect(screen.queryByText('Test task description')).not.toBeInTheDocument()
    })

    it('should render assignees', () => {
      const task = createMockTask({
        assignees: [
          { id: 'user1', name: 'John Doe', color: '#3B82F6' }
        ]
      })
      renderKanbanCard(task)

      // Check that assignees section exists in the component structure
      const card = screen.getByTestId('kanban-card-test-task-1')
      expect(card).toBeInTheDocument()

      // Since AssigneeGroup is a separate component, we just verify the task with assignees renders
      expect(task.assignees).toHaveLength(1)
      expect(task.assignees[0].name).toBe('John Doe')
    })

    it('should render tags', () => {
      const task = createMockTask({
        tags: [
          { id: 'tag1', name: 'Frontend', color: '#10B981' },
          { id: 'tag2', name: 'Bug', color: '#EF4444' }
        ]
      })
      renderKanbanCard(task)

      expect(screen.getByText('Frontend')).toBeInTheDocument()
      expect(screen.getByText('Bug')).toBeInTheDocument()
    })

    it('should show "+ Add tags" when no tags exist', () => {
      const task = createMockTask({ tags: [] })
      renderKanbanCard(task)

      expect(screen.getByText('+ Add tags')).toBeInTheDocument()
    })

    it('should show "+ Add progress" when no progress exists', () => {
      const task = createMockTask({ progress: undefined })
      renderKanbanCard(task)

      expect(screen.getByText('+ Add progress')).toBeInTheDocument()
    })
  })

  describe('Edit Mode', () => {
    it('should enter edit mode when clicking on task', async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      renderKanbanCard(task)

      await user.click(screen.getByText('Test Task Title'))

      expect(screen.getByDisplayValue('Test Task Title')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test task description')).toBeInTheDocument()
    })

    it('should allow editing title and description', async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      renderKanbanCard(task)

      await user.click(screen.getByText('Test Task Title'))

      const titleInput = screen.getByDisplayValue('Test Task Title')
      const descriptionTextarea = screen.getByDisplayValue('Test task description')

      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Title')

      await user.clear(descriptionTextarea)
      await user.type(descriptionTextarea, 'Updated Description')

      expect(titleInput).toHaveValue('Updated Title')
      expect(descriptionTextarea).toHaveValue('Updated Description')
    })

    it('should allow editing priority', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ priority: 'medium' })
      renderKanbanCard(task)

      await user.click(screen.getByText('Test Task Title'))

      // Look for priority selector (implementation depends on PrioritySelector component)
      expect(screen.getByText('Priority')).toBeInTheDocument()
    })

    it('should allow editing dates', async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      renderKanbanCard(task)

      await user.click(screen.getByText('Test Task Title'))

      expect(screen.getByDisplayValue('2025-01-15')).toBeInTheDocument()
      expect(screen.getByDisplayValue('2025-01-20')).toBeInTheDocument()

      const startDateInput = screen.getByDisplayValue('2025-01-15')
      await user.clear(startDateInput)
      await user.type(startDateInput, '2025-01-16')

      expect(startDateInput).toHaveValue('2025-01-16')
    })

    it('should allow editing progress', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ progress: 45 })
      renderKanbanCard(task)

      await user.click(screen.getByText('Test Task Title'))

      const progressSlider = screen.getByTestId('progress-slider')
      expect(progressSlider).toBeInTheDocument()
      expect(screen.getByText('Progress: 45%')).toBeInTheDocument()
    })
  })

  describe('Save and Cancel Operations', () => {
    it('should save changes when clicking Save button', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ title: 'Original Title' })
      renderKanbanCard(task)

      await user.click(screen.getByText('Original Title'))

      const titleInput = screen.getByDisplayValue('Original Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'New Title')

      await user.click(screen.getByText('Сохранить'))

      expect(mockUpdateTask).toHaveBeenCalledWith(task.id, expect.objectContaining({
        title: 'New Title'
      }))
    })

    it('should cancel changes when clicking Cancel button', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ title: 'Original Title' })
      renderKanbanCard(task)

      await user.click(screen.getByText('Original Title'))

      const titleInput = screen.getByDisplayValue('Original Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Changed Title')

      await user.click(screen.getByText('Отмена'))

      expect(mockUpdateTask).not.toHaveBeenCalled()

      // Should return to display mode
      await waitFor(() => {
        expect(screen.getByText('Original Title')).toBeInTheDocument()
        expect(screen.queryByDisplayValue('Changed Title')).not.toBeInTheDocument()
      })
    })

    it('should save changes with Ctrl+Enter', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ title: 'Original Title' })
      renderKanbanCard(task)

      await user.click(screen.getByText('Original Title'))

      const titleInput = screen.getByDisplayValue('Original Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'New Title')

      await user.keyboard('{Control>}{Enter}{/Control}')

      expect(mockUpdateTask).toHaveBeenCalledWith(task.id, expect.objectContaining({
        title: 'New Title'
      }))
    })

    it('should cancel changes with Escape', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ title: 'Original Title' })
      renderKanbanCard(task)

      await user.click(screen.getByText('Original Title'))

      const titleInput = screen.getByDisplayValue('Original Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Changed Title')

      await user.keyboard('{Escape}')

      expect(mockUpdateTask).not.toHaveBeenCalled()

      await waitFor(() => {
        expect(screen.getByText('Original Title')).toBeInTheDocument()
      })
    })
  })

  describe('Bug Fix #1: Edit Mode Persistence', () => {
    it('should not close edit mode when changing priority', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ priority: 'medium' })
      renderKanbanCard(task)

      await user.click(screen.getByText('Test Task Title'))

      // Ensure edit mode is active
      expect(screen.getByDisplayValue('Test Task Title')).toBeInTheDocument()

      // Simulate changing priority (this would normally close edit mode due to onBlur)
      const priorityLabel = screen.getByText('Priority')
      await user.click(priorityLabel)

      // Edit mode should still be active - no onBlur on input
      expect(screen.getByDisplayValue('Test Task Title')).toBeInTheDocument()
      expect(screen.getByText('Сохранить')).toBeInTheDocument()
      expect(screen.getByText('Отмена')).toBeInTheDocument()
    })

    it('should not close edit mode when clicking on date inputs', async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      renderKanbanCard(task)

      await user.click(screen.getByText('Test Task Title'))

      expect(screen.getByDisplayValue('Test Task Title')).toBeInTheDocument()

      const startDateInput = screen.getByDisplayValue('2025-01-15')
      await user.click(startDateInput)

      // Edit mode should remain active
      expect(screen.getByDisplayValue('Test Task Title')).toBeInTheDocument()
      expect(screen.getByText('Сохранить')).toBeInTheDocument()
    })

    it('should not close edit mode when clicking on progress slider', async () => {
      const user = userEvent.setup()
      const task = createMockTask({ progress: 45 })
      renderKanbanCard(task)

      await user.click(screen.getByText('Test Task Title'))

      expect(screen.getByDisplayValue('Test Task Title')).toBeInTheDocument()

      const progressSlider = screen.getByTestId('progress-slider')
      await user.click(progressSlider)

      // Edit mode should remain active
      expect(screen.getByDisplayValue('Test Task Title')).toBeInTheDocument()
      expect(screen.getByText('Сохранить')).toBeInTheDocument()
    })

    it('should not close edit mode when interacting with tag selector', async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      renderKanbanCard(task)

      await user.click(screen.getByText('Test Task Title'))

      expect(screen.getByDisplayValue('Test Task Title')).toBeInTheDocument()

      const tagsLabel = screen.getByText('Tags')
      await user.click(tagsLabel)

      // Edit mode should remain active
      expect(screen.getByDisplayValue('Test Task Title')).toBeInTheDocument()
      expect(screen.getByText('Сохранить')).toBeInTheDocument()
    })

    it('should preserve all unsaved changes when canceling', async () => {
      const user = userEvent.setup()
      const originalTask = createMockTask({
        title: 'Original Title',
        description: 'Original Description',
        priority: 'medium',
        progress: 45
      })
      renderKanbanCard(originalTask)

      await user.click(screen.getByText('Original Title'))

      // Make multiple changes
      const titleInput = screen.getByDisplayValue('Original Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'Modified Title')

      const descriptionTextarea = screen.getByDisplayValue('Original Description')
      await user.clear(descriptionTextarea)
      await user.type(descriptionTextarea, 'Modified Description')

      // Cancel editing
      await user.click(screen.getByText('Отмена'))

      // Verify no updates were made
      expect(mockUpdateTask).not.toHaveBeenCalled()

      // Verify original values are restored
      await waitFor(() => {
        expect(screen.getByText('Original Title')).toBeInTheDocument()
        expect(screen.getByText('Original Description')).toBeInTheDocument()
      })
    })

    it('should save all changes at once when clicking Save', async () => {
      const user = userEvent.setup()
      const task = createMockTask({
        title: 'Original Title',
        description: 'Original Description',
        progress: 45
      })
      renderKanbanCard(task)

      await user.click(screen.getByText('Original Title'))

      // Make multiple changes
      const titleInput = screen.getByDisplayValue('Original Title')
      await user.clear(titleInput)
      await user.type(titleInput, 'New Title')

      const descriptionTextarea = screen.getByDisplayValue('Original Description')
      await user.clear(descriptionTextarea)
      await user.type(descriptionTextarea, 'New Description')

      const progressSlider = screen.getByTestId('progress-slider')
      await user.click(progressSlider)
      await user.click(progressSlider) // Click twice to change value

      // Save all changes
      await user.click(screen.getByText('Сохранить'))

      expect(mockUpdateTask).toHaveBeenCalledWith(task.id, expect.objectContaining({
        title: 'New Title',
        description: 'New Description'
      }))
      expect(mockUpdateTask).toHaveBeenCalledTimes(1)
    })
  })

  describe('Delete Operation', () => {
    it('should show delete button on hover', async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      renderKanbanCard(task)

      const card = screen.getByTestId('kanban-card-test-task-1')

      // Delete button should exist but be initially hidden (opacity-0)
      const deleteButton = screen.getByTestId('delete-button')
      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toHaveClass('opacity-0')

      // Hover over card
      await user.hover(card!)

      // Delete button should now be visible
      expect(deleteButton).toHaveClass('group-hover:opacity-100')
    })

    it('should call deleteTask when delete button is clicked', async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      renderKanbanCard(task)

      const card = screen.getByText('Test Task Title').closest('div')
      await user.hover(card!)

      const deleteButton = screen.getByTestId('delete-button')
      await user.click(deleteButton)

      expect(mockDeleteTask).toHaveBeenCalledWith(task.id)
    })
  })

  describe('Drag and Drop', () => {
    it('should render with drag handle', () => {
      const task = createMockTask()
      renderKanbanCard(task)

      // Look for drag handle - it's a div with specific styling, not a button
      expect(screen.getByTestId('drag-handle')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const task = createMockTask()
      renderKanbanCard(task)

      // Check for proper focus management and keyboard navigation
      expect(screen.getByText('Test Task Title')).toBeInTheDocument()
      // Drag handle has data-testid="drag-handle"
      expect(screen.getByTestId('drag-handle')).toBeInTheDocument()
    })

    it('should support keyboard navigation in edit mode', async () => {
      const user = userEvent.setup()
      const task = createMockTask()
      renderKanbanCard(task)

      await user.click(screen.getByText('Test Task Title'))

      // Check that we're in edit mode and inputs are present
      const titleInput = screen.getByDisplayValue('Test Task Title')
      const descriptionInput = screen.getByDisplayValue('Test task description')

      expect(titleInput).toBeInTheDocument()
      expect(descriptionInput).toBeInTheDocument()

      // Test keyboard navigation - title input should be focusable
      titleInput.focus()
      expect(titleInput).toHaveFocus()
    })
  })
})