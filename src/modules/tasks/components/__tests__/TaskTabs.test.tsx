import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TaskTabs, TaskTabType } from '../TaskTabs'
import { AnyTodo, RecurringTodo, Todo } from '../../types'

// Mock data
const mockRegularTodo: Todo = {
  id: '1',
  summary: 'Regular Task',
  done: false,
  priority: 'medium',
  category: 'work',
  points: 5,
  subtasks: [],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

const mockRecurringTodo: RecurringTodo = {
  id: '2',
  summary: 'Daily Exercise',
  isRecurring: true,
  priority: 'high',
  category: 'health',
  points: 8,
  subtasks: [],
  recurrence: {
    type: 'daily',
    interval: 1
  },
  status: 'active',
  completions: [],
  nextDueDate: '2025-01-02T08:00:00Z',
  currentStreak: 5,
  bestStreak: 10,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

const mockPausedRecurringTodo: RecurringTodo = {
  ...mockRecurringTodo,
  id: '3',
  summary: 'Paused Task',
  status: 'paused'
}

const mockTodos: AnyTodo[] = [mockRegularTodo, mockRecurringTodo, mockPausedRecurringTodo]

describe('TaskTabs', () => {
  const mockOnTabChange = vi.fn()
  
  beforeEach(() => {
    mockOnTabChange.mockClear()
  })

  test('renders all three tabs with correct labels and icons', () => {
    render(
      <TaskTabs
        todos={mockTodos}
        activeTab="all"
        onTabChange={mockOnTabChange}
      >
        <div>Tab content</div>
      </TaskTabs>
    )

    // Check tab labels and icons
    expect(screen.getByText('🔄')).toBeInTheDocument()
    expect(screen.getByText('Recurring')).toBeInTheDocument()
    expect(screen.getByText('⚡')).toBeInTheDocument()
    expect(screen.getByText('One-time')).toBeInTheDocument()
    expect(screen.getByText('📋')).toBeInTheDocument()
    expect(screen.getByText('All Tasks')).toBeInTheDocument()
  })

  test('displays correct counts for each tab type', () => {
    render(
      <TaskTabs
        todos={mockTodos}
        activeTab="all"
        onTabChange={mockOnTabChange}
      >
        <div>Tab content</div>
      </TaskTabs>
    )

    // All tasks: 3 total
    expect(screen.getByText('3')).toBeInTheDocument()
    
    // Recurring: 1 active (paused ones don't count)
    expect(screen.getByText('1')).toBeInTheDocument()
    
    // One-time: 1 regular todo
    // Note: The count appears twice - once for recurring (1) and once for one-time (1)
  })

  test('highlights active tab correctly', () => {
    render(
      <TaskTabs
        todos={mockTodos}
        activeTab="recurring"
        onTabChange={mockOnTabChange}
      >
        <div>Tab content</div>
      </TaskTabs>
    )

    const recurringTab = screen.getByRole('tab', { name: /🔄 Recurring 1/i })
    expect(recurringTab).toHaveClass('bg-primary', 'text-primary-foreground')
  })

  test('calls onTabChange when clicking different tabs', () => {
    render(
      <TaskTabs
        todos={mockTodos}
        activeTab="all"
        onTabChange={mockOnTabChange}
      >
        <div>Tab content</div>
      </TaskTabs>
    )

    const recurringTab = screen.getByRole('tab', { name: /🔄 Recurring 1/i })
    fireEvent.click(recurringTab)
    
    expect(mockOnTabChange).toHaveBeenCalledWith('recurring')
  })

  test('renders tab content with correct ARIA attributes', () => {
    render(
      <TaskTabs
        todos={mockTodos}
        activeTab="recurring"
        onTabChange={mockOnTabChange}
      >
        <div data-testid="tab-content">Recurring tasks content</div>
      </TaskTabs>
    )

    const tabPanel = screen.getByRole('tabpanel')
    expect(tabPanel).toHaveAttribute('id', 'tabpanel-recurring')
    expect(tabPanel).toHaveAttribute('aria-labelledby', 'tab-recurring')
    
    const content = screen.getByTestId('tab-content')
    expect(content).toBeInTheDocument()
  })

  test('handles empty todos list correctly', () => {
    render(
      <TaskTabs
        todos={[]}
        activeTab="all"
        onTabChange={mockOnTabChange}
      >
        <div>No tasks</div>
      </TaskTabs>
    )

    // Should not show any count badges when all counts are 0
    const badges = screen.queryAllByText(/^[0-9]+$/)
    expect(badges).toHaveLength(0)
  })

  test('accessibility: tabs have proper ARIA roles and properties', () => {
    render(
      <TaskTabs
        todos={mockTodos}
        activeTab="one-time"
        onTabChange={mockOnTabChange}
      >
        <div>Tab content</div>
      </TaskTabs>
    )

    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)

    tabs.forEach((tab, index) => {
      expect(tab).toHaveAttribute('aria-selected')
      expect(tab).toHaveAttribute('aria-controls')
    })

    // Active tab should have aria-selected="true"
    const oneTimeTab = screen.getByRole('tab', { name: /⚡ One-time 1/i })
    expect(oneTimeTab).toHaveAttribute('aria-selected', 'true')
  })

  test('mobile responsiveness: tabs have proper touch targets', () => {
    render(
      <TaskTabs
        todos={mockTodos}
        activeTab="all"
        onTabChange={mockOnTabChange}
      >
        <div>Tab content</div>
      </TaskTabs>
    )

    const tabs = screen.getAllByRole('tab')
    tabs.forEach(tab => {
      expect(tab).toHaveClass('min-h-[44px]') // 44px is minimum touch target
      expect(tab).toHaveClass('flex-1', 'sm:flex-none') // Responsive behavior
    })
  })

  test('filters recurring todos correctly - only active ones count', () => {
    const todosWithPaused: AnyTodo[] = [
      mockRegularTodo,
      mockRecurringTodo, // active
      mockPausedRecurringTodo, // paused
      {
        ...mockRecurringTodo,
        id: '4',
        summary: 'Another Active Task',
        status: 'active'
      } as RecurringTodo,
      {
        ...mockRecurringTodo,
        id: '5',
        summary: 'Completed Task',
        status: 'completed'
      } as RecurringTodo
    ]

    render(
      <TaskTabs
        todos={todosWithPaused}
        activeTab="recurring"
        onTabChange={mockOnTabChange}
      >
        <div>Tab content</div>
      </TaskTabs>
    )

    // Should show 2 active recurring tasks (not paused/completed ones)
    const recurringTab = screen.getByRole('tab', { name: /🔄 Recurring 2/i })
    expect(recurringTab).toBeInTheDocument()
  })
}) 