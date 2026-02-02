import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Board } from '@/widgets/board/ui/Board'

// Mock OnboardingTour
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

  it('renders board background', () => {
    render(<Board />)
    const background = document.querySelector('.fixed.inset-0.-z-10')
    expect(background).toBeInTheDocument()
  })
})
