import { describe, test, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReflectionForm } from '../components/ReflectionForm'
import { DailyStandup } from '../types/reflection.types'

// Mock the daily journal store
const mockUseDailyJournalStore = vi.fn()
vi.mock('../stores/dailyJournalStore', () => ({
  useDailyJournalStore: () => mockUseDailyJournalStore()
}))

describe('ReflectionForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()
  
  const mockStandup: DailyStandup = {
    id: 'standup-123',
    userId: 'user-123',
    date: '2024-01-15',
    yesterdayAccomplishments: [],
    yesterdayBlockers: [],
    yesterdayLessons: '',
    todayPriorities: [
      {
        id: 'p1',
        description: 'Complete project setup',
        category: 'work',
        estimatedTime: 120,
        importance: 5,
        urgency: 4,
        linkedTaskIds: []
      },
      {
        id: 'p2',
        description: 'Review documentation',
        category: 'work',
        estimatedTime: 60,
        importance: 3,
        urgency: 2,
        linkedTaskIds: []
      }
    ],
    todayEnergyLevel: 8,
    todayMood: 'focused',
    todayAvailableHours: 6,
    todayFocusAreas: [],
    currentChallenges: [],
    neededResources: [],
    motivationLevel: 8,
    createdAt: '2024-01-15T08:00:00Z',
    completionTime: 180
  }
  
  const defaultStoreState = {
    createReflection: vi.fn(),
    isLoading: false,
    error: null
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseDailyJournalStore.mockReturnValue(defaultStoreState)
  })

  test('should render all reflection form sections', () => {
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    // Progress Assessment section
    expect(screen.getByText(/progress assessment/i)).toBeInTheDocument()
    expect(screen.getByText(/complete project setup/i)).toBeInTheDocument()
    expect(screen.getByText(/review documentation/i)).toBeInTheDocument()
    
    // Goal Progress section
    expect(screen.getByText(/goal progress/i)).toBeInTheDocument()
    
    // Energy & Mood section
    expect(screen.getByText(/energy & mood/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end energy level/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/end mood/i)).toBeInTheDocument()
    
    // Reflection section
    expect(screen.getByText(/daily reflection/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/day's highlights/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/lessons learned/i)).toBeInTheDocument()
    
    // Tomorrow Preparation section
    expect(screen.getByText(/tomorrow preparation/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tomorrow's priorities/i)).toBeInTheDocument()
  })

  test('should handle priority completion status selection', async () => {
    const user = userEvent.setup()
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    // Mark first priority as completed
    const completedRadio = screen.getByRole('radio', { 
      name: /complete project setup.*completed/i 
    })
    await user.click(completedRadio)
    
    expect(completedRadio).toBeChecked()
    
    // Mark second priority as partial
    const partialRadio = screen.getByRole('radio', { 
      name: /review documentation.*partial/i 
    })
    await user.click(partialRadio)
    
    expect(partialRadio).toBeChecked()
  })

  test('should handle energy and mood tracking', async () => {
    const user = userEvent.setup()
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    // Set end energy level
    const energySlider = screen.getByLabelText(/end energy level/i)
    await user.clear(energySlider)
    await user.type(energySlider, '6')
    
    expect(energySlider).toHaveValue('6')
    
    // Set end mood
    const moodSelect = screen.getByLabelText(/end mood/i)
    await user.selectOptions(moodSelect, 'satisfied')
    
    expect(moodSelect).toHaveValue('satisfied')
  })

  test('should handle satisfaction score input', async () => {
    const user = userEvent.setup()
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    const satisfactionSlider = screen.getByLabelText(/satisfaction score/i)
    await user.clear(satisfactionSlider)
    await user.type(satisfactionSlider, '8')
    
    expect(satisfactionSlider).toHaveValue('8')
  })

  test('should add and remove day highlights', async () => {
    const user = userEvent.setup()
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    const addHighlightButton = screen.getByRole('button', { name: /add highlight/i })
    
    // Add first highlight
    await user.click(addHighlightButton)
    
    const highlightInput = screen.getByPlaceholderText(/what went well today/i)
    await user.type(highlightInput, 'Successfully completed authentication feature')
    
    expect(highlightInput).toHaveValue('Successfully completed authentication feature')
    
    // Add second highlight
    await user.click(addHighlightButton)
    
    const highlightInputs = screen.getAllByPlaceholderText(/what went well today/i)
    expect(highlightInputs).toHaveLength(2)
    
    // Remove first highlight
    const removeButtons = screen.getAllByRole('button', { name: /remove highlight/i })
    await user.click(removeButtons[0])
    
    expect(screen.getAllByPlaceholderText(/what went well today/i)).toHaveLength(1)
  })

  test('should handle unexpected tasks input', async () => {
    const user = userEvent.setup()
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    const unexpectedTasksInput = screen.getByLabelText(/unexpected tasks/i)
    await user.type(unexpectedTasksInput, 'Emergency bug fix, Client meeting')
    
    expect(unexpectedTasksInput).toHaveValue('Emergency bug fix, Client meeting')
  })

  test('should validate required fields before submission', async () => {
    const user = userEvent.setup()
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /complete reflection/i })
    await user.click(submitButton)
    
    // Should show validation errors for required fields
    expect(screen.getByText(/end energy level is required/i)).toBeInTheDocument()
    expect(screen.getByText(/end mood is required/i)).toBeInTheDocument()
    expect(screen.getByText(/satisfaction score is required/i)).toBeInTheDocument()
  })

  test('should submit valid reflection data', async () => {
    const user = userEvent.setup()
    const mockCreateReflection = vi.fn().mockResolvedValue({ id: 'reflection-123' })
    mockUseDailyJournalStore.mockReturnValue({
      ...defaultStoreState,
      createReflection: mockCreateReflection
    })
    
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    // Mark priorities completion status
    await user.click(screen.getByRole('radio', { name: /complete project setup.*completed/i }))
    await user.click(screen.getByRole('radio', { name: /review documentation.*partial/i }))
    
    // Fill in required fields
    await user.type(screen.getByLabelText(/end energy level/i), '6')
    await user.selectOptions(screen.getByLabelText(/end mood/i), 'satisfied')
    await user.type(screen.getByLabelText(/satisfaction score/i), '8')
    
    // Add highlights
    await user.click(screen.getByRole('button', { name: /add highlight/i }))
    await user.type(screen.getByPlaceholderText(/what went well today/i), 'Great progress on project')
    
    // Add lessons learned
    await user.type(
      screen.getByLabelText(/lessons learned/i),
      'Need to allocate more time for documentation review'
    )
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /complete reflection/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockCreateReflection).toHaveBeenCalledWith(
        expect.objectContaining({
          standupId: 'standup-123',
          prioritiesCompleted: ['p1'],
          prioritiesPartial: ['p2'],
          prioritiesSkipped: [],
          endEnergyLevel: 6,
          endMood: 'satisfied',
          satisfactionScore: 8,
          dayHighlights: ['Great progress on project'],
          lessonsLearned: 'Need to allocate more time for documentation review'
        })
      )
    })
  })

  test('should show loading state during submission', async () => {
    mockUseDailyJournalStore.mockReturnValue({
      ...defaultStoreState,
      isLoading: true
    })
    
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    const submitButton = screen.getByRole('button', { name: /completing reflection/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  test('should display error messages', () => {
    mockUseDailyJournalStore.mockReturnValue({
      ...defaultStoreState,
      error: 'Failed to save reflection'
    })
    
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    expect(screen.getByText(/failed to save reflection/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  test('should calculate completion statistics', () => {
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    // Should show initial completion stats
    expect(screen.getByText(/0 of 2 priorities completed/i)).toBeInTheDocument()
    expect(screen.getByText(/completion rate: 0%/i)).toBeInTheDocument()
  })

  test('should handle goal progress tracking', async () => {
    const user = userEvent.setup()
    const mockGoals = [
      { id: 'goal-1', title: 'Career Development' },
      { id: 'goal-2', title: 'Health & Fitness' }
    ]
    
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        availableGoals={mockGoals}
      />
    )
    
    const addGoalProgressButton = screen.getByRole('button', { name: /add goal progress/i })
    await user.click(addGoalProgressButton)
    
    // Select goal
    const goalSelect = screen.getByLabelText(/select goal/i)
    await user.selectOptions(goalSelect, 'goal-1')
    
    // Add progress description
    const progressInput = screen.getByLabelText(/progress made/i)
    await user.type(progressInput, 'Completed online course module')
    
    // Set progress percentage
    const progressSlider = screen.getByLabelText(/percent complete/i)
    await user.clear(progressSlider)
    await user.type(progressSlider, '75')
    
    expect(goalSelect).toHaveValue('goal-1')
    expect(progressInput).toHaveValue('Completed online course module')
    expect(progressSlider).toHaveValue('75')
  })

  test('should handle energy peaks and dips tracking', async () => {
    const user = userEvent.setup()
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    // Add energy peak
    const addPeakButton = screen.getByRole('button', { name: /add energy peak/i })
    await user.click(addPeakButton)
    
    const peakTimeInput = screen.getByLabelText(/peak time/i)
    await user.type(peakTimeInput, '10:00')
    
    // Add energy dip
    const addDipButton = screen.getByRole('button', { name: /add energy dip/i })
    await user.click(addDipButton)
    
    const dipTimeInput = screen.getByLabelText(/dip time/i)
    await user.type(dipTimeInput, '15:00')
    
    expect(peakTimeInput).toHaveValue('10:00')
    expect(dipTimeInput).toHaveValue('15:00')
  })

  test('should save draft automatically', async () => {
    const user = userEvent.setup()
    const mockSaveDraft = vi.fn()
    mockUseDailyJournalStore.mockReturnValue({
      ...defaultStoreState,
      saveDraft: mockSaveDraft
    })
    
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    // Type in satisfaction score
    await user.type(screen.getByLabelText(/satisfaction score/i), '7')
    
    // Wait for auto-save debounce
    await waitFor(() => {
      expect(mockSaveDraft).toHaveBeenCalledWith(
        expect.objectContaining({
          satisfactionScore: 7
        })
      )
    }, { timeout: 2000 })
  })

  test('should show AI insights when available', () => {
    const mockInsights = [
      'Your productivity peaks at 10 AM - consider scheduling important tasks then',
      'You complete 40% more tasks on days when you start with high energy'
    ]
    
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel}
        aiInsights={mockInsights}
      />
    )
    
    expect(screen.getByText(/ai insights/i)).toBeInTheDocument()
    expect(screen.getByText(/productivity peaks at 10 AM/i)).toBeInTheDocument()
    expect(screen.getByText(/40% more tasks on days/i)).toBeInTheDocument()
  })

  test('should handle cancel action', async () => {
    const user = userEvent.setup()
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)
    
    expect(mockOnCancel).toHaveBeenCalled()
  })

  test('should be accessible', () => {
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    // Check for proper ARIA labels
    expect(screen.getByLabelText(/end energy level/i)).toHaveAttribute('aria-describedby')
    expect(screen.getByLabelText(/satisfaction score/i)).toHaveAttribute('aria-describedby')
    
    // Check for proper heading structure
    expect(screen.getByRole('heading', { level: 2, name: /progress assessment/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: /daily reflection/i })).toBeInTheDocument()
    
    // Check for form validation announcements
    const form = screen.getByRole('form')
    expect(form).toHaveAttribute('aria-live', 'polite')
  })

  test('should handle tomorrow preparation input', async () => {
    const user = userEvent.setup()
    render(
      <ReflectionForm 
        standup={mockStandup}
        onSubmit={mockOnSubmit} 
        onCancel={mockOnCancel} 
      />
    )
    
    // Add tomorrow's priorities
    await user.type(
      screen.getByLabelText(/tomorrow's priorities/i),
      'Finish API integration, Review pull requests'
    )
    
    // Add concerns
    await user.type(
      screen.getByLabelText(/tomorrow's concerns/i),
      'Potential deployment issues'
    )
    
    // Add opportunities
    await user.type(
      screen.getByLabelText(/tomorrow's opportunities/i),
      'New feature brainstorming session'
    )
    
    expect(screen.getByLabelText(/tomorrow's priorities/i)).toHaveValue('Finish API integration, Review pull requests')
    expect(screen.getByLabelText(/tomorrow's concerns/i)).toHaveValue('Potential deployment issues')
    expect(screen.getByLabelText(/tomorrow's opportunities/i)).toHaveValue('New feature brainstorming session')
  })
}) 