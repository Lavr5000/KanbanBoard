import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Board } from '@/widgets/board/ui/Board'

// Mock dependencies
vi.mock('@/hooks/useBoardData', () => ({
  useBoardData: () => ({
    columns: [],
    tasks: [],
    loading: false,
    error: null,
    addTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    moveTask: vi.fn(),
    refetchColumns: vi.fn(),
  }),
}))

vi.mock('@/hooks/useBoards', () => ({
  useBoards: () => ({
    activeBoard: { id: 'test-board', name: 'Test Project' },
  }),
}))

vi.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com', user_metadata: { full_name: 'Test User' } },
    signOut: vi.fn(),
  }),
}))

vi.mock('@/shared/lib/useMediaQuery', () => ({
  useIsMobile: () => false,
}))

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

vi.mock('@/features/onboarding', async () => {
  const actual = await vi.importActual('@/features/onboarding')
  return {
    ...actual,
    OnboardingTour: ({ run, onCallback }: any) => <div data-testid="onboarding-tour">Mock Tour</div>,
  }
})

describe('Board Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders board header with title', () => {
    render(<Board />)
    expect(screen.getByText('Канбан доска')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<Board />)
    expect(screen.getByPlaceholderText('Поиск задач...')).toBeInTheDocument()
  })

  it('renders priority filter buttons', () => {
    render(<Board />)
    expect(screen.getByText('Все')).toBeInTheDocument()
    expect(screen.getByText('Срочно')).toBeInTheDocument()
    expect(screen.getByText('Обычно')).toBeInTheDocument()
    expect(screen.getByText('Низкий')).toBeInTheDocument()
  })

  it('renders board name', () => {
    render(<Board />)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })
})
