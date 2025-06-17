// src/modules/ai-chat/services/FunctionRegistry.ts

import { useTasksStore } from '@/modules/tasks/store'
import { useWeightStore } from '@/modules/weight/store'
import { useAuthStore } from '@/modules/auth'
import type { Todo } from '@/modules/tasks/types'
import type { WeightEntry, WeightGoalInput } from '@/modules/weight/types'

// Function call result type
export interface FunctionCallResult {
  success: boolean
  message: string
  data?: any
  error?: string
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
  }
}

// Utility functions
const lbsToKg = (lbs: number): number => lbs / 2.20462
const kgToLbs = (kg: number): number => kg * 2.20462

// Function implementations
export const FUNCTION_IMPLEMENTATIONS = {
  // === TODO MANAGEMENT ===
  async addTodo(params: any): Promise<FunctionCallResult> {
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

  async updateTodo(params: any): Promise<FunctionCallResult> {
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

  async deleteTodo(params: any): Promise<FunctionCallResult> {
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

  async toggleTodo(params: any): Promise<FunctionCallResult> {
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

  async getTodos(params: any): Promise<FunctionCallResult> {
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
  async addWeight(params: any): Promise<FunctionCallResult> {
    try {
      const { addWeight } = useWeightStore.getState()
      
      const date = params.date || new Date().toISOString().split('T')[0]
      const weightKg = lbsToKg(params.weight)

      const entry: Omit<WeightEntry, 'id'> = {
        dateISO: date,
        kg: weightKg
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

  async updateWeight(params: any): Promise<FunctionCallResult> {
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
      if (params.weight !== undefined) updates.kg = lbsToKg(params.weight)
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

  async deleteWeight(params: any): Promise<FunctionCallResult> {
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

  async getWeights(params: any): Promise<FunctionCallResult> {
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

  async setWeightGoal(params: any): Promise<FunctionCallResult> {
    try {
      const { setGoal } = useWeightStore.getState()
      
      const goal: WeightGoalInput = {
        targetWeight: lbsToKg(params.targetWeight),
        goalType: params.goalType,
        targetDate: params.targetDate || null,
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
  }
} 