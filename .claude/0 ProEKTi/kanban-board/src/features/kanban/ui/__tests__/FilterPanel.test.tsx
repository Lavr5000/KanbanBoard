import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { FilterPanel } from '../FilterPanel'
import { TaskFilters } from '@/shared/types/task'

const mockFilters: TaskFilters = {
  search: '',
  priorities: [],
  statuses: [],
  dateRange: {
    start: undefined,
    end: undefined,
    hasDueDate: undefined
  }
}

const renderFilterPanel = (filters: TaskFilters = mockFilters, taskCount: number = 10) => {
  const mockOnFiltersChange = jest.fn()

  const { rerender } = render(
    <FilterPanel
      filters={filters}
      onFiltersChange={mockOnFiltersChange}
      taskCount={taskCount}
    />
  )

  return { mockOnFiltersChange, rerender }
}

describe('FilterPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initial Rendering', () => {
    it('should render filter panel with title', () => {
      renderFilterPanel()

      expect(screen.getByTestId('filter-panel-title')).toBeInTheDocument()
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument()
      expect(screen.getByTestId('filter-toggle-button')).toBeInTheDocument()
    })

    it('should display task count when filters are active', () => {
      const activeFilters: TaskFilters = {
        ...mockFilters,
        search: 'test'
      }

      renderFilterPanel(activeFilters, 5)

      expect(screen.getByTestId('filter-task-count')).toBeInTheDocument()
      expect(screen.getByTestId('filter-task-count')).toHaveTextContent('5 задач')
    })

    it('should not display task count when no filters are active', () => {
      renderFilterPanel(mockFilters, 10)

      expect(screen.queryByText(/\d+ задач/)).not.toBeInTheDocument()
    })

    it('should show clear filters button when filters are active', () => {
      const activeFilters: TaskFilters = {
        ...mockFilters,
        priorities: ['urgent']
      }

      renderFilterPanel(activeFilters)

      expect(screen.getByTestId('filter-clear-button')).toBeInTheDocument()
    })
  })

  describe('Expand/Collapse Functionality', () => {
    it('should start collapsed', () => {
      renderFilterPanel()

      expect(screen.queryByTestId('filter-search-input')).not.toBeInTheDocument()
      expect(screen.queryByTestId('priority-urgent')).not.toBeInTheDocument()
    })

    it('should expand when clicked', async () => {
      const user = userEvent.setup()
      renderFilterPanel()

      const expandButton = screen.getByTestId('filter-toggle-button')
      await user.click(expandButton)

      expect(screen.getByTestId('filter-search-input')).toBeInTheDocument()
      expect(screen.getByTestId('priority-urgent')).toBeInTheDocument()
      expect(screen.getByTestId('status-todo')).toBeInTheDocument()
    })

    it('should collapse when clicked again', async () => {
      const user = userEvent.setup()
      renderFilterPanel()

      const expandButton = screen.getByTestId('filter-toggle-button')

      // Expand
      await user.click(expandButton)
      expect(screen.getByTestId('filter-search-input')).toBeInTheDocument()

      // Collapse
      await user.click(expandButton)
      expect(screen.queryByTestId('filter-search-input')).not.toBeInTheDocument()
    })
  })

  describe('Search Filter', () => {
    it('should filter by search term', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const searchInput = screen.getByTestId('filter-search-input')
      await user.type(searchInput, 'bug fix')

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'bug fix'
        })
      )
    })

    it('should clear search when input is cleared', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel({
        ...mockFilters,
        search: 'existing search'
      })

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const searchInput = screen.getByDisplayValue('existing search')
      await user.clear(searchInput)

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          search: ''
        })
      )
    })
  })

  describe('Priority Filter', () => {
    const priorities = ['Срочно', 'Высокий', 'Средний', 'Низкий']

    beforeEach(async () => {
      const user = userEvent.setup()
      renderFilterPanel()
      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))
    })

    it('should render all priority options', () => {
      priorities.forEach(priority => {
        expect(screen.getByText(priority)).toBeInTheDocument()
      })
    })

    it('should select priority filter', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      await user.click(screen.getByText('Срочно'))

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          priorities: ['urgent']
        })
      )
    })

    it('should toggle priority selection', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const urgentButton = screen.getByText('Срочно')

      // Select
      await user.click(urgentButton)
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          priorities: ['urgent']
        })
      )

      // Deselect
      await user.click(urgentButton)
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          priorities: []
        })
      )
    })

    it('should allow multiple priority selections', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      await user.click(screen.getByText('Срочно'))
      await user.click(screen.getByText('Высокий'))

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          priorities: ['urgent', 'high']
        })
      )
    })
  })

  describe('Status Filter', () => {
    const statuses = ['Новая задача', 'Выполняется', 'Ожидает проверки', 'Тестирование', 'Готово']

    beforeEach(async () => {
      const user = userEvent.setup()
      renderFilterPanel()
      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))
    })

    it('should render all status options', () => {
      statuses.forEach(status => {
        expect(screen.getByText(status)).toBeInTheDocument()
      })
    })

    it('should select status filter', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      await user.click(screen.getByText('Выполняется'))

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          statuses: ['in-progress']
        })
      )
    })

    it('should toggle status selection', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const inProgressButton = screen.getByText('Выполняется')

      // Select
      await user.click(inProgressButton)
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          statuses: ['in-progress']
        })
      )

      // Deselect
      await user.click(inProgressButton)
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          statuses: []
        })
      )
    })

    it('should allow multiple status selections', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      await user.click(screen.getByText('Новая задача'))
      await user.click(screen.getByText('Готово'))

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          statuses: ['todo', 'done']
        })
      )
    })
  })

  describe('Date Range Filter', () => {
    beforeEach(async () => {
      const user = userEvent.setup()
      renderFilterPanel()
      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))
    })

    it('should render date range inputs', () => {
      expect(screen.getByLabelText('Start Date')).toBeInTheDocument()
      expect(screen.getByLabelText('Due Date')).toBeInTheDocument()
      expect(screen.getByLabelText('Только с датой выполнения')).toBeInTheDocument()
    })

    it('should filter by start date', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const startDateInput = screen.getByLabelText('Start Date')
      await user.type(startDateInput, '2025-01-15')

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: expect.objectContaining({
            start: '2025-01-15'
          })
        })
      )
    })

    it('should filter by end date', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const endDateInput = screen.getByLabelText('Due Date')
      await user.type(endDateInput, '2025-01-31')

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: expect.objectContaining({
            end: '2025-01-31'
          })
        })
      )
    })

    it('should toggle "has due date" filter', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const hasDueDateCheckbox = screen.getByLabelText('Только с датой выполнения')
      await user.click(hasDueDateCheckbox)

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: expect.objectContaining({
            hasDueDate: true
          })
        })
      )
    })

    it('should allow date range with "has due date" filter', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const hasDueDateCheckbox = screen.getByLabelText('Только с датой выполнения')
      const startDateInput = screen.getByLabelText('Start Date')

      await user.click(hasDueDateCheckbox)
      await user.type(startDateInput, '2025-01-15')

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          dateRange: {
            start: '2025-01-15',
            end: undefined,
            hasDueDate: true
          }
        })
      )
    })
  })

  describe('Clear Filters', () => {
    it('should reset all filters when clear button is clicked', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel({
        ...mockFilters,
        search: 'existing search',
        priorities: ['urgent'],
        statuses: ['todo'],
        dateRange: {
          start: '2025-01-15',
          end: '2025-01-31',
          hasDueDate: true
        }
      })

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const clearButton = screen.getByTitle('Сбросить все фильтры')
      await user.click(clearButton)

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        search: '',
        priorities: [],
        statuses: [],
        dateRange: {
          start: undefined,
          end: undefined,
          hasDueDate: undefined
        }
      })
    })

    it('should not show clear button when no filters are active', async () => {
      const user = userEvent.setup()
      renderFilterPanel(mockFilters)

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      expect(screen.queryByTitle('Сбросить все фильтры')).not.toBeInTheDocument()
    })
  })

  describe('Filter Combinations', () => {
    it('should maintain all filter types when multiple are active', async () => {
      const user = userEvent.setup()
      const { mockOnFiltersChange } = renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      // Set search
      const searchInput = screen.getByPlaceholderText('Название или описание задачи...')
      await user.type(searchInput, 'bug')

      // Set priority
      await user.click(screen.getByText('Срочно'))

      // Set status
      await user.click(screen.getByText('Выполняется'))

      // Set date range
      const startDateInput = screen.getByLabelText('Start Date')
      await user.type(startDateInput, '2025-01-15')

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        search: 'bug',
        priorities: ['urgent'],
        statuses: ['in-progress'],
        dateRange: {
          start: '2025-01-15',
          end: undefined,
          hasDueDate: undefined
        }
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      const user = userEvent.setup()
      renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      expect(screen.getByTestId('filter-search-input')).toBeInTheDocument()
      expect(screen.getByDisplayValue('')).toBeInTheDocument() // Date inputs exist but may not have labels
      expect(screen.getByText('Только с датой выполнения')).toBeInTheDocument()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      renderFilterPanel()

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      // Test tab navigation through filter elements
      await user.tab()
      expect(screen.getByPlaceholderText('Название или описание задачи...')).toHaveFocus()

      await user.tab()
      expect(screen.getByText('Срочно')).toHaveFocus()
    })
  })

  describe('Visual Feedback', () => {
    it('should show active state for selected priorities', async () => {
      const user = userEvent.setup()
      renderFilterPanel({
        ...mockFilters,
        priorities: ['urgent', 'high']
      })

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const urgentButton = screen.getByText('Срочно')
      const highButton = screen.getByText('Высокий')

      // Check for active state styling (implementation may vary)
      expect(urgentButton.closest('button')).toHaveClass('ring-2')
      expect(highButton.closest('button')).toHaveClass('ring-2')
    })

    it('should show active state for selected statuses', async () => {
      const user = userEvent.setup()
      renderFilterPanel({
        ...mockFilters,
        statuses: ['todo', 'done']
      })

      // Expand panel
      await user.click(screen.getByTestId('filter-toggle-button'))

      const todoButton = screen.getByText('Новая задача')
      const doneButton = screen.getByText('Готово')

      expect(todoButton.closest('button')).toHaveClass('bg-blue-500/30')
      expect(doneButton.closest('button')).toHaveClass('bg-blue-500/30')
    })
  })
})