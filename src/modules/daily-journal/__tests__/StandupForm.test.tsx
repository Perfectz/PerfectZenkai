import React from 'react'
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StandupForm } from '../components/StandupForm'

// Mock the daily journal store
const mockUseDailyJournalStore = vi.fn()
vi.mock('../stores/dailyJournalStore', () => ({
  useDailyJournalStore: () => mockUseDailyJournalStore()
}))

describe('StandupForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  
  const defaultStoreState = {
    createStandup: vi.fn(),
    isLoading: false,
    error: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDailyJournalStore.mockReturnValue(defaultStoreState)
  })

  test('should render all standup form sections', () => {
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    // Yesterday's Review section
    expect(screen.getByText(/yesterday's review/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/what did you accomplish/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/what blocked you/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/key lesson learned/i)).toBeInTheDocument()
    
    // Today's Planning section
    expect(screen.getByText(/today's planning/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/energy level/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/current mood/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/available hours/i)).toBeInTheDocument()
    
    // Priorities section
    expect(screen.getByText(/today's priorities/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add priority/i })).toBeInTheDocument()
  })

  test('should handle energy level slider interaction', async () => {
    const user = userEvent.setup()
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const energySlider = screen.getByLabelText(/energy level/i)
    
    await user.clear(energySlider)
    await user.type(energySlider, '8')
    
    expect(energySlider).toHaveValue('8')
  })

  test('should handle mood selection', async () => {
    const user = userEvent.setup()
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const moodSelect = screen.getByLabelText(/current mood/i)
    
    await user.selectOptions(moodSelect, 'optimistic')
    
    expect(moodSelect).toHaveValue('optimistic')
  })

  test('should add and remove priorities', async () => {
    const user = userEvent.setup()
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const addPriorityButton = screen.getByRole('button', { name: /add priority/i })
    
    // Add first priority
    await user.click(addPriorityButton)
    
    expect(screen.getByPlaceholderText(/describe your priority/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/importance/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/urgency/i)).toBeInTheDocument()
    
    // Fill in priority details
    const descriptionInput = screen.getByPlaceholderText(/describe your priority/i)
    await user.type(descriptionInput, 'Complete project setup')
    
    const importanceSelect = screen.getByLabelText(/importance/i)
    await user.selectOptions(importanceSelect, '5')
    
    const urgencySelect = screen.getByLabelText(/urgency/i)
    await user.selectOptions(urgencySelect, '4')
    
    expect(descriptionInput).toHaveValue('Complete project setup')
    expect(importanceSelect).toHaveValue('5')
    expect(urgencySelect).toHaveValue('4')
    
    // Remove priority
    const removeButton = screen.getByRole('button', { name: /remove priority/i })
    await user.click(removeButton)
    
    expect(screen.queryByPlaceholderText(/describe your priority/i)).not.toBeInTheDocument()
  })

  test('should validate required fields before submission', async () => {
    const user = userEvent.setup()
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByRole('button', { name: /start day/i })
    await user.click(submitButton)
    
    // Should show validation errors for required fields
    expect(screen.getByText(/energy level is required/i)).toBeInTheDocument()
    expect(screen.getByText(/mood is required/i)).toBeInTheDocument()
    expect(screen.getByText(/available hours is required/i)).toBeInTheDocument()
  })

  test('should submit valid standup data', async () => {
    const user = userEvent.setup()
    const mockCreateStandup = vi.fn().mockResolvedValue({ id: 'standup-123' })
    mockUseDailyJournalStore.mockReturnValue({
      ...defaultStoreState,
      createStandup: mockCreateStandup
    })
    
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/energy level/i), '8')
    await user.selectOptions(screen.getByLabelText(/current mood/i), 'focused')
    await user.type(screen.getByLabelText(/available hours/i), '6')
    
    // Add accomplishments
    await user.type(
      screen.getByLabelText(/what did you accomplish/i),
      'Fixed critical bug, Completed code review'
    )
    
    // Add a priority
    await user.click(screen.getByRole('button', { name: /add priority/i }))
    await user.type(screen.getByPlaceholderText(/describe your priority/i), 'Implement authentication')
    await user.selectOptions(screen.getByLabelText(/importance/i), '5')
    await user.selectOptions(screen.getByLabelText(/urgency/i), '4')
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /start day/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateStandup).toHaveBeenCalledWith(
        expect.objectContaining({
          todayEnergyLevel: 8,
          todayMood: 'focused',
          todayAvailableHours: 6,
          yesterdayAccomplishments: ['Fixed critical bug', 'Completed code review'],
          todayPriorities: expect.arrayContaining([
            expect.objectContaining({
              description: 'Implement authentication',
              importance: 5,
              urgency: 4
            })
          ])
        })
      )
    })
  })

  test('should show loading state during submission', async () => {
    // const _user = userEvent.setup()
    mockUseDailyJournalStore.mockReturnValue({
      ...defaultStoreState,
      isLoading: true
    })
    
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const submitButton = screen.getByRole('button', { name: /starting day/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  test('should display error messages', () => {
    mockUseDailyJournalStore.mockReturnValue({
      ...defaultStoreState,
      error: 'Failed to save standup'
    })
    
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    expect(screen.getByText(/failed to save standup/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  test('should handle priority drag and drop reordering', async () => {
    const user = userEvent.setup()
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    // Add multiple priorities
    const addButton = screen.getByRole('button', { name: /add priority/i })
    await user.click(addButton)
    await user.click(addButton)
    
    const priorities = screen.getAllByTestId('priority-item')
    expect(priorities).toHaveLength(2)
    
    // Test drag handle presence
    expect(screen.getAllByTestId('drag-handle')).toHaveLength(2)
  })

  test('should calculate and display total estimated time', async () => {
    const user = userEvent.setup()
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    // Add priority with estimated time
    await user.click(screen.getByRole('button', { name: /add priority/i }))
    await user.type(screen.getByLabelText(/estimated time/i), '90')
    
    await user.click(screen.getByRole('button', { name: /add priority/i }))
    await user.type(screen.getAllByLabelText(/estimated time/i)[1], '60')
    
    expect(screen.getByText(/total estimated time: 150 minutes/i)).toBeInTheDocument()
  })

  test('should show AI quick insights when available', () => {
    const mockInsights = [
      'Based on your patterns, focus on deep work during 10-12 AM',
      'Consider tackling high-importance tasks first when your energy is high'
    ]
    
    render(
      <StandupForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiInsights={mockInsights}
      />
    )
    
    expect(screen.getByText(/ai insights/i)).toBeInTheDocument()
    expect(screen.getByText(/focus on deep work during 10-12 AM/i)).toBeInTheDocument()
    expect(screen.getByText(/consider tackling high-importance tasks/i)).toBeInTheDocument()
  })

  test('should link priorities to existing goals and tasks', async () => {
    const user = userEvent.setup()
    const mockGoals = [
      { id: 'goal-1', title: 'Fitness Goal' },
      { id: 'goal-2', title: 'Career Goal' }
    ]
    const mockTasks = [
      { id: 'task-1', title: 'Morning workout' },
      { id: 'task-2', title: 'Complete project' }
    ]
    
    render(
      <StandupForm 
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        availableGoals={mockGoals}
        availableTasks={mockTasks}
      />
    )
    
    // Add priority and link to goal
    await user.click(screen.getByRole('button', { name: /add priority/i }))
    
    const linkGoalSelect = screen.getByLabelText(/link to goal/i)
    await user.selectOptions(linkGoalSelect, 'goal-1')
    
    expect(linkGoalSelect).toHaveValue('goal-1')
  })

  test('should save draft automatically', async () => {
    const user = userEvent.setup()
    const mockSaveDraft = vi.fn()
    mockUseDailyJournalStore.mockReturnValue({
      ...defaultStoreState,
      saveDraft: mockSaveDraft
    })
    
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    // Type in energy level
    await user.type(screen.getByLabelText(/energy level/i), '7')
    
    // Wait for auto-save debounce
    await waitFor(() => {
      expect(mockSaveDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          todayEnergyLevel: 7
        })
      )
    }, { timeout: 2000 })
  })

  test('should handle cancel action', async () => {
    const user = userEvent.setup()
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  test('should be accessible', () => {
    render(<StandupForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)
    
    // Check for proper ARIA labels
    expect(screen.getByLabelText(/energy level/i)).toHaveAttribute('aria-describedby')
    expect(screen.getByLabelText(/current mood/i)).toHaveAttribute('aria-describedby')
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2, name: /yesterday's review/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /today's planning/i })).toBeInTheDocument()
    
    // Check for form validation announcements
    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('aria-live', 'polite')
  })
}) 