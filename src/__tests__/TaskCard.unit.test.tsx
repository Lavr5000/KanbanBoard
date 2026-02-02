import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskCard } from '@/entities/task/ui/TaskCard'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  })),
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

  it('applies dragging styles when isDragging is true', () => {
    const { container } = render(<TaskCard task={mockTask} isDragging={true} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('opacity-50')
  })
})
