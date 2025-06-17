// src/modules/ai-chat/services/ContextBuilder.ts

import type { 
  UserContext, 
  WorkoutContext, 
  MealContext, 
  WeightContext, 
  TaskContext, 
  UserPreferences 
} from '../types/langchain.types'

export class ContextBuilder {
  constructor() {
    // Initialize context builder
  }

  public async buildContext(depth: 'shallow' | 'medium' | 'deep'): Promise<UserContext> {
    const startTime = Date.now()
    
    try {
      // Parallel data fetching for performance
      const [workoutData, mealData, weightData, taskData, preferences] = await Promise.all([
        this.getWorkoutData(depth),
        this.getMealData(depth),
        this.getWeightData(depth),
        this.getTaskData(depth),
        this.getUserPreferences()
      ])

      const endTime = Date.now()
      
      // Ensure context building is under 500ms
      if (endTime - startTime > 500) {
        console.warn(`Context building took ${endTime - startTime}ms, exceeding 500ms target`)
      }

      return {
        workouts: workoutData,
        meals: mealData,
        weight: weightData,
        tasks: taskData,
        preferences
      }
    } catch (error) {
      console.error('Error building context:', error)
      
      // Return minimal fallback context
      return this.getFallbackContext()
    }
  }

  public formatContextForPrompt(context: UserContext): string {
    const startTime = Date.now()
    
    try {
      const sections = []

      // User preferences section
      sections.push('USER PREFERENCES:')
      sections.push(`- Fitness Level: ${context.preferences.fitnessLevel}`)
      sections.push(`- Goals: ${context.preferences.goals.join(', ') || 'None set'}`)
      sections.push(`- Dietary Restrictions: ${context.preferences.dietaryRestrictions.join(', ') || 'None'}`)
      sections.push(`- Preferred Workout Types: ${context.preferences.preferredWorkoutTypes.join(', ') || 'None'}`)

      // Weight progress section
      sections.push('\nWEIGHT PROGRESS:')
      if (context.weight.currentWeight > 0) {
        sections.push(`- Current: ${context.weight.currentWeight} ${context.weight.unit}`)
        sections.push(`- Goal: ${context.weight.goalWeight || 'Not set'} ${context.weight.unit}`)
        sections.push(`- Trend: ${context.weight.trend}`)
        sections.push(`- Recent entries: ${context.weight.entries.length}`)
      } else {
        sections.push('- No weight data available')
      }

      // Workout history section
      sections.push('\nWORKOUT HISTORY:')
      if (context.workouts.length > 0) {
        sections.push(`Recent ${context.workouts.length} workouts:`)
        context.workouts.forEach(workout => {
          const exerciseNames = workout.exercises.map(e => e.name).join(', ')
          sections.push(`- ${workout.date}: ${exerciseNames} (${workout.duration}min, ${workout.intensity} intensity)`)
        })
      } else {
        sections.push('No recent workouts')
      }

      // Nutrition log section
      sections.push('\nNUTRITION LOG:')
      if (context.meals.length > 0) {
        sections.push(`Recent ${context.meals.length} meals:`)
        context.meals.forEach(meal => {
          sections.push(`- ${meal.date} ${meal.type}: ${meal.calories} calories`)
          sections.push(`  (protein: ${meal.macros.protein}g, carbs: ${meal.macros.carbs}g, fat: ${meal.macros.fat}g)`)
        })
      } else {
        sections.push('No recent meals')
      }

      // Task completion section
      sections.push('\nTASK COMPLETION:')
      if (context.tasks.length > 0) {
        const taskSummary = context.tasks[0]
        sections.push(`- Completed: ${taskSummary.completed}`)
        sections.push(`- Pending: ${taskSummary.pending}`)
        sections.push(`- Overdue: ${taskSummary.overdue}`)
        sections.push(`- productivity: ${taskSummary.productivity}`)
        sections.push(`- streak: ${taskSummary.streaks} days`)
      } else {
        sections.push('No task data available')
      }

      const result = sections.join('\n')
      const endTime = Date.now()
      
      // Ensure formatting is under 100ms
      if (endTime - startTime > 100) {
        console.warn(`Context formatting took ${endTime - startTime}ms, exceeding 100ms target`)
      }

      return result
    } catch (error) {
      console.error('Error formatting context:', error)
      return 'Error formatting user context - using minimal data'
    }
  }

