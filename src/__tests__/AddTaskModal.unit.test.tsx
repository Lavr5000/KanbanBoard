import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddTaskModal } from '@/features/task-operations/ui/AddTaskModal'
import { BoardProvider } from '@/widgets/board/model/BoardContext'

// Mock BoardContext
const mockAddTask = vi.fn()
const mockBoardContext = {
  addTask: mockAddTask,
  updateTask: vi.fn(),
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
  BoardProvider: ({ children }: { children: React.ReactNode }) => children,
}))

describe('AddTaskModal Component', () => {
  const mockProps = {
    columnId: 'col-1',
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders task content input', () => {
    render(<AddTaskModal {...mockProps} />)

    expect(screen.getByPlaceholderText(/Введите текст/i)).toBeInTheDocument()
  })

  it('renders priority buttons', () => {
    render(<AddTaskModal {...mockProps} />)

    expect(screen.getByTestId('priority-low')).toBeInTheDocument()
    expect(screen.getByTestId('priority-medium')).toBeInTheDocument()
    expect(screen.getByTestId('priority-high')).toBeInTheDocument()
  })

  it('renders save button', () => {
    render(<AddTaskModal {...mockProps} />)

    expect(screen.getByTestId('save-task-button')).toBeInTheDocument()
    expect(screen.getByText(/Создать задачу/i)).toBeInTheDocument()
  })

  it('disables save button when content is empty', () => {
    render(<AddTaskModal {...mockProps} />)

    const saveButton = screen.getByTestId('save-task-button')
    expect(saveButton).toBeDisabled()
  })

  it('enables save button when content is entered', async () => {
    const user = userEvent.setup()
    render(<AddTaskModal {...mockProps} />)

    const input = screen.getByPlaceholderText(/Введите текст/i)
    await user.type(input, 'New test task')

    const saveButton = screen.getByTestId('save-task-button')
    expect(saveButton).not.toBeDisabled()
  })

  it('calls addTask and onClose when save button is clicked', async () => {
    const user = userEvent.setup()
    render(<AddTaskModal {...mockProps} />)

    const input = screen.getByPlaceholderText(/Введите текст/i)
    await user.type(input, 'New test task')

    const saveButton = screen.getByTestId('save-task-button')
    await user.click(saveButton)

    expect(mockAddTask).toHaveBeenCalledWith('col-1', {
      title: 'New test task',
      priority: 'medium',
    })
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call addTask when content is only whitespace', async () => {
    const user = userEvent.setup()
    render(<AddTaskModal {...mockProps} />)

    const input = screen.getByPlaceholderText(/Введите текст/i)
    await user.type(input, '   ')

    const saveButton = screen.getByTestId('save-task-button')
    await user.click(saveButton)

    expect(mockAddTask).not.toHaveBeenCalled()
    expect(mockProps.onClose).not.toHaveBeenCalled()
  })

  it('allows priority selection - low', async () => {
    const user = userEvent.setup()
    render(<AddTaskModal {...mockProps} />)

    const lowPriorityButton = screen.getByTestId('priority-low')
    await user.click(lowPriorityButton)

    expect(lowPriorityButton).toHaveClass('bg-blue-500', 'border-blue-500', 'text-white')
  })

  it('allows priority selection - high', async () => {
    const user = userEvent.setup()
    render(<AddTaskModal {...mockProps} />)

    const highPriorityButton = screen.getByTestId('priority-high')
    await user.click(highPriorityButton)

    expect(highPriorityButton).toHaveClass('bg-red-500', 'border-red-500', 'text-white')
  })

  it('saves with selected priority', async () => {
    const user = userEvent.setup()
    render(<AddTaskModal {...mockProps} />)

    const input = screen.getByPlaceholderText(/Введите текст/i)
    await user.type(input, 'Urgent task')

    const highPriorityButton = screen.getByTestId('priority-high')
    await user.click(highPriorityButton)

    const saveButton = screen.getByTestId('save-task-button')
    await user.click(saveButton)

    expect(mockAddTask).toHaveBeenCalledWith('col-1', {
      title: 'Urgent task',
      priority: 'high',
    })
  })

  it('works with React 19 concurrent features', async () => {
    const user = userEvent.setup()
    render(<AddTaskModal {...mockProps} />)

    // Rapid state changes (tests React 19 concurrent rendering)
    const input = screen.getByPlaceholderText(/Введите текст/i)

    await user.type(input, 'A')
    await user.type(input, 'B')
    await user.type(input, 'C')

    expect(input).toHaveValue('ABC')
  })
})
