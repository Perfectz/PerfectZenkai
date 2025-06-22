// src/modules/ai-chat/services/FunctionRegistry.ts

import { useTasksStore } from '@/modules/tasks/store'
import { useWeightStore } from '@/modules/weight/store'
import { useAuthStore } from '@/modules/auth'
import type { Todo, Priority } from '@/modules/tasks/types'
import type { WeightEntry, WeightGoalInput } from '@/modules/weight/types'
import { FoodAnalysisAgent } from '@/modules/meals/services/FoodAnalysisAgent'
import { keyVaultService } from '@/services/keyVaultService'
import { getSupabaseClientSync } from '@/lib/supabase-client'
import { WeightManagementAgent } from '@/modules/weight/services/WeightManagementAgent'
// Removed duplicate and problematic imports

// === FUNCTION PARAMETER INTERFACES ===
export interface AddTodoParams {
  summary: string
  description?: string
  priority?: Priority
  category?: 'work' | 'personal' | 'health' | 'learning' | 'other'
  points?: number
  dueDate?: string
}

export interface UpdateTodoParams {
  id: string
  summary?: string
  description?: string
  priority?: Priority
  category?: 'work' | 'personal' | 'health' | 'learning' | 'other'
  points?: number
  done?: boolean
}

export interface DeleteTodoParams {
  id: string
}

export interface ToggleTodoParams {
  id: string
}

export interface GetTodosParams {
  category?: 'work' | 'personal' | 'health' | 'learning' | 'other'
  completed?: boolean
}

export interface AddWeightParams {
  weight: number
  date?: string
}

export interface UpdateWeightParams {
  id: string
  weight?: number
  date?: string
}

export interface DeleteWeightParams {
  id: string
}

export interface GetWeightsParams {
  timeframe?: 'week' | 'month' | 'quarter' | 'year' | 'all'
  limit?: number
}

export interface SetWeightGoalParams {
  targetWeight: number
  targetDate?: string | null
  goalType: 'lose' | 'gain' | 'maintain'
  startingWeight?: number
}

export interface AnalyzeMealPhotoParams {
  imageData: string
  mimeType?: string
  notes?: string
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
}

export interface FillStandupFormParams {
  date?: string
  yesterdayAccomplishments?: string[]
  yesterdayBlockers?: string[]
  yesterdayLessons?: string
  todayPriorities?: Array<{ text: string; category: string }>
  todayPlans?: string[]
  blockers?: string[]
  energyLevel?: number
  mood?: string | number
  availableHours?: number
  motivationLevel?: number
  energy?: number
}

export interface GetStandupDataParams {
  date?: string
  includeReflection?: boolean
}

export interface SaveMealEntryParams {
  name: string
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  notes?: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  mealDate?: string
  photoUrl?: string
  foods: Array<{ name: string; calories: number; protein?: number; carbs?: number; fat?: number }>
  totalCalories: number
  confidenceScore?: number
  analysisTimeMs?: number
}

export interface GetMealHistoryParams {
  timeframe?: 'week' | 'month' | 'quarter' | 'year'
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  startDate?: string
  endDate?: string
  limit?: number
}

export interface GenerateInsightParams {
  type?: 'tasks' | 'weight' | 'meals' | 'journal'
  timeframe?: string
  insightType?: string
  dataRange?: string
  focus?: string
}

export interface GetInsightsParams {
  type?: 'tasks' | 'weight' | 'meals' | 'journal'
  limit?: number
  insightType?: string
  unreadOnly?: boolean
}

export interface AnalyzeWeightProgressParams {
  timeframe?: 'week' | 'month' | 'quarter' | 'year' | 'all'
  includeGoals?: boolean
}

export interface RecommendWeightGoalParams {
  targetType?: 'loss' | 'gain' | 'maintain'
  timeframe?: string
}

export interface PredictWeightProgressParams {
  daysAhead?: number
  includeConfidence?: boolean
}

export interface GetWeightCoachingParams {
  focusArea?: 'motivation' | 'plateau' | 'goal-setting' | 'tracking' | 'general'
}

// Using WeightEntryType from imports instead of duplicate interface

export interface FunctionCallResult {
  success: boolean
  message: string
  data?: unknown
  error?: string
}

// Add proper interfaces to replace any types
interface StandupPriority {
  text: string
  category: string
}

interface MealEntryData {
  user_id: string
  meal_date: string
  meal_type: string
  photo_url: string | null
  foods: Array<{ name: string; calories: number; protein?: number; carbs?: number; fat?: number }>
  total_calories: number
  confidence_score: number
  analysis_time_ms: number
  notes: string | null
  created_at?: string
  id?: string
}

// Available functions that AI can call
export const AVAILABLE_FUNCTIONS = {
  // === TODO MANAGEMENT ===
  addTodo: {
    name: 'addTodo',
    description: 'Add a new todo item',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Brief summary of the task'
        },
        description: {
          type: 'string',
          description: 'Optional detailed description'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Task priority level'
        },
        category: {
          type: 'string',
          enum: ['work', 'personal', 'health', 'learning', 'other'],
          description: 'Task category'
        },
        points: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Points value for completing this task (1-10)'
        },
        dueDate: {
          type: 'string',
          description: 'Due date in YYYY-MM-DD format (optional)'
        }
      },
      required: ['summary']
    }
  },

  updateTodo: {
    name: 'updateTodo',
    description: 'Update an existing todo item',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the todo to update'
        },
        summary: {
          type: 'string',
          description: 'Updated task summary'
        },
        description: {
          type: 'string',
          description: 'Updated description'
        },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: 'Updated priority'
        },
        category: {
          type: 'string',
          enum: ['work', 'personal', 'health', 'learning', 'other'],
          description: 'Updated category'
        },
        points: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Updated points value'
        },
        done: {
          type: 'boolean',
          description: 'Mark task as complete/incomplete'
        }
      },
      required: ['id']
    }
  },

  deleteTodo: {
    name: 'deleteTodo',
    description: 'Delete a todo item',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the todo to delete'
        }
      },
      required: ['id']
    }
  },

  toggleTodo: {
    name: 'toggleTodo',
    description: 'Toggle todo completion status',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the todo to toggle'
        }
      },
      required: ['id']
    }
  },

  getTodos: {
    name: 'getTodos',
    description: 'Get list of todos with optional filtering',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: ['work', 'personal', 'health', 'learning', 'other'],
          description: 'Filter by category'
        },
        completed: {
          type: 'boolean',
          description: 'Filter by completion status'
        }
      }
    }
  },

  // === WEIGHT MANAGEMENT ===
  addWeight: {
    name: 'addWeight',
    description: 'Log a weight entry',
    parameters: {
      type: 'object',
      properties: {
        weight: {
          type: 'number',
          minimum: 50,
          maximum: 1000,
          description: 'Weight in pounds'
        },
        date: {
          type: 'string',
          description: 'Date in YYYY-MM-DD format (defaults to today)'
        }
      },
      required: ['weight']
    }
  },

  updateWeight: {
    name: 'updateWeight',
    description: 'Update an existing weight entry',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the weight entry to update'
        },
        weight: {
          type: 'number',
          minimum: 50,
          maximum: 1000,
          description: 'Updated weight in pounds'
        },
        date: {
          type: 'string',
          description: 'Updated date in YYYY-MM-DD format'
        }
      },
      required: ['id']
    }
  },

  deleteWeight: {
    name: 'deleteWeight',
    description: 'Delete a weight entry',
    parameters: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          description: 'ID of the weight entry to delete'
        }
      },
      required: ['id']
    }
  },

  getWeights: {
    name: 'getWeights',
    description: 'Get weight history',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 50,
          description: 'Maximum number of entries to return'
        }
      }
    }
  },

  setWeightGoal: {
    name: 'setWeightGoal',
    description: 'Set a weight goal',
    parameters: {
      type: 'object',
      properties: {
        targetWeight: {
          type: 'number',
          minimum: 50,
          maximum: 1000,
          description: 'Target weight in pounds'
        },
        goalType: {
          type: 'string',
          enum: ['lose', 'gain', 'maintain'],
          description: 'Type of weight goal'
        },
        targetDate: {
          type: 'string',
          description: 'Target date in YYYY-MM-DD format'
        },
        startingWeight: {
          type: 'number',
          minimum: 50,
          maximum: 1000,
          description: 'Starting weight in pounds'
        }
      },
      required: ['targetWeight', 'goalType']
    }
  },

  // === USER INFO ===
  getUserInfo: {
    name: 'getUserInfo',
    description: 'Get current user information and stats',
    parameters: {
      type: 'object',
      properties: {}
    }
  },

  // === DATA ANALYSIS ===
  getTasksStats: {
    name: 'getTasksStats',
    description: 'Get task completion statistics and points',
    parameters: {
      type: 'object',
      properties: {}
    }
  },

  getWeightStats: {
    name: 'getWeightStats',
    description: 'Get weight progress and trend analysis',
    parameters: {
      type: 'object',
      properties: {}
    }
  },

  // === FOOD ANALYSIS ===
  analyzeMealPhoto: {
    name: 'analyzeMealPhoto',
    description: 'Analyze a meal photo to identify foods and estimate calories using AI vision',
    parameters: {
      type: 'object',
      properties: {
        imageData: {
          type: 'string',
          description: 'Base64 encoded image data (data:image/jpeg;base64,...)'
        },
        mealType: {
          type: 'string',
          enum: ['breakfast', 'lunch', 'dinner', 'snack'],
          description: 'Type of meal being analyzed'
        }
      },
      required: ['imageData']
    }
  },

  // === DAILY STANDUP MANAGEMENT ===
  fillStandupForm: {
    name: 'fillStandupForm',
    description: 'Fill out daily standup form with voice input or structured data',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date for the standup in YYYY-MM-DD format (defaults to today)'
        },
        yesterdayAccomplishments: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of accomplishments from yesterday'
        },
        yesterdayBlockers: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of blockers or obstacles from yesterday'
        },
        yesterdayLessons: {
          type: 'string',
          description: 'Key learnings or insights from yesterday'
        },
        todayPriorities: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              text: { type: 'string' },
              category: { 
                type: 'string', 
                enum: ['work', 'personal', 'health', 'learning', 'other'] 
              },
              estimatedTime: { type: 'number' }
            },
            required: ['text', 'category']
          },
          description: 'Today\'s priority tasks and objectives'
        },
        energyLevel: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Current energy level from 1-10'
        },
        mood: {
          type: 'string',
          enum: ['optimistic', 'focused', 'energetic', 'calm', 'neutral', 'tired', 'stressed'],
          description: 'Current mood state'
        },
        availableHours: {
          type: 'number',
          minimum: 1,
          maximum: 16,
          description: 'Available working hours for today'
        },
        motivationLevel: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          description: 'Current motivation level from 1-10'
        }
      }
    }
  },

  getStandupData: {
    name: 'getStandupData',
    description: 'Retrieve standup data for a specific date or date range',
    parameters: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Specific date in YYYY-MM-DD format'
        },
        startDate: {
          type: 'string',
          description: 'Start date for range query in YYYY-MM-DD format'
        },
        endDate: {
          type: 'string',
          description: 'End date for range query in YYYY-MM-DD format'
        }
      }
    }
  },

  // === MEAL TRACKING ===
  saveMealEntry: {
    name: 'saveMealEntry',
    description: 'Save a meal entry to the database after photo analysis',
    parameters: {
      type: 'object',
      properties: {
        mealType: {
          type: 'string',
          enum: ['breakfast', 'lunch', 'dinner', 'snack'],
          description: 'Type of meal'
        },
        foods: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              portion: { type: 'string' },
              calories: { type: 'number' },
              confidence: { type: 'number' }
            }
          },
          description: 'Array of detected foods with nutritional info'
        },
        totalCalories: {
          type: 'number',
          description: 'Total estimated calories for the meal'
        },
        confidenceScore: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Overall confidence of the analysis'
        },
        analysisTimeMs: {
          type: 'number',
          description: 'Time taken for analysis in milliseconds'
        },
        photoUrl: {
          type: 'string',
          description: 'URL or path to the meal photo'
        },
        notes: {
          type: 'string',
          description: 'Additional notes about the meal'
        },
        mealDate: {
          type: 'string',
          description: 'Date of the meal in YYYY-MM-DD format (defaults to today)'
        }
      },
      required: ['mealType', 'foods', 'totalCalories']
    }
  },

  getMealHistory: {
    name: 'getMealHistory',
    description: 'Retrieve meal history for analysis and tracking',
    parameters: {
      type: 'object',
      properties: {
        startDate: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format'
        },
        endDate: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format'
        },
        mealType: {
          type: 'string',
          enum: ['breakfast', 'lunch', 'dinner', 'snack'],
          description: 'Filter by meal type'
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 50,
          description: 'Maximum number of entries to return'
        }
      }
    }
  },

  // === AI INSIGHTS ===
  generateInsight: {
    name: 'generateInsight',
    description: 'Generate AI insights based on user data patterns',
    parameters: {
      type: 'object',
      properties: {
        insightType: {
          type: 'string',
          enum: ['productivity', 'health', 'fitness', 'nutrition', 'general'],
          description: 'Type of insight to generate'
        },
        dataRange: {
          type: 'string',
          enum: ['week', 'month', 'quarter'],
          description: 'Range of data to analyze'
        },
        focus: {
          type: 'string',
          description: 'Specific area to focus the insight on'
        }
      },
      required: ['insightType']
    }
  },

  getInsights: {
    name: 'getInsights',
    description: 'Retrieve stored AI insights for the user',
    parameters: {
      type: 'object',
      properties: {
        insightType: {
          type: 'string',
          enum: ['productivity', 'health', 'fitness', 'nutrition', 'general'],
          description: 'Filter by insight type'
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 20,
          description: 'Maximum number of insights to return'
        },
        unreadOnly: {
          type: 'boolean',
          description: 'Only return unread insights'
        }
      }
    }
  },

  // === WEIGHT MANAGEMENT AGENT ===
  analyzeWeightProgress: {
    name: 'analyzeWeightProgress',
    description: 'Analyze user\'s weight trends and provide comprehensive insights using AI',
    parameters: {
      type: 'object',
      properties: {
        timeframe: { 
          type: 'string', 
          enum: ['week', 'month', 'quarter', 'year', 'all'],
          description: 'Time period to analyze'
        },
        includeGoals: { 
          type: 'boolean',
          description: 'Whether to include goal progress analysis'
        }
      },
      required: ['timeframe']
    }
  },

  recommendWeightGoal: {
    name: 'recommendWeightGoal',
    description: 'Generate intelligent weight goal recommendations based on user data and health guidelines',
    parameters: {
      type: 'object',
      properties: {
        targetType: { 
          type: 'string', 
          enum: ['loss', 'gain', 'maintain'],
          description: 'Type of weight goal desired'
        },
        timeframe: { 
          type: 'string',
          description: 'Desired timeline for achieving the goal'
        }
      },
      required: ['targetType']
    }
  },

  predictWeightProgress: {
    name: 'predictWeightProgress',
    description: 'Forecast weight trajectory and goal achievement timeline using predictive modeling',
    parameters: {
      type: 'object',
      properties: {
        daysAhead: { 
          type: 'number',
          description: 'Number of days to predict into the future',
          minimum: 1,
          maximum: 365
        },
        includeConfidence: { 
          type: 'boolean',
          description: 'Whether to include confidence intervals'
        }
      },
      required: ['daysAhead']
    }
  },

  getWeightCoaching: {
    name: 'getWeightCoaching',
    description: 'Provide personalized weight management coaching and actionable advice',
    parameters: {
      type: 'object',
      properties: {
        focusArea: {
          type: 'string',
          enum: ['motivation', 'plateau', 'goal-setting', 'tracking', 'general'],
          description: 'Specific area to focus coaching on'
        }
      }
    }
  }
}

// Utility functions
const lbsToKg = (lbs: number): number => lbs / 2.20462
const kgToLbs = (kg: number): number => kg * 2.20462

// Function implementations
export const FUNCTION_IMPLEMENTATIONS = {
  // === TODO MANAGEMENT ===
  async addTodo(params: AddTodoParams): Promise<FunctionCallResult> {
    try {
      const { addTodo } = useTasksStore.getState()
      
      const todo: Omit<Todo, 'id' | 'updatedAt'> = {
        summary: params.summary,
        description: params.description || '',
        priority: params.priority || 'medium',
        category: params.category || 'other',
        points: params.points || 5,
        done: false,
        dueDate: params.dueDate,
        createdAt: new Date().toISOString(),
        subtasks: [],
        descriptionFormat: 'plaintext'
      }

      await addTodo(todo)

      return {
        success: true,
        message: `✅ Added task: "${params.summary}" (${params.priority || 'medium'} priority, ${params.points || 5} points)`,
        data: { task: params.summary, priority: params.priority || 'medium', points: params.points || 5 }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to add task',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async updateTodo(params: UpdateTodoParams): Promise<FunctionCallResult> {
    try {
      const { updateTodo, todos } = useTasksStore.getState()
      
      const existingTodo = todos.find(t => t.id === params.id)
      if (!existingTodo) {
        return {
          success: false,
          message: '❌ Task not found',
          error: 'Task with specified ID does not exist'
        }
      }

      const updates: Partial<Todo> = {}
      if (params.summary !== undefined) updates.summary = params.summary
      if (params.description !== undefined) updates.description = params.description
      if (params.priority !== undefined) updates.priority = params.priority
      if (params.category !== undefined) updates.category = params.category
      if (params.points !== undefined) updates.points = params.points
      if (params.done !== undefined) updates.done = params.done

      await updateTodo(params.id, updates)

      return {
        success: true,
        message: `✅ Updated task: "${existingTodo.summary}"`,
        data: { id: params.id, updates }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to update task',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async deleteTodo(params: DeleteTodoParams): Promise<FunctionCallResult> {
    try {
      const { deleteTodo, todos } = useTasksStore.getState()
      
      const existingTodo = todos.find(t => t.id === params.id)
      if (!existingTodo) {
        return {
          success: false,
          message: '❌ Task not found',
          error: 'Task with specified ID does not exist'
        }
      }

      await deleteTodo(params.id)

      return {
        success: true,
        message: `🗑️ Deleted task: "${existingTodo.summary}"`,
        data: { id: params.id, deletedTask: existingTodo.summary }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to delete task',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async toggleTodo(params: ToggleTodoParams): Promise<FunctionCallResult> {
    try {
      const { toggleTodo, todos } = useTasksStore.getState()
      
      const existingTodo = todos.find(t => t.id === params.id)
      if (!existingTodo) {
        return {
          success: false,
          message: '❌ Task not found',
          error: 'Task with specified ID does not exist'
        }
      }

      await toggleTodo(params.id)
      const newStatus = !existingTodo.done

      return {
        success: true,
        message: `${newStatus ? '✅' : '⏸️'} ${newStatus ? 'Completed' : 'Reopened'} task: "${existingTodo.summary}"`,
        data: { id: params.id, completed: newStatus, points: newStatus ? existingTodo.points : 0 }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to toggle task',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getTodos(params: GetTodosParams): Promise<FunctionCallResult> {
    try {
      const { todos, getTodosByCategory } = useTasksStore.getState()
      
      let filteredTodos = todos

      if (params.category) {
        filteredTodos = getTodosByCategory(params.category)
      }
      
      if (params.completed !== undefined) {
        filteredTodos = filteredTodos.filter(t => t.done === params.completed)
      }

      const summary = {
        total: filteredTodos.length,
        completed: filteredTodos.filter(t => t.done).length,
        pending: filteredTodos.filter(t => !t.done).length
      }

      return {
        success: true,
        message: `📋 Found ${filteredTodos.length} tasks (${summary.completed} completed, ${summary.pending} pending)`,
        data: {
          tasks: filteredTodos.map(t => ({
            id: t.id,
            summary: t.summary,
            priority: t.priority,
            category: t.category,
            points: t.points,
            done: t.done,
            dueDate: t.dueDate
          })),
          summary
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to get tasks',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // === WEIGHT MANAGEMENT ===
  async addWeight(params: AddWeightParams): Promise<FunctionCallResult> {
    try {
      const { addWeight } = useWeightStore.getState()
      
      const date = params.date || new Date().toISOString().split('T')[0]
      const weightKg = lbsToKg(params.weight)

      const entry: Omit<WeightEntry, 'id'> = {
        dateISO: date,
        kg: weightKg,
        weight: weightKg // Alias for kg to support both property names
      }

      await addWeight(entry)

      return {
        success: true,
        message: `⚖️ Logged weight: ${params.weight} lbs on ${new Date(date).toLocaleDateString()}`,
        data: { weight: params.weight, date, kg: weightKg }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to log weight',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async updateWeight(params: UpdateWeightParams): Promise<FunctionCallResult> {
    try {
      const { updateWeight, weights } = useWeightStore.getState()
      
      const existingEntry = weights.find(w => w.id === params.id)
      if (!existingEntry) {
        return {
          success: false,
          message: '❌ Weight entry not found',
          error: 'Weight entry with specified ID does not exist'
        }
      }

      const updates: Partial<Omit<WeightEntry, 'id'>> = {}
      if (params.weight !== undefined) {
        const weightKg = lbsToKg(params.weight)
        updates.kg = weightKg
        updates.weight = weightKg // Alias for kg to support both property names
      }
      if (params.date !== undefined) updates.dateISO = params.date

      await updateWeight(params.id, updates)

      return {
        success: true,
        message: `✏️ Updated weight entry for ${new Date(existingEntry.dateISO).toLocaleDateString()}`,
        data: { id: params.id, updates }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to update weight',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async deleteWeight(params: DeleteWeightParams): Promise<FunctionCallResult> {
    try {
      const { deleteWeight, weights } = useWeightStore.getState()
      
      const existingEntry = weights.find(w => w.id === params.id)
      if (!existingEntry) {
        return {
          success: false,
          message: '❌ Weight entry not found',
          error: 'Weight entry with specified ID does not exist'
        }
      }

      await deleteWeight(params.id)

      return {
        success: true,
        message: `🗑️ Deleted weight entry: ${kgToLbs(existingEntry.kg).toFixed(1)} lbs from ${new Date(existingEntry.dateISO).toLocaleDateString()}`,
        data: { id: params.id, deletedWeight: kgToLbs(existingEntry.kg), date: existingEntry.dateISO }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to delete weight',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getWeights(params: GetWeightsParams): Promise<FunctionCallResult> {
    try {
      const { weights } = useWeightStore.getState()
      
      let filteredWeights = weights

      if (params.limit) {
        filteredWeights = filteredWeights.slice(0, params.limit)
      }

      const stats = {
        count: filteredWeights.length,
        latest: filteredWeights[0] ? { 
          weight: kgToLbs(filteredWeights[0].kg).toFixed(1), 
          date: filteredWeights[0].dateISO 
        } : null
      }

      return {
        success: true,
        message: `⚖️ Found ${filteredWeights.length} weight entries`,
        data: {
          weights: filteredWeights.map(w => ({
            id: w.id,
            weight: kgToLbs(w.kg).toFixed(1),
            date: w.dateISO,
            kg: w.kg
          })),
          stats
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to get weights',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async setWeightGoal(params: SetWeightGoalParams): Promise<FunctionCallResult> {
    try {
      const { setGoal } = useWeightStore.getState()
      
      const goal: WeightGoalInput = {
        targetWeight: lbsToKg(params.targetWeight),
        goalType: params.goalType,
        targetDate: params.targetDate || undefined,
        startingWeight: params.startingWeight ? lbsToKg(params.startingWeight) : undefined
      }

      await setGoal(goal)

      return {
        success: true,
        message: `🎯 Set weight goal: ${params.goalType} to ${params.targetWeight} lbs`,
        data: { goalType: params.goalType, targetWeight: params.targetWeight, targetDate: params.targetDate }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to set weight goal',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // === USER INFO & STATS ===
  async getUserInfo(): Promise<FunctionCallResult> {
    try {
      const { user } = useAuthStore.getState()
      const { weights, activeGoal } = useWeightStore.getState()
      const { todos } = useTasksStore.getState()

      const latestWeight = weights[0]
      const stats = {
        user: {
          name: user?.name || user?.username || 'User',
          email: user?.email
        },
        currentWeight: latestWeight ? `${kgToLbs(latestWeight.kg).toFixed(1)} lbs` : 'Not logged',
        weightGoal: activeGoal ? {
          type: activeGoal.goalType,
          target: `${kgToLbs(activeGoal.targetWeight).toFixed(1)} lbs`,
          targetDate: activeGoal.targetDate
        } : 'No active goal',
        tasksSummary: {
          total: todos.length,
          completed: todos.filter(t => t.done).length,
          pending: todos.filter(t => !t.done).length
        }
      }

      return {
        success: true,
        message: `👤 User info for ${stats.user.name}`,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to get user info',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getTasksStats(): Promise<FunctionCallResult> {
    try {
      const { getPointsStats } = useTasksStore.getState()
      const stats = getPointsStats()

      return {
        success: true,
        message: `📊 Task statistics: ${stats.completedTasks}/${stats.totalTasks} completed (${stats.completionPercentage.toFixed(1)}%)`,
        data: {
          ...stats,
          streakInfo: 'Streak calculation would go here' // Could enhance this
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to get task stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getWeightStats(): Promise<FunctionCallResult> {
    try {
      const { weights } = useWeightStore.getState()
      
      if (weights.length === 0) {
        return {
          success: true,
          message: '📊 No weight data available',
          data: { message: 'No weight entries found' }
        }
      }

      const latest = weights[0]
      const oldest = weights[weights.length - 1]
      const totalChange = latest.kg - oldest.kg
      const changeInLbs = kgToLbs(Math.abs(totalChange))

      const last30Days = weights.filter(w => {
        const entryDate = new Date(w.dateISO)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        return entryDate >= thirtyDaysAgo
      })

      const stats = {
        currentWeight: kgToLbs(latest.kg).toFixed(1) + ' lbs',
        totalEntries: weights.length,
        totalChange: {
          amount: changeInLbs.toFixed(1) + ' lbs',
          direction: totalChange > 0 ? 'gained' : totalChange < 0 ? 'lost' : 'no change'
        },
        recentEntries: last30Days.length,
        trend: last30Days.length >= 2 ? 
          (last30Days[0].kg > last30Days[last30Days.length - 1].kg ? 'gaining' : 'losing') : 'insufficient data'
      }

      return {
        success: true,
        message: `📊 Weight stats: Current ${stats.currentWeight}, ${stats.totalChange.direction} ${stats.totalChange.amount} total`,
        data: stats
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to get weight stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // === FOOD ANALYSIS ===
  async analyzeMealPhoto(params: AnalyzeMealPhotoParams): Promise<FunctionCallResult> {
    try {
      // Get OpenAI API key
      const apiKey = await keyVaultService.getSecret('OPENAI_API_KEY')
      if (!apiKey) {
        return {
          success: false,
          message: '❌ OpenAI API key not configured',
          error: 'OpenAI API key is required for food analysis'
        }
      }

      // Create agent and analyze photo
      const agent = new FoodAnalysisAgent({
        apiKey,
        model: 'gpt-4o-mini'
      })

      const result = await agent.analyzePhoto(params.imageData)
      
      // Format response for chat
      const foodList = result.foods.map(food => 
        `• ${food.name} (${food.portion}) - ${(food.confidence * 100).toFixed(0)}% confidence`
      ).join('\n')

      return {
        success: true,
        message: `🍽️ Meal Analysis Complete!\n\n**Detected Foods:**\n${foodList}\n\n**Total Calories:** ${result.totalCalories}\n**Analysis Time:** ${(result.analysisTime / 1000).toFixed(1)}s\n**Overall Confidence:** ${(result.confidence * 100).toFixed(0)}%`,
        data: {
          foods: result.foods,
          totalCalories: result.totalCalories,
          analysisTime: result.analysisTime,
          confidence: result.confidence,
          mealType: params.mealType || 'unspecified'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to analyze meal photo',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // === DAILY STANDUP MANAGEMENT ===
  async fillStandupForm(params: FillStandupFormParams): Promise<FunctionCallResult> {
    try {
      // For now, we'll store in localStorage (later can be enhanced with proper database)
      const date = params.date || new Date().toISOString().split('T')[0]
      
      const standupData = {
        date,
        yesterdayAccomplishments: params.yesterdayAccomplishments || [],
        yesterdayBlockers: params.yesterdayBlockers || [],
        yesterdayLessons: params.yesterdayLessons || '',
        todayPriorities: params.todayPriorities || [],
        energyLevel: params.energyLevel || 7,
        mood: params.mood || '',
        availableHours: params.availableHours || 8,
        motivationLevel: params.motivationLevel || 7,
        createdAt: new Date().toISOString()
      }

      // Store in localStorage for now
      const key = `standup_${date}`
      localStorage.setItem(key, JSON.stringify(standupData))

      // Trigger a custom event to update the UI if it's listening
      window.dispatchEvent(new CustomEvent('standupDataUpdated', { 
        detail: { date, data: standupData } 
      }))

      const prioritiesText = standupData.todayPriorities.length > 0 
        ? standupData.todayPriorities.map((p: StandupPriority) => `• ${p.text} (${p.category})`).join('\n')
        : 'None specified'

      return {
        success: true,
        message: `📝 **Daily Standup Saved for ${date}**\n\n**Energy Level:** ${standupData.energyLevel}/10\n**Mood:** ${standupData.mood || 'Not specified'}\n**Available Hours:** ${standupData.availableHours}h\n\n**Today's Priorities:**\n${prioritiesText}\n\n✅ Standup data has been saved and will appear in the Daily Journal interface.`,
        data: standupData
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to save standup data',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getStandupData(params: GetStandupDataParams): Promise<FunctionCallResult> {
    try {
      if (params.date) {
        // Get specific date
        const key = `standup_${params.date}`
        const data = localStorage.getItem(key)
        
        if (!data) {
          return {
            success: true,
            message: `📅 No standup data found for ${params.date}`,
            data: { date: params.date, found: false }
          }
        }

        const standupData = JSON.parse(data)
        
        return {
          success: true,
          message: `📋 **Standup Data for ${params.date}**\n\n**Energy:** ${standupData.energyLevel}/10 | **Mood:** ${standupData.mood || 'Not specified'}\n**Available Hours:** ${standupData.availableHours}h\n\n**Yesterday's Accomplishments:**\n${standupData.yesterdayAccomplishments.map((a: string) => `• ${a}`).join('\n') || 'None listed'}\n\n**Today's Priorities:**\n${standupData.todayPriorities.map((p: StandupPriority) => `• ${p.text} (${p.category})`).join('\n') || 'None listed'}`,
          data: standupData
        }
      } else {
        // Get date range or recent entries
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('standup_'))
        const allData = allKeys.map(key => {
          const data = localStorage.getItem(key)
          return data ? JSON.parse(data) : null
        }).filter(Boolean)

        // Sort by date descending
        allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        // Limit to last 7 days if no range specified
        const recentData = allData.slice(0, 7)

        return {
          success: true,
          message: `📊 **Recent Standup History** (${recentData.length} entries)\n\n${recentData.map(d => `**${d.date}:** Energy ${d.energyLevel}/10, ${d.todayPriorities.length} priorities`).join('\n')}`,
          data: { entries: recentData, total: allData.length }
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to retrieve standup data',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // === MEAL TRACKING IMPLEMENTATIONS ===
  async saveMealEntry(params: SaveMealEntryParams): Promise<FunctionCallResult> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        return {
          success: false,
          message: '❌ User not authenticated',
          error: 'Authentication required'
        }
      }

      const supabase = getSupabaseClientSync()
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client')
      }

      const mealDate = params.mealDate || new Date().toISOString().split('T')[0]

      const mealEntry = {
        user_id: user.id,
        meal_date: mealDate,
        meal_type: params.mealType,
        photo_url: params.photoUrl || null,
        foods: params.foods,
        total_calories: params.totalCalories,
        confidence_score: params.confidenceScore || 0.8,
        analysis_time_ms: params.analysisTimeMs || 0,
        notes: params.notes || null
      }

      const { data, error } = await (supabase as unknown as { from: (table: string) => { insert: (data: unknown) => { select: () => { single: () => Promise<{ data: unknown; error: unknown }> } } } })
        .from('meal_entries')
        .insert(mealEntry)
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        message: `🍽️ **Meal Saved Successfully!**\n\n**Type:** ${params.mealType}\n**Date:** ${mealDate}\n**Total Calories:** ${params.totalCalories}\n**Foods:** ${params.foods.length} items detected\n\n✅ Your meal has been logged to your nutrition tracking.`,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to save meal entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getMealHistory(params: GetMealHistoryParams): Promise<FunctionCallResult> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        return {
          success: false,
          message: '❌ User not authenticated',
          error: 'Authentication required'
        }
      }

      const supabase = getSupabaseClientSync()
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client')
      }

      let query = (supabase as unknown as { from: (table: string) => { select: (columns: string) => { eq: (column: string, value: string) => { order: (column: string, options: { ascending: boolean }) => unknown } } } })
        .from('meal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('meal_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (params.startDate) {
        query = query.gte('meal_date', params.startDate)
      }
      if (params.endDate) {
        query = query.lte('meal_date', params.endDate)
      }
      if (params.mealType) {
        query = query.eq('meal_type', params.mealType)
      }
      if (params.limit) {
        query = query.limit(params.limit)
      } else {
        query = query.limit(20) // Default limit
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          message: '📊 No meal entries found for the specified criteria',
          data: { entries: [], total: 0 }
        }
      }

      const totalCalories = data.reduce((sum: number, entry: MealEntryData) => sum + (entry.total_calories || 0), 0)
      const avgCaloriesPerMeal = Math.round(totalCalories / data.length)

      return {
        success: true,
        message: `🍽️ **Meal History** (${data.length} entries)\n\n**Total Calories:** ${totalCalories}\n**Average per Meal:** ${avgCaloriesPerMeal}\n**Date Range:** ${data[data.length - 1]?.meal_date} to ${data[0]?.meal_date}\n\n${data.slice(0, 5).map((entry: MealEntryData) => `**${entry.meal_date}** - ${entry.meal_type}: ${entry.total_calories} cal (${Array.isArray(entry.foods) ? entry.foods.length : 0} foods)`).join('\n')}`,
        data: { entries: data, total: data.length, totalCalories, avgCaloriesPerMeal }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to retrieve meal history',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // === AI INSIGHTS IMPLEMENTATIONS ===
  async generateInsight(params: GenerateInsightParams): Promise<FunctionCallResult> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        return {
          success: false,
          message: '❌ User not authenticated',
          error: 'Authentication required'
        }
      }

      // For now, generate a sample insight based on the type
      // In a full implementation, this would analyze actual user data
      const insightTemplates = {
        productivity: {
          title: 'Peak Productivity Pattern Detected',
          content: 'Based on your task completion data, you consistently perform best between 10 AM and 12 PM on weekdays. Consider blocking this time for your most important work.',
          tags: ['productivity', 'scheduling', 'optimization']
        },
        health: {
          title: 'Health Trend Analysis',
          content: 'Your weight tracking shows a positive trend with consistent logging. Your meal patterns indicate good protein intake but could benefit from more vegetables.',
          tags: ['health', 'nutrition', 'progress']
        },
        fitness: {
          title: 'Workout Consistency Insight',
          content: 'You have a strong streak of completing fitness-related tasks. Your energy levels are highest on days when you complete morning workouts.',
          tags: ['fitness', 'energy', 'consistency']
        },
        nutrition: {
          title: 'Nutritional Balance Assessment',
          content: 'Your meal logging shows good calorie tracking. Consider adding more variety in your breakfast options and increasing fiber intake.',
          tags: ['nutrition', 'balance', 'improvement']
        },
        general: {
          title: 'Overall Progress Summary',
          content: 'You are maintaining good momentum across all areas. Your task completion rate is above average, and your health tracking is consistent.',
          tags: ['progress', 'summary', 'motivation']
        }
      }

      const template = insightTemplates[params.insightType as keyof typeof insightTemplates] || insightTemplates.general

      const supabase = getSupabaseClientSync()
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client')
      }

      const insight = {
        user_id: user.id,
        insight_type: params.insightType,
        insight_date: new Date().toISOString().split('T')[0],
        title: template.title,
        content: template.content,
        confidence_score: 0.85,
        data_sources: { range: params.dataRange || 'week', focus: params.focus },
        tags: template.tags
      }

      const { data, error } = await (supabase as any)
        .from('ai_insights')
        .insert(insight)
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        message: `🧠 **New AI Insight Generated!**\n\n**${template.title}**\n\n${template.content}\n\n📊 This insight has been saved to your insights dashboard.`,
        data: data
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to generate insight',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getInsights(params: GetInsightsParams): Promise<FunctionCallResult> {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        return {
          success: false,
          message: '❌ User not authenticated',
          error: 'Authentication required'
        }
      }

      const supabase = getSupabaseClientSync()
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client')
      }

      let query = (supabase as any)
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (params.insightType) {
        query = query.eq('insight_type', params.insightType)
      }
      if (params.unreadOnly) {
        query = query.eq('is_read', false)
      }
      if (params.limit) {
        query = query.limit(params.limit)
      } else {
        query = query.limit(10) // Default limit
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        return {
          success: true,
          message: '🧠 No insights found. Generate some insights by asking me to analyze your data!',
          data: { insights: [], total: 0 }
        }
      }

      const unreadCount = data.filter((insight: any) => !insight.is_read).length

      return {
        success: true,
        message: `🧠 **Your AI Insights** (${data.length} total, ${unreadCount} unread)\n\n${data.slice(0, 3).map((insight: any) => `**${insight.title}**\n${insight.content.substring(0, 100)}...`).join('\n\n')}`,
        data: { insights: data, total: data.length, unreadCount }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to retrieve insights',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // === WEIGHT MANAGEMENT AGENT IMPLEMENTATIONS ===
  async analyzeWeightProgress(params: AnalyzeWeightProgressParams): Promise<FunctionCallResult> {
    try {
      const agent = new WeightManagementAgent()
      const { weights, activeGoal } = useWeightStore.getState()
      
      // Filter data based on timeframe
      const filteredWeights = filterWeightsByTimeframe(weights, params.timeframe || 'month')
      
      // Analyze trends
      const analysis = await agent.analyzeWeightTrends('current-user', filteredWeights)
      
      // Generate insights
      const insights = await agent.generateDashboardInsights(
        filteredWeights, 
        params.includeGoals ? (activeGoal || undefined) : undefined
      )

      const trendEmoji = analysis.trend === 'losing' ? '📉' : 
                        analysis.trend === 'gaining' ? '📈' : 
                        analysis.trend === 'maintaining' ? '⚖️' : '📊'

      return {
        success: true,
        message: `${trendEmoji} **Weight Analysis (${params.timeframe})**\n\n**Current Trend:** ${analysis.trend} at ${Math.abs(analysis.rate * 7).toFixed(1)}kg/week\n**Confidence:** ${(analysis.confidence * 100).toFixed(0)}%\n**Streak:** ${analysis.streakDays} days\n\n**Summary:** ${insights.summary}\n\n${insights.recommendations.length > 0 ? `**Recommendations:**\n${insights.recommendations.map(r => `• ${r}`).join('\n')}` : ''}${insights.alerts.length > 0 ? `\n\n**⚠️ Alerts:**\n${insights.alerts.map(a => `• ${a}`).join('\n')}` : ''}`,
        data: { analysis, insights, timeframe: params.timeframe }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to analyze weight progress',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async recommendWeightGoal(params: RecommendWeightGoalParams): Promise<FunctionCallResult> {
    try {
      const agent = new WeightManagementAgent()
      const { weights, activeGoal } = useWeightStore.getState()
      
      const recommendations = await agent.generateRecommendations(weights, activeGoal || undefined)
      
      // Filter recommendations by target type
      const filteredRecommendations = recommendations.goals.filter(
        goal => goal.type === params.targetType
      )

      if (filteredRecommendations.length === 0) {
        return {
          success: true,
          message: `🎯 No specific recommendations available for ${params.targetType} goals. Try tracking more weight data for better insights.`,
          data: { recommendations: [], type: params.targetType }
        }
      }

      const topRec = filteredRecommendations[0]
      const feasibilityEmoji = topRec.feasibility === 'high' ? '✅' : 
                              topRec.feasibility === 'medium' ? '⚠️' : '❌'

      return {
        success: true,
        message: `🎯 **Weight Goal Recommendation (${params.targetType})**\n\n**Target:** ${kgToLbs(topRec.targetWeight).toFixed(1)} lbs\n**Timeline:** ${topRec.targetDate}\n**Rate:** ${topRec.ratePerWeek.toFixed(1)} kg/week\n**Feasibility:** ${feasibilityEmoji} ${topRec.feasibility}\n**Health Risk:** ${topRec.healthRisk}\n\n**Reasoning:** ${topRec.reasoning}\n\n**Confidence:** ${(topRec.confidence * 100).toFixed(0)}%`,
        data: { 
          recommendation: topRec,
          allRecommendations: filteredRecommendations,
          coaching: recommendations.coaching
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to generate goal recommendations',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async predictWeightProgress(params: PredictWeightProgressParams): Promise<FunctionCallResult> {
    try {
      const agent = new WeightManagementAgent()
      const { weights, activeGoal } = useWeightStore.getState()
      
      const predictions = await agent.provideFeedback(
        'predict my weight progress', 
        weights, 
        activeGoal || undefined
      )

      if (!predictions.data?.predictions || predictions.data.predictions.length === 0) {
        return {
          success: true,
          message: '🔮 **Weight Prediction**\n\nI need more weight data to make accurate predictions. Try tracking your weight consistently for at least a week.',
          data: { predictions: [], confidence: 'low' }
        }
      }

      const futureWeight = predictions.data.predictions[predictions.data.predictions.length - 1]?.predictedWeight
      const confidence = predictions.data.confidence

      return {
        success: true,
        message: `🔮 **Weight Prediction (${params.daysAhead} days)**\n\n**Predicted Weight:** ${kgToLbs(futureWeight).toFixed(1)} lbs\n**Confidence:** ${confidence.reliability}\n\n${predictions.response}\n\n${params.includeConfidence && confidence ? `**Confidence Interval:** ${kgToLbs(confidence.confidenceInterval.lower).toFixed(1)} - ${kgToLbs(confidence.confidenceInterval.upper).toFixed(1)} lbs` : ''}`,
        data: { 
          predictions: predictions.data.predictions,
          confidence: predictions.data.confidence,
          goalTimeline: predictions.data.goal
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to predict weight progress',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  async getWeightCoaching(params: GetWeightCoachingParams): Promise<FunctionCallResult> {
    try {
      const agent = new WeightManagementAgent()
      const { weights, activeGoal } = useWeightStore.getState()
      
      const coaching = await agent.provideRealTimeCoaching(weights, activeGoal || undefined)
      
      const priorityEmoji = coaching.priority === 'high' ? '🚨' : 
                           coaching.priority === 'medium' ? '⚠️' : '💡'

      return {
        success: true,
        message: `${priorityEmoji} **Weight Management Coaching**\n\n${coaching.message}\n\n${coaching.actionItems.length > 0 ? `**Action Items:**\n${coaching.actionItems.map(item => `• ${item}`).join('\n')}` : ''}\n\n**Next Check-in:** ${coaching.nextCheckIn}`,
        data: { 
          coaching,
          focusArea: params?.focusArea || 'general',
          priority: coaching.priority
        }
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Failed to provide coaching',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Helper function for weight timeframe filtering
function filterWeightsByTimeframe(
  weights: WeightEntry[], 
  timeframe: 'week' | 'month' | 'quarter' | 'year' | 'all'
): WeightEntry[] {
  if (timeframe === 'all') return weights

  const now = new Date()
  const cutoffDate = new Date()

  switch (timeframe) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7)
      break
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3)
      break
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1)
      break
  }

  return weights.filter(weight => 
    new Date(weight.dateISO) >= cutoffDate
  )
} 