  private async getWorkoutData(depth: 'shallow' | 'medium' | 'deep'): Promise<WorkoutContext[]> {
    try {
      // Mock workout data for minimal implementation
      // In real implementation, this would call workout store
      const limit = depth === 'shallow' ? 3 : depth === 'medium' ? 7 : 30
      
      const mockWorkouts: WorkoutContext[] = [
        {
          date: '2025-01-16',
          exercises: [
            { name: 'Push-ups', reps: 20, type: 'strength' },
            { name: 'Running', duration: 30, type: 'cardio' }
          ],
          duration: 45,
          intensity: 'medium',
          caloriesBurned: 300
        }
      ]

      return mockWorkouts.slice(0, limit)
    } catch (error) {
      console.error('Error fetching workout data:', error)
      return []
    }
  }

  private async getMealData(depth: 'shallow' | 'medium' | 'deep'): Promise<MealContext[]> {
    try {
      // Mock meal data for minimal implementation
      const limit = depth === 'shallow' ? 3 : depth === 'medium' ? 7 : 30
      
      const mockMeals: MealContext[] = [
        {
          date: '2025-01-16',
          type: 'breakfast',
          foods: [
            { name: 'Oatmeal', quantity: 1, unit: 'bowl', calories: 300 }
          ],
          calories: 300,
          macros: { protein: 10, carbs: 50, fat: 5 }
        }
      ]

      return mockMeals.slice(0, limit)
    } catch (error) {
      console.error('Error fetching meal data:', error)
      return []
    }
  }

  private async getWeightData(depth: 'shallow' | 'medium' | 'deep'): Promise<WeightContext> {
    try {
      // Mock weight data for minimal implementation
      const limit = depth === 'shallow' ? 7 : depth === 'medium' ? 14 : 30
      
      return {
        currentWeight: 70,
        goalWeight: 65,
        trend: 'decreasing',
        entries: [
          { date: '2025-01-16', weight: 70 },
          { date: '2025-01-15', weight: 70.2 }
        ].slice(0, limit),
        unit: 'kg'
      }
    } catch (error) {
      console.error('Error fetching weight data:', error)
      return {
        currentWeight: 0,
        trend: 'stable',
        entries: [],
        unit: 'kg'
      }
    }
  }

  private async getTaskData(_depth: 'shallow' | 'medium' | 'deep'): Promise<TaskContext[]> {
    try {
      // Mock task data for minimal implementation
      return [
        {
          completed: 5,
          pending: 3,
          overdue: 1,
          categories: ['fitness', 'nutrition'],
          productivity: 'medium',
          streaks: 7
        }
      ]
    } catch (error) {
      console.error('Error fetching task data:', error)
      return []
    }
  }

  private async getUserPreferences(): Promise<UserPreferences> {
    try {
      // Mock user preferences for minimal implementation
      return {
        goals: ['weight loss', 'muscle gain'],
        dietaryRestrictions: ['vegetarian'],
        fitnessLevel: 'intermediate',
        preferredWorkoutTypes: ['strength', 'cardio'],
        timezone: 'UTC'
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return {
        goals: [],
        dietaryRestrictions: [],
        fitnessLevel: 'beginner',
        preferredWorkoutTypes: [],
        timezone: 'UTC'
      }
    }
  }

  private getFallbackContext(): UserContext {
    return {
      workouts: [],
      meals: [],
      weight: {
        currentWeight: 0,
        trend: 'stable',
        entries: [],
        unit: 'kg'
      },
      tasks: [],
      preferences: {
        goals: [],
        dietaryRestrictions: [],
        fitnessLevel: 'beginner',
        preferredWorkoutTypes: [],
        timezone: 'UTC'
      }
    }
  }
} 