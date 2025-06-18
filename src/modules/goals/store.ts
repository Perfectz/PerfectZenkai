import { create } from 'zustand'
// import { v4 as uuidv4 } from 'uuid' // Temporarily commented out
import { SimpleGoal, GoalProgress, GoalWithProgress, GoalCategory } from './types'
import { getRandomGoalColor } from './utils'
import { getSupabaseClient } from '@/lib/supabase'

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
  calculateGoalProgress: (goalId: string, todos: Array<{ goalId?: string; done: boolean }>) => GoalProgress
  getGoalsWithProgress: (todos: Array<{ goalId?: string; done: boolean }>) => GoalWithProgress[]
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

  loadGoals: async () => {
    try {
      set({ isLoading: true, error: null })
      
      const supabase = await getSupabaseClient()
      if (!supabase) {
        // Fallback to mock data if Supabase not available
        set({ goals: mockGoals, isLoading: false })
        return
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const goals: SimpleGoal[] = (data || []).map(item => ({
        id: item.id as string,
        title: item.title as string,
        category: item.category as GoalCategory,
        description: item.description as string | undefined,
        targetDate: item.target_date as string | undefined,
        color: item.color as string,
        isActive: item.is_active as boolean,
        createdAt: item.created_at as string,
        updatedAt: item.updated_at as string,
      }))

      set({ goals, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load goals',
        isLoading: false,
        goals: mockGoals // Keep mock data as fallback
      })
    }
  },

  addGoal: async (goalData) => {
    try {
      set({ isLoading: true, error: null })
      
      const supabase = await getSupabaseClient()
      if (!supabase) {
        throw new Error('Supabase client not available')
      }

      const newGoalData = {
        title: goalData.title,
        category: goalData.category,
        description: goalData.description,
        target_date: goalData.targetDate,
        color: goalData.color || getRandomGoalColor(),
        is_active: goalData.isActive !== false,
        user_id: '', // TODO: Get from auth context
      }

      const { data, error } = await supabase
        .from('goals')
        .insert([newGoalData])
        .select()
        .single()

      if (error) throw error

      const newGoal: SimpleGoal = {
        id: data.id as string,
        title: data.title as string,
        category: data.category as GoalCategory,
        description: data.description as string | undefined,
        targetDate: data.target_date as string | undefined,
        color: data.color as string,
        isActive: data.is_active as boolean,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
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
      
      const supabase = await getSupabaseClient()
      if (!supabase) {
        // Fallback to local update if Supabase not available
        const now = new Date().toISOString()
        set(state => ({
          goals: state.goals.map(goal =>
            goal.id === id 
              ? { ...goal, ...updates, updatedAt: now }
              : goal
          ),
          isLoading: false,
        }))
        return
      }

      const updateData: any = {}
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate
      if (updates.color !== undefined) updateData.color = updates.color
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive

      const { data, error } = await supabase
        .from('goals')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      const updatedGoal: SimpleGoal = {
        id: data.id as string,
        title: data.title as string,
        category: data.category as GoalCategory,
        description: data.description as string | undefined,
        targetDate: data.target_date as string | undefined,
        color: data.color as string,
        isActive: data.is_active as boolean,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
      }

      set(state => ({
        goals: state.goals.map(goal =>
          goal.id === id ? updatedGoal : goal
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
      
      const supabase = await getSupabaseClient()
      if (!supabase) {
        // Fallback to local delete if Supabase not available
        set(state => ({
          goals: state.goals.filter(goal => goal.id !== id),
          isLoading: false,
        }))
        return
      }

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)

      if (error) throw error
      
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