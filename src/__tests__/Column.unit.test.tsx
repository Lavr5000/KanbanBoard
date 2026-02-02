import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Column } from '@/entities/column/ui/Column'

const mockColumn = {
  id: 'col-1',
  title: 'To Do',
  boardId: 'board-1',
}

const mockTasks = [
  {
    id: 'task-1',
    content: 'First task',
    columnId: 'col-1',
    priority: 'high' as const,
    createdAt: new Date().toISOString(),
    tags: [],
  },
  {
    id: 'task-2',
    content: 'Second task',
    columnId: 'col-1',
    priority: 'low' as const,
    createdAt: new Date().toISOString(),
    tags: [],
  },
]

describe('Column Component', () => {
  it('renders column title', () => {
    render(
      <Column
        column={mockColumn}
        tasks={[]}
        onDeleteTrigger={vi.fn()}
        boardName="Test Board"
        isFirst={false}
        onColumnUpdate={vi.fn()}
        onColumnDelete={vi.fn()}
      />
    )
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('renders tasks in column', () => {
    render(
      <Column
        column={mockColumn}
        tasks={mockTasks}
        onDeleteTrigger={vi.fn()}
        boardName="Test Board"
        isFirst={false}
        onColumnUpdate={vi.fn()}
        onColumnDelete={vi.fn()}
      />
    )
    expect(screen.getByText('First task')).toBeInTheDocument()
    expect(screen.getByText('Second task')).toBeInTheDocument()
  })

  it('renders plus button for adding tasks', () => {
    render(
      <Column
        column={mockColumn}
        tasks={[]}
        onDeleteTrigger={vi.fn()}
        boardName="Test Board"
        isFirst={false}
        onColumnUpdate={vi.fn()}
        onColumnDelete={vi.fn()}
      />
    )
    // Plus button is a SVG icon from lucide-react
    const plusButton = document.querySelector('svg[data-tour="add-task-btn"]')
    expect(plusButton).toBeInTheDocument()
  })
})
