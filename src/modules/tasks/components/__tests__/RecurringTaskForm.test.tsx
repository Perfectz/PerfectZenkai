import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { RecurringTaskForm } from '../RecurringTaskForm'
import { RecurrenceType } from '../../types'

describe('RecurringTaskForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isLoading: false
  }

  beforeEach(() => {
    mockOnSubmit.mockClear()
    mockOnCancel.mockClear()
  })

  describe('Form Rendering', () => {
    test('should render all form fields', () => {
      render(<RecurringTaskForm {...defaultProps} />)

      expect(screen.getByLabelText(/task summary/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/points/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/recurrence type/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create recurring task/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    test('should show interval field for all recurrence types', () => {
      render(<RecurringTaskForm {...defaultProps} />)

      // Select daily recurrence
      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'daily' } })
      expect(screen.getByLabelText(/every.*days/i)).toBeInTheDocument()

      // Select weekly recurrence
      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'weekly' } })
      expect(screen.getByLabelText(/every.*weeks/i)).toBeInTheDocument()

      // Select monthly recurrence
      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'monthly' } })
      expect(screen.getByLabelText(/every.*months/i)).toBeInTheDocument()
    })

    test('should show days of week selection for weekly recurrence', () => {
      render(<RecurringTaskForm {...defaultProps} />)

      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'weekly' } })

      // Check for day checkboxes
      expect(screen.getByLabelText(/monday/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tuesday/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/wednesday/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/thursday/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/friday/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/saturday/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/sunday/i)).toBeInTheDocument()
    })

    test('should show optional end date and max occurrences fields', () => {
      render(<RecurringTaskForm {...defaultProps} />)

      expect(screen.getByLabelText(/end date.*optional/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/max occurrences.*optional/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    test('should require task summary', async () => {
      render(<RecurringTaskForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /create recurring task/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/task summary is required/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('should require at least one day for weekly recurrence', async () => {
      render(<RecurringTaskForm {...defaultProps} />)

      fireEvent.change(screen.getByLabelText(/task summary/i), { target: { value: 'Test task' } })
      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'weekly' } })

      const submitButton = screen.getByRole('button', { name: /create recurring task/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/select at least one day/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('should validate interval is positive', async () => {
      render(<RecurringTaskForm {...defaultProps} />)

      fireEvent.change(screen.getByLabelText(/task summary/i), { target: { value: 'Test task' } })
      fireEvent.change(screen.getByLabelText(/every.*days/i), { target: { value: '0' } })

      const submitButton = screen.getByRole('button', { name: /create recurring task/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/interval must be at least 1/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    test('should validate end date is in future', async () => {
      render(<RecurringTaskForm {...defaultProps} />)

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayString = yesterday.toISOString().split('T')[0]

      fireEvent.change(screen.getByLabelText(/task summary/i), { target: { value: 'Test task' } })
      fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: yesterdayString } })

      const submitButton = screen.getByRole('button', { name: /create recurring task/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/end date must be in the future/i)).toBeInTheDocument()
      })
      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    test('should submit daily recurring task with correct data', async () => {
      render(<RecurringTaskForm {...defaultProps} />)

      // Fill form
      fireEvent.change(screen.getByLabelText(/task summary/i), { target: { value: 'Daily workout' } })
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: '30 min exercise' } })
      fireEvent.change(screen.getByLabelText(/priority/i), { target: { value: 'high' } })
      fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'health' } })
      fireEvent.change(screen.getByLabelText(/points/i), { target: { value: '8' } })
      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'daily' } })
      fireEvent.change(screen.getByLabelText(/every.*days/i), { target: { value: '1' } })

      const submitButton = screen.getByRole('button', { name: /create recurring task/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          summary: 'Daily workout',
          description: '30 min exercise',
          priority: 'high',
          category: 'health',
          points: 8,
          recurrence: {
            type: 'daily',
            interval: 1
          }
        })
      })
    })

    test('should submit weekly recurring task with selected days', async () => {
      render(<RecurringTaskForm {...defaultProps} />)

      // Fill form
      fireEvent.change(screen.getByLabelText(/task summary/i), { target: { value: 'Weekly meeting' } })
      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'weekly' } })
      fireEvent.change(screen.getByLabelText(/every.*weeks/i), { target: { value: '1' } })

      // Select Monday and Friday
      fireEvent.click(screen.getByLabelText(/monday/i))
      fireEvent.click(screen.getByLabelText(/friday/i))

      const submitButton = screen.getByRole('button', { name: /create recurring task/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          recurrence: {
            type: 'weekly',
            interval: 1,
            daysOfWeek: [1, 5] // Monday = 1, Friday = 5
          }
        }))
      })
    })

    test('should submit with optional end date and max occurrences', async () => {
      render(<RecurringTaskForm {...defaultProps} />)

      const futureDate = new Date()
      futureDate.setMonth(futureDate.getMonth() + 3)
      const futureDateString = futureDate.toISOString().split('T')[0]

      // Fill form with optional fields
      fireEvent.change(screen.getByLabelText(/task summary/i), { target: { value: 'Limited task' } })
      fireEvent.change(screen.getByLabelText(/end date/i), { target: { value: futureDateString } })
      fireEvent.change(screen.getByLabelText(/max occurrences/i), { target: { value: '30' } })

      const submitButton = screen.getByRole('button', { name: /create recurring task/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          recurrence: expect.objectContaining({
            endDate: futureDateString,
            maxOccurrences: 30
          })
        }))
      })
    })
  })

  describe('Form Interactions', () => {
    test('should call onCancel when cancel button clicked', () => {
      render(<RecurringTaskForm {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })

    test('should disable submit button when loading', () => {
      render(<RecurringTaskForm {...defaultProps} isLoading={true} />)

      const submitButton = screen.getByRole('button', { name: /creating.../i })
      expect(submitButton).toBeDisabled()
    })

    test('should reset days selection when changing from weekly to other type', () => {
      render(<RecurringTaskForm {...defaultProps} />)

      // Select weekly and choose days
      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'weekly' } })
      fireEvent.click(screen.getByLabelText(/monday/i))

      // Change to daily
      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'daily' } })

      // Change back to weekly - days should be reset
      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'weekly' } })
      expect(screen.getByLabelText(/monday/i)).not.toBeChecked()
    })
  })

  describe('Accessibility', () => {
    test('should have proper form labels and ARIA attributes', () => {
      render(<RecurringTaskForm {...defaultProps} />)

      // Check form has proper role
      expect(screen.getByRole('form')).toBeInTheDocument()

      // Check required fields have aria-required
      expect(screen.getByLabelText(/task summary/i)).toHaveAttribute('aria-required', 'true')

      // Check fieldsets for grouped controls
      fireEvent.change(screen.getByLabelText(/recurrence type/i), { target: { value: 'weekly' } })
      expect(screen.getByRole('group', { name: /days of week/i })).toBeInTheDocument()
    })

    test('should announce validation errors to screen readers', async () => {
      render(<RecurringTaskForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /create recurring task/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        const errorMessage = screen.getByText(/task summary is required/i)
        expect(errorMessage).toHaveAttribute('aria-live', 'polite')
      })
    })
  })
}) 