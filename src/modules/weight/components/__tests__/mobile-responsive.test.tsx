import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeightEntryForm } from '../WeightEntryForm'
import { WeightEditForm } from '../WeightEditForm'
import { WeightAnalytics } from '../WeightAnalytics'
import { WeightPeriodView } from '../WeightPeriodView'

// Mock window.matchMedia for responsive testing
const mockMatchMedia = (width: number) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: query.includes(`${width}px`),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('WeightEntryForm Mobile Responsiveness', () => {
  test('form inputs should be properly sized for touch on Galaxy S24 Ultra', () => {
    mockMatchMedia(412) // Galaxy S24 Ultra width
    
    render(<WeightEntryForm onSubmit={vi.fn()} />)
    
    const weightInput = screen.getByLabelText(/weight/i)
    const dateInput = screen.getByLabelText(/date/i)
    const submitButton = screen.getByRole('button', { name: /add weight/i })
    
    // Touch targets should be at least 44px high
    expect(weightInput).toHaveStyle('min-height: 44px')
    expect(dateInput).toHaveStyle('min-height: 44px')
    expect(submitButton).toHaveStyle('min-height: 44px')
    
    // Form should have mobile-appropriate spacing
    const form = screen.getByRole('form')
    expect(form).toHaveClass('mobile-form-spacing')
  })

  test('form layout should adapt to mobile viewport', () => {
    mockMatchMedia(375) // iPhone viewport
    
    render(<WeightEntryForm onSubmit={vi.fn()} />)
    
    const form = screen.getByRole('form')
    expect(form).toHaveClass('mobile-layout')
    expect(form).toHaveStyle('padding: 16px')
  })

  test('buttons should meet minimum touch target size', () => {
    render(<WeightEntryForm onSubmit={vi.fn()} />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      const styles = window.getComputedStyle(button)
      const height = parseInt(styles.height)
      const width = parseInt(styles.width)
      
      expect(height).toBeGreaterThanOrEqual(44)
      expect(width).toBeGreaterThanOrEqual(44)
    })
  })
})

describe('WeightEditForm Mobile Responsiveness', () => {
  const mockEntry = {
    id: '1',
    dateISO: '2024-01-01',
    kg: 70
  }

  test('edit form should be touch-friendly', () => {
    render(
      <WeightEditForm 
        entry={mockEntry}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    
    const inputs = screen.getAllByRole('textbox')
    inputs.forEach(input => {
      expect(input).toHaveStyle('min-height: 44px')
      expect(input).toHaveStyle('padding: 12px')
    })
  })

  test('action buttons should have proper spacing for touch', () => {
    render(
      <WeightEditForm 
        entry={mockEntry}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )
    
    const saveButton = screen.getByRole('button', { name: /save/i })
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    
    expect(saveButton).toHaveStyle('min-height: 44px')
    expect(cancelButton).toHaveStyle('min-height: 44px')
    
    // Buttons should have adequate spacing between them
    const buttonContainer = saveButton.parentElement
    expect(buttonContainer).toHaveStyle('gap: 12px')
  })
})

describe('WeightAnalytics Mobile Responsiveness', () => {
  const mockWeights = [
    { id: '1', dateISO: '2024-01-01', kg: 70 },
    { id: '2', dateISO: '2024-01-02', kg: 69.5 }
  ]

  test('analytics cards should stack properly on mobile', () => {
    mockMatchMedia(375)
    
    render(<WeightAnalytics weights={mockWeights} />)
    
    const container = screen.getByTestId('analytics-container')
    expect(container).toHaveClass('mobile-stack')
    expect(container).toHaveStyle('flex-direction: column')
  })

  test('trend cards should be touch-friendly when clickable', () => {
    render(<WeightAnalytics weights={mockWeights} />)
    
    const trendCards = screen.getAllByTestId(/trend-card/)
    trendCards.forEach(card => {
      if (card.getAttribute('role') === 'button') {
        expect(card).toHaveStyle('min-height: 44px')
        expect(card).toHaveStyle('cursor: pointer')
      }
    })
  })

  test('text should remain readable at mobile sizes', () => {
    mockMatchMedia(375)
    
    render(<WeightAnalytics weights={mockWeights} />)
    
    const textElements = screen.getAllByText(/\d+/)
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element)
      const fontSize = parseInt(styles.fontSize)
      expect(fontSize).toBeGreaterThanOrEqual(14)
    })
  })
})

describe('WeightPeriodView Mobile Responsiveness', () => {
  const mockWeights = [
    { id: '1', dateISO: '2024-01-01', kg: 70 },
    { id: '2', dateISO: '2024-01-02', kg: 69.5 }
  ]

  test('period view should be mobile-responsive', () => {
    render(
      <WeightPeriodView 
        weights={mockWeights}
        period={7}
        onClose={vi.fn()}
      />
    )
    
    const container = screen.getByTestId('period-view-container')
    expect(container).toHaveClass('mobile-responsive')
    expect(container).toHaveStyle('max-height: 70vh')
  })

  test('close button should be easily tappable', () => {
    render(
      <WeightPeriodView 
        weights={mockWeights}
        period={7}
        onClose={vi.fn()}
      />
    )
    
    const closeButton = screen.getByRole('button', { name: /close/i })
    expect(closeButton).toHaveStyle('min-height: 44px')
    expect(closeButton).toHaveStyle('min-width: 44px')
  })

  test('weight entries should be scrollable with touch-friendly spacing', () => {
    render(
      <WeightPeriodView 
        weights={mockWeights}
        period={7}
        onClose={vi.fn()}
      />
    )
    
    const scrollContainer = screen.getByTestId('entries-scroll-container')
    expect(scrollContainer).toHaveStyle('overflow-y: auto')
    expect(scrollContainer).toHaveStyle('-webkit-overflow-scrolling: touch')
    
    const entries = screen.getAllByTestId(/weight-entry/)
    entries.forEach(entry => {
      expect(entry).toHaveStyle('padding: 12px 0')
    })
  })
}) 