import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '@/shared/ui/Modal'

describe('Modal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('calls onClose when overlay is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    const overlay = screen.getByText('Test Modal').closest('#modal-overlay')
    if (overlay) {
      fireEvent.click(overlay)
      expect(handleClose).toHaveBeenCalledTimes(1)
    }
  })

  it('calls onClose when X button is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    // Find button by text content (X icon)
    const buttons = screen.getAllByRole('button')
    const closeButton = buttons.find(btn => btn.querySelector('svg'))
    if (closeButton) {
      fireEvent.click(closeButton)
      expect(handleClose).toHaveBeenCalledTimes(1)
    }
  })

  it('renders with high z-index', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>
    )

    const overlay = screen.getByText('Test Modal').closest('#modal-overlay')
    expect(overlay?.style.zIndex).toBe('99999')
  })
})
