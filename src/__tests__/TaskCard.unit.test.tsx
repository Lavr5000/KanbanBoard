import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskCard } from '@/entities/task/ui/TaskCard'

// Mock @dnd-kit/sortable
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    setNodeRef: vi.fn(),
    attributes: {},
    listeners: {},
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
}))

// Mock CSS from @dnd-kit/utilities
vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Translate: {
      toString: () => '',
    },
  },
}))

const mockTask = {
  id: '1',
  content: 'Test task content',
  columnId: 'col-1',
  priority: 'high' as const,
  createdAt: new Date().toISOString(),
  tags: [],
}

describe('TaskCard Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  it('renders task content', () => {
    render(<TaskCard task={mockTask} isDragging={false} />)
    expect(screen.getByText('Test task content')).toBeInTheDocument()
  })

  it('displays correct priority badge for high priority', () => {
    render(<TaskCard task={mockTask} isDragging={false} />)
    expect(screen.getByText('Срочно')).toBeInTheDocument()
  })

  it('displays correct priority badge for medium priority', () => {
    const mediumTask = { ...mockTask, priority: 'medium' as const }
    render(<TaskCard task={mediumTask} isDragging={false} />)
    expect(screen.getByText('Обычно')).toBeInTheDocument()
  })

  it('displays correct priority badge for low priority', () => {
    const lowTask = { ...mockTask, priority: 'low' as const }
    render(<TaskCard task={lowTask} isDragging={false} />)
    expect(screen.getByText('Низкий')).toBeInTheDocument()
  })

  it('renders creation date', () => {
    render(<TaskCard task={mockTask} isDragging={false} />)
    const dateString = new Date(mockTask.createdAt).toLocaleDateString()
    expect(screen.getByText(dateString)).toBeInTheDocument()
  })

  it('displays task card with glass styling', () => {
    const { container } = render(<TaskCard task={mockTask} isDragging={false} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('glass-card')
  })
})
