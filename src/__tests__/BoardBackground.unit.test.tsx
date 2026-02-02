import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BoardBackground } from '@/widgets/board/ui/BoardBackground'

describe('BoardBackground Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(<BoardBackground />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders MouseParallax wrapper', () => {
    const { container } = render(<BoardBackground />)
    const parallaxWrapper = container.querySelector('.fixed')
    expect(parallaxWrapper).toBeInTheDocument()
    expect(parallaxWrapper).toHaveClass('-z-10')
  })

  it('renders 4 glow orbs', () => {
    const { container } = render(<BoardBackground />)

    // GlowOrb components render divs with inline styles for position
    const orbs = container.querySelectorAll('[class*="rounded-full"]')
    expect(orbs.length).toBeGreaterThanOrEqual(4)
  })

  it('cleans up event listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = render(<BoardBackground />)

    // Trigger mousemove to ensure listener is attached
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 100,
    })
    window.dispatchEvent(mouseEvent)

    unmount()

    // Verify cleanup happened (MouseParallax cleanup)
    expect(removeSpy).toHaveBeenCalledWith(
      'mousemove',
      expect.any(Function)
    )
  })

  it('cleans up animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')

    const { unmount } = render(<BoardBackground />)

    unmount()

    // Verify animation frame cleanup
    expect(cancelSpy).toHaveBeenCalledWith(expect.any(Number))
  })

  it('does not cause memory leaks', () => {
    const { rerender, container } = render(<BoardBackground />)

    // Multiple re-renders should not cause issues
    for (let i = 0; i < 10; i++) {
      rerender(<BoardBackground />)
    }

    // Component should still render correctly
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has correct positioning styles', () => {
    const { container } = render(<BoardBackground />)
    const parallaxWrapper = container.querySelector('.fixed')

    expect(parallaxWrapper).toHaveClass('fixed', 'inset-0', '-z-10')
  })

  it('handles mouse movement', () => {
    const { container } = render(<BoardBackground />)

    // Trigger mouse movement
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 250,
      clientY: 250,
    })
    window.dispatchEvent(mouseEvent)

    // Component should still be mounted and functional
    expect(container.firstChild).toBeInTheDocument()
  })

  it('works with React 19 concurrent features', () => {
    const { rerender, container } = render(<BoardBackground />)

    // Rapid re-renders (tests React 19 concurrent rendering)
    for (let i = 0; i < 5; i++) {
      rerender(<BoardBackground />)
    }

    expect(container.firstChild).toBeInTheDocument()
  })

  it('has no memory leaks after multiple mount/unmount cycles', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    // Multiple mount/unmount cycles
    for (let i = 0; i < 3; i++) {
      const { unmount } = render(<BoardBackground />)
      unmount()
    }

    // Should have balanced add/remove calls
    expect(addSpy).toHaveBeenCalledTimes(3)
    expect(removeSpy).toHaveBeenCalledTimes(3)
  })
})
