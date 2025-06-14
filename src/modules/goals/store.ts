import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { SimpleGoal, GoalProgress, GoalWithProgress, GoalCategory } from './types'
import { getRandomGoalColor } from './utils'

interface GoalsState {
  goals: SimpleGoal[]
  isLoading: boolean
  error: string | null

  // Goal Actions
  addGoal: (goal: Omit<SimpleGoal, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<SimpleGoal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  toggleGoalActive: (id: string) => Promise<void>
  loadGoals: () => Promise<void>

  // Progress Calculation
  calculateGoalProgress: (goalId: string, todos: any[]) => GoalProgress
  getGoalsWithProgress: (todos: any[]) => GoalWithProgress[]
  getActiveGoals: () => SimpleGoal[]
  getGoalsByCategory: (category: GoalCategory) => SimpleGoal[]

  // Utility Actions
  clearError: () => void
}

// Mock data for development
const mockGoals: SimpleGoal[] = [
  {
    id: '1',
    title: 'Get in Shape',
    category: 'health',
    description: 'Lose 20 pounds and build muscle',
    targetDate: '2024-06-01',
    color: '#10B981',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Learn TypeScript',
    category: 'learning',
    description: 'Master TypeScript for better development',
    targetDate: '2024-04-01',
    color: '#3B82F6',
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    title: 'Save for Vacation',
    category: 'finance',
    description: 'Save $3000 for summer vacation',
    color: '#F59E0B',
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
]

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: mockGoals,
  isLoading: false,
  error: null,

  addGoal: async (goalData) => {
    try {
      set({ isLoading: true, error: null })
      
      const now = new Date().toISOString()
      const newGoal: SimpleGoal = {
        id: uuidv4(),
        ...goalData,
        color: goalData.color || getRandomGoalColor(),
        createdAt: now,
        updatedAt: now,
      }

      set(state => ({
        goals: [newGoal, ...state.goals],
        isLoading: false,
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add goal',
        isLoading: false 
      })
    }
  },

  updateGoal: async (id, updates) => {
    try {
      set({ isLoading: true, error: null })
      
      const now = new Date().toISOString()
      set(state => ({
        goals: state.goals.map(goal =>
          goal.id === id 
            ? { ...goal, ...updates, updatedAt: now }
            : goal
        ),
        isLoading: false,
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update goal',
        isLoading: false 
      })
    }
  },

  deleteGoal: async (id) => {
    try {
      set({ isLoading: true, error: null })
      
      set(state => ({
        goals: state.goals.filter(goal => goal.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete goal',
        isLoading: false 
      })
    }
  },

  toggleGoalActive: async (id) => {
    try {
      const goal = get().goals.find(g => g.id === id)
      if (goal) {
        await get().updateGoal(id, { isActive: !goal.isActive })
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle goal status'
      })
    }
  },

  loadGoals: async () => {
    try {
      set({ isLoading: true, error: null })
      // In a real app, this would fetch from API/database
      // For now, we're using mock data
      set({ isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load goals',
        isLoading: false 
      })
    }
  },

  calculateGoalProgress: (goalId, todos) => {
    const goalTodos = todos.filter(todo => todo.goalId === goalId)
    const completedTodos = goalTodos.filter(todo => todo.done)
    
    return {
      goalId,
      totalTodos: goalTodos.length,
      completedTodos: completedTodos.length,
      progressPercentage: goalTodos.length > 0 
        ? Math.round((completedTodos.length / goalTodos.length) * 100)
        : 0,
      lastUpdated: new Date().toISOString(),
    }
  },

  getGoalsWithProgress: (todos) => {
    const { goals, calculateGoalProgress } = get()
    return goals.map(goal => ({
      ...goal,
      progress: calculateGoalProgress(goal.id, todos),
    }))
  },

  getActiveGoals: () => {
    return get().goals.filter(goal => goal.isActive)
  },

  getGoalsByCategory: (category) => {
    return get().goals.filter(goal => goal.category === category)
  },

  clearError: () => set({ error: null }),
})) 