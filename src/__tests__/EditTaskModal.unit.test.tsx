import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditTaskModal } from '@/features/task-operations/ui/EditTaskModal'
import { Task } from '@/entities/task/model/types'

// Mock BoardContext
const mockUpdateTask = vi.fn()
const mockBoardContext = {
  addTask: vi.fn(),
  updateTask: mockUpdateTask,
  deleteTask: vi.fn(),
  moveTask: vi.fn(),
  columns: [],
  tasks: [],
  loading: false,
  error: null,
  refetch: vi.fn(),
}

vi.mock('@/widgets/board/model/BoardContext', () => ({
  useBoardContext: () => mockBoardContext,
}))

describe('EditTaskModal Component', () => {
  const mockTask: Task = {
    id: '1',
    content: 'Original task content',
    column_id: 'col-1',
    position: 0,
    priority: 'medium' as const,
    created_at: new Date().toISOString(),
  }

  const mockProps = {
    task: mockTask,
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pre-fills with task data', () => {
    render(<EditTaskModal {...mockProps} />)

    const input = screen.getByPlaceholderText(/Введите текст/i) as HTMLTextAreaElement
    expect(input.value).toBe('Original task content')
  })

  it('pre-selects correct priority - medium', () => {
    render(<EditTaskModal {...mockProps} />)

    const mediumPriority = screen.getByTestId('priority-medium')
    expect(mediumPriority).toHaveClass('bg-green-500', 'border-green-500', 'text-white')
  })

  it('pre-selects correct priority - high', () => {
    const highPriorityTask: Task = {
      ...mockTask,
      priority: 'high',
    }

    render(<EditTaskModal {...mockProps} task={highPriorityTask} />)

    const highPriority = screen.getByTestId('priority-high')
    expect(highPriority).toHaveClass('bg-red-500', 'border-red-500', 'text-white')
  })

  it('pre-selects correct priority - low', () => {
    const lowPriorityTask: Task = {
      ...mockTask,
      priority: 'low',
    }

    render(<EditTaskModal {...mockProps} task={lowPriorityTask} />)

    const lowPriority = screen.getByTestId('priority-low')
    expect(lowPriority).toHaveClass('bg-blue-500', 'border-blue-500', 'text-white')
  })

  it('updates task content', async () => {
    const user = userEvent.setup()
    render(<EditTaskModal {...mockProps} />)

    const input = screen.getByPlaceholderText(/Введите текст/i)
    await user.clear(input)
    await user.type(input, 'Updated task content')

    const saveButton = screen.getByTestId('save-task-button')
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith('1', {
        title: 'Updated task content',
        priority: 'medium',
      })
    })
  })

  it('updates task priority', async () => {
    const user = userEvent.setup()
    render(<EditTaskModal {...mockProps} />)

    const highPriorityButton = screen.getByTestId('priority-high')
    await user.click(highPriorityButton)

    const saveButton = screen.getByTestId('save-task-button')
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith('1', {
        title: 'Original task content',
        priority: 'high',
      })
    })
  })

  it('updates both content and priority', async () => {
    const user = userEvent.setup()
    render(<EditTaskModal {...mockProps} />)

    const input = screen.getByPlaceholderText(/Введите текст/i)
    await user.clear(input)
    await user.type(input, 'Updated urgent task')

    const highPriorityButton = screen.getByTestId('priority-high')
    await user.click(highPriorityButton)

    const saveButton = screen.getByTestId('save-task-button')
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith('1', {
        title: 'Updated urgent task',
        priority: 'high',
      })
    })
  })

  it('calls onClose when save button is clicked', async () => {
    const user = userEvent.setup()
    render(<EditTaskModal {...mockProps} />)

    const saveButton = screen.getByTestId('save-task-button')
    await user.click(saveButton)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('syncs with task prop changes via useEffect', () => {
    const { rerender } = render(<EditTaskModal {...mockProps} />)

    // Initial content
    const input = screen.getByPlaceholderText(/Введите текст/i) as HTMLTextAreaElement
    expect(input.value).toBe('Original task content')

    // Rerender with different task
    const updatedTask: Task = {
      ...mockTask,
      content: 'Updated via prop',
    }

    rerender(<EditTaskModal {...mockProps} task={updatedTask} />)

    expect(input.value).toBe('Updated via prop')
  })

  it('syncs priority with task prop changes', () => {
    const { rerender } = render(<EditTaskModal {...mockProps} />)

    // Initial priority
    const mediumPriority = screen.getByTestId('priority-medium')
    expect(mediumPriority).toHaveClass('bg-green-500', 'border-green-500', 'text-white')

    // Rerender with different priority
    const highPriorityTask: Task = {
      ...mockTask,
      priority: 'high',
    }

    rerender(<EditTaskModal {...mockProps} task={highPriorityTask} />)

    const highPriority = screen.getByTestId('priority-high')
    expect(highPriority).toHaveClass('bg-red-500', 'border-red-500', 'text-white')
  })

  it('works with React 19 concurrent features', async () => {
    const user = userEvent.setup()
    render(<EditTaskModal {...mockProps} />)

    // Rapid state changes (tests React 19 concurrent rendering)
    const input = screen.getByPlaceholderText(/Введите текст/i)

    await user.clear(input)
    await user.type(input, 'A')
    await user.type(input, 'B')
    await user.type(input, 'C')

    expect(input).toHaveValue('ABC')
  })
})
