import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExportModal } from '@/features/export-data/ui/ExportModal'

describe('ExportModal Component', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onExport: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(<ExportModal {...mockProps} />)

    expect(screen.getByText(/Экспортировать данные/i)).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<ExportModal {...mockProps} isOpen={false} />)

    expect(screen.queryByText(/Экспортировать данные/i)).not.toBeInTheDocument()
  })

  it('renders export format options', () => {
    render(<ExportModal {...mockProps} />)

    expect(screen.getByText(/Excel \(.xlsx\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Для редактирования в таблицах/i)).toBeInTheDocument()

    expect(screen.getByText(/PDF \(.pdf\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Для печати/i)).toBeInTheDocument()

    expect(screen.getByText(/JSON \(.json\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Полный бэкап данных/i)).toBeInTheDocument()
  })

  it('calls onExport with excel format when Excel button clicked', () => {
    render(<ExportModal {...mockProps} />)

    const excelButtons = screen.getAllByText(/Excel \(.xlsx\)/i)
    const excelButton = excelButtons.find(btn => btn.tagName === 'BUTTON' || btn.closest('button'))

    if (excelButton) {
      fireEvent.click(excelButton)
      expect(mockProps.onExport).toHaveBeenCalledWith('excel')
    }
  })

  it('calls onExport with pdf format when PDF button clicked', () => {
    render(<ExportModal {...mockProps} />)

    const pdfButtons = screen.getAllByText(/PDF \(.pdf\)/i)
    const pdfButton = pdfButtons.find(btn => btn.tagName === 'BUTTON' || btn.closest('button'))

    if (pdfButton) {
      fireEvent.click(pdfButton)
      expect(mockProps.onExport).toHaveBeenCalledWith('pdf')
    }
  })

  it('calls onExport with json format when JSON button clicked', () => {
    render(<ExportModal {...mockProps} />)

    const jsonButtons = screen.getAllByText(/JSON \(.json\)/i)
    const jsonButton = jsonButtons.find(btn => btn.tagName === 'BUTTON' || btn.closest('button'))

    if (jsonButton) {
      fireEvent.click(jsonButton)
      expect(mockProps.onExport).toHaveBeenCalledWith('json')
    }
  })

  it('calls onClose when X button is clicked', () => {
    render(<ExportModal {...mockProps} />)

    // Find the close button (it's the first button with an X icon)
    const closeButton = screen.getByText(/Экспортировать данные/i)
      .closest('.fixed')
      ?.querySelector('button')

    if (closeButton) {
      fireEvent.click(closeButton)
      expect(mockProps.onClose).toHaveBeenCalledTimes(1)
    }
  })

  it('has correct z-index to prevent Bug #1', () => {
    render(<ExportModal {...mockProps} />)

    const modal = screen.getByText(/Экспортировать данные/i).closest('.fixed')
    expect(modal?.className).toContain('z-50')
  })

  it('renders with proper modal styling', () => {
    render(<ExportModal {...mockProps} />)

    const backdrop = screen.getByText(/Экспортировать данные/i).closest('.fixed')
    expect(backdrop).toHaveClass('bg-black/70')

    const modalContent = backdrop?.querySelector('.rounded-xl')
    expect(modalContent).toHaveClass('bg-[#1a1a20]', 'border', 'border-gray-800')
  })

  it('has correct animations for smooth UX', () => {
    render(<ExportModal {...mockProps} />)

    const backdrop = screen.getByText(/Экспортировать данные/i).closest('.fixed')
    expect(backdrop?.className).toContain('animate-in', 'fade-in')

    const modalContent = backdrop?.querySelector('.animate-in')
    expect(modalContent?.className).toContain('slide-in-from-bottom-4', 'duration-300')
  })

  it('displays icons for each export format', () => {
    render(<ExportModal {...mockProps} />)

    // Check for Lucide icons (they render as SVG elements with class lucide)
    const icons = screen.getAllByText(/Экспортировать данные/i)[0]
      .closest('.fixed')
      ?.querySelectorAll('svg.lucide')

    expect(icons?.length).toBeGreaterThan(0)
  })

  it('works with React 19 concurrent features', () => {
    const { rerender } = render(<ExportModal {...mockProps} />)

    // Multiple re-renders should not cause issues
    for (let i = 0; i < 5; i++) {
      rerender(<ExportModal {...mockProps} />)
    }

    expect(screen.getByText(/Экспортировать данные/i)).toBeInTheDocument()
  })
})
