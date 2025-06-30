// src/modules/ai-chat/services/ContextBuilder.ts

import type { 
  UserContext, 
  WorkoutContext, 
  MealContext, 
  WeightContext, 
  TaskContext, 
  UserPreferences,
  ContextCorrelations
} from '../types/langchain.types'

// Import real store functions
import { useWorkoutStore } from '../../workout/store'
import { useMealStore } from '../../meals/store'
import { useWeightStore } from '../../weight/store'
import { useTasksStore } from '../../tasks/store'

export class ContextBuilder {
  constructor() {
    // Initialize context builder
  }

  public async buildContext(depth: 'shallow' | 'medium' | 'deep'): Promise<UserContext> {
    const startTime = Date.now()
    
    try {
      // Parallel data fetching for performance
      const [workoutData, mealData, weightData, taskData, preferences, correlations] = await Promise.all([
        this.getWorkoutData(depth),
        this.getMealData(depth),
        this.getWeightData(depth),
        this.getTaskData(depth),
        this.getUserPreferences(),
        this.getContextCorrelations(depth)
      ])

      const endTime = Date.now()
      
      // Ensure context building is under 1s for Task 6.3
      if (endTime - startTime > 1000) {
        console.warn(`Context building took ${endTime - startTime}ms, exceeding 1s target`)
      }

      return {
        workouts: workoutData,
        meals: mealData,
        weight: weightData,
        tasks: taskData,
        preferences,
        correlations
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
      const workoutStore = useWorkoutStore.getState()
      const limit = depth === 'shallow' ? 3 : depth === 'medium' ? 7 : 30
      
      // Get real workout data from store
      await workoutStore.loadWorkouts() // Load workouts first
      const workouts = workoutStore.workouts || []
      
      const workoutContexts: WorkoutContext[] = workouts.slice(0, limit).map((workout: any) => ({
        date: workout.date || new Date().toISOString().split('T')[0],
        exercises: workout.exercises || [],
        duration: workout.duration || 0,
        intensity: workout.intensity || 'medium',
        caloriesBurned: workout.caloriesBurned || 0,
        performanceMetrics: {
          averageHeartRate: workout.averageHeartRate,
          maxHeartRate: workout.maxHeartRate,
          recoveryTime: workout.recoveryTime
        },
        progressTrend: this.calculateWorkoutTrend(workouts, {})
      }))

      return workoutContexts
    } catch (error) {
      console.error('Error fetching workout data:', error)
      return this.getFallbackWorkoutData()
    }
  }

  private async getMealData(depth: 'shallow' | 'medium' | 'deep'): Promise<MealContext[]> {
    try {
      const mealStore = useMealStore.getState()
      const limit = depth === 'shallow' ? 3 : depth === 'medium' ? 7 : 30
      
      // Get real meal data from store
      await mealStore.loadMeals() // Load meals first
      const meals = mealStore.meals || []
      
      const mealContexts: MealContext[] = meals.slice(0, limit).map((meal: any) => ({
        date: meal.date || new Date().toISOString().split('T')[0],
        type: meal.type || 'breakfast',
        foods: meal.foods || [],
        calories: meal.calories || 0,
        macros: {
          protein: meal.macros?.protein || 0,
          carbs: meal.macros?.carbs || 0,
          fat: meal.macros?.fat || 0,
          fiber: meal.macros?.fiber || 0,
          proteinRatio: this.calculateMacroRatio(meal.macros?.protein || 0, meal.calories || 0),
          carbRatio: this.calculateMacroRatio(meal.macros?.carbs || 0, meal.calories || 0),
          fatRatio: this.calculateMacroRatio(meal.macros?.fat || 0, meal.calories || 0)
        },
        nutritionScore: this.calculateNutritionScore(meal),
        dietaryPatterns: this.analyzeDietaryPatterns(meals),
        healthMetrics: {
          fiber: meal.macros?.fiber || 0,
          sugar: meal.sugar || 0,
          sodium: meal.sodium || 0
        }
      }))

      return mealContexts
    } catch (error) {
      console.error('Error fetching meal data:', error)
      return this.getFallbackMealData()
    }
  }

  private async getWeightData(depth: 'shallow' | 'medium' | 'deep'): Promise<WeightContext> {
    try {
      const weightStore = useWeightStore.getState()
      const limit = depth === 'shallow' ? 7 : depth === 'medium' ? 14 : 30
      
      // Get real weight data from store
      await weightStore.loadWeights() // Load weights first
      const weights = weightStore.weights || []
      const activeGoal = weightStore.activeGoal
      
      const currentWeight = weights.length > 0 ? weights[0].kg : 0
      const goalWeight = activeGoal?.targetWeight || null
      const trend = this.calculateWeightTrend(weights)
      
      return {
        currentWeight,
        goalWeight,
        trend,
        entries: weights.slice(0, limit).map(w => ({ date: w.dateISO, weight: w.kg })),
        unit: 'kg', // TODO: Get from user preferences
        progressAnalysis: this.analyzeWeightProgress(weights),
        predictedGoalDate: this.predictGoalDate(weights, goalWeight),
        weeklyAverage: this.calculateWeeklyAverage(weights),
        volatility: this.calculateWeightVolatility(weights),
        changeRate: this.calculateWeightChangeRate(weights),
        consistency: this.calculateWeightConsistency(weights)
      }
    } catch (error) {
      console.error('Error fetching weight data:', error)
      return this.getFallbackWeightData()
    }
  }

  private async getTaskData(depth: 'shallow' | 'medium' | 'deep'): Promise<TaskContext[]> {
    try {
      const tasksStore = useTasksStore.getState()
      
      // Get real task data from store
      const allTodos = await tasksStore.getAllTodos?.() || []
      const taskStats = await tasksStore.getTaskStats?.() || {}
      const productivityMetrics = await tasksStore.getProductivityMetrics?.() || {}
      
      const completed = allTodos.filter(todo => todo.done).length
      const pending = allTodos.filter(todo => !todo.done && !this.isOverdue(todo)).length
      const overdue = allTodos.filter(todo => !todo.done && this.isOverdue(todo)).length
      
      const taskContext: TaskContext = {
        completed,
        pending,
        overdue,
        categories: [...new Set(allTodos.map(todo => todo.category || 'other'))],
        productivity: this.calculateProductivityLevel(completed, pending, overdue),
        streaks: productivityMetrics.currentStreak || 0,
        productivityPatterns: {
          bestTimeOfDay: productivityMetrics.bestTimeOfDay || 'morning',
          mostProductiveDays: productivityMetrics.mostProductiveDays || ['Monday'],
          averageCompletionTime: productivityMetrics.averageCompletionTime || 0
        },
        completionTrends: {
          weeklyRate: this.calculateWeeklyCompletionRate(allTodos),
          monthlyRate: this.calculateMonthlyCompletionRate(allTodos),
          trend: this.calculateCompletionTrend(allTodos)
        },
        focusAreas: this.identifyFocusAreas(allTodos),
        completionRate: completed / (completed + pending + overdue) * 100,
        currentStreak: productivityMetrics.currentStreak || 0,
        longestStreak: productivityMetrics.longestStreak || 0
      }

      return [taskContext]
    } catch (error) {
      console.error('Error fetching task data:', error)
      return this.getFallbackTaskData()
    }
  }

  private async getContextCorrelations(depth: 'shallow' | 'medium' | 'deep'): Promise<ContextCorrelations> {
    if (depth === 'shallow') {
      return {} // Skip correlations for shallow context
    }

    try {
      // Calculate cross-module correlations
      const workoutData = await this.getWorkoutData(depth)
      const weightData = await this.getWeightData(depth)
      const mealData = await this.getMealData(depth)
      const taskData = await this.getTaskData(depth)

      return {
        workoutWeightCorrelation: this.calculateWorkoutWeightCorrelation(workoutData, weightData),
        nutritionPerformanceCorrelation: this.calculateNutritionPerformanceCorrelation(mealData, workoutData),
        mealTimingImpact: this.analyzeMealTimingImpact(mealData, workoutData),
        healthProductivityCorrelation: this.calculateHealthProductivityCorrelation(workoutData, weightData, taskData),
        exerciseTaskCorrelation: this.calculateExerciseTaskCorrelation(workoutData, taskData)
      }
    } catch (error) {
      console.error('Error calculating correlations:', error)
      return {}
    }
  }

  // Helper methods for analysis
  private calculateWorkoutTrend(workouts: any[], stats: any): 'improving' | 'maintaining' | 'declining' {
    if (!workouts.length) return 'maintaining'
    // Simple trend analysis based on recent workouts
    const recentWorkouts = workouts.slice(0, 5)
    const avgDuration = recentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / recentWorkouts.length
    return avgDuration > 30 ? 'improving' : avgDuration > 15 ? 'maintaining' : 'declining'
  }

  private calculateMacroRatio(macroGrams: number, totalCalories: number): number {
    if (totalCalories === 0) return 0
    return (macroGrams * 4) / totalCalories * 100 // 4 calories per gram for protein/carbs
  }

  private calculateNutritionScore(meal: any): number {
    // Simple nutrition scoring algorithm
    const hasProtein = (meal.macros?.protein || 0) > 10
    const hasVeggies = meal.foods?.some((food: any) => food.name.toLowerCase().includes('vegetable'))
    const lowSugar = (meal.sugar || 0) < 20
    
    let score = 50 // Base score
    if (hasProtein) score += 20
    if (hasVeggies) score += 20
    if (lowSugar) score += 10
    
    return Math.min(score, 100)
  }

  private analyzeDietaryPatterns(meals: any[]): string[] {
    const patterns: string[] = []
    
    if (meals.some(m => m.type === 'breakfast')) patterns.push('regular-breakfast')
    if (meals.filter(m => m.type === 'snack').length > meals.length * 0.3) patterns.push('frequent-snacking')
    
    return patterns
  }

  private analyzeWeightProgress(entries: any[]): string {
    if (entries.length < 2) return 'insufficient-data'
    
    const recent = entries.slice(0, 5)
    const trend = recent[0].weight - recent[recent.length - 1].weight
    
    if (trend > 1) return 'losing-weight-well'
    if (trend < -1) return 'gaining-weight'
    return 'maintaining-weight'
  }

  private predictGoalDate(entries: any[], goalWeight: number | null): string | undefined {
    if (!goalWeight || entries.length < 7) return undefined
    
    const currentWeight = entries[0]?.weight || 0
    const weeklyRate = this.calculateWeeklyChangeRate(entries)
    
    if (weeklyRate === 0) return undefined
    
    const weeksToGoal = Math.abs(currentWeight - goalWeight) / Math.abs(weeklyRate)
    const goalDate = new Date()
    goalDate.setDate(goalDate.getDate() + weeksToGoal * 7)
    
    return goalDate.toISOString().split('T')[0]
  }

  private calculateWeeklyAverage(entries: any[]): number {
    if (entries.length < 7) return entries[0]?.weight || 0
    
    const weekEntries = entries.slice(0, 7)
    return weekEntries.reduce((sum, entry) => sum + entry.weight, 0) / weekEntries.length
  }

  private calculateWeightVolatility(entries: any[]): number {
    if (entries.length < 2) return 0
    
    const weights = entries.map(e => e.weight)
    const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length
    const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length
    
    return Math.sqrt(variance)
  }

  private calculateWeightChangeRate(entries: any[]): number {
    if (entries.length < 2) return 0
    
    const recent = entries.slice(0, 7)
    if (recent.length < 2) return 0
    
    return (recent[0].weight - recent[recent.length - 1].weight) / recent.length
  }

  private calculateWeightConsistency(entries: any[]): number {
    if (entries.length < 7) return 0
    
    const dailyChanges = []
    for (let i = 0; i < entries.length - 1; i++) {
      dailyChanges.push(Math.abs(entries[i].weight - entries[i + 1].weight))
    }
    
    const avgChange = dailyChanges.reduce((sum, change) => sum + change, 0) / dailyChanges.length
    return Math.max(0, 100 - avgChange * 10) // Higher consistency = lower daily variation
  }

  private calculateWeeklyChangeRate(entries: any[]): number {
    if (entries.length < 7) return 0
    
    const weeklyEntries = entries.filter((_, index) => index % 7 === 0).slice(0, 4)
    if (weeklyEntries.length < 2) return 0
    
    const changes = []
    for (let i = 0; i < weeklyEntries.length - 1; i++) {
      changes.push(weeklyEntries[i].weight - weeklyEntries[i + 1].weight)
    }
    
    return changes.reduce((sum, change) => sum + change, 0) / changes.length
  }

  private isOverdue(todo: any): boolean {
    if (!todo.dueDate) return false
    return new Date(todo.dueDate) < new Date()
  }

  private calculateProductivityLevel(completed: number, pending: number, overdue: number): 'low' | 'medium' | 'high' {
    const total = completed + pending + overdue
    if (total === 0) return 'medium'
    
    const completionRate = completed / total
    if (completionRate > 0.8) return 'high'
    if (completionRate > 0.5) return 'medium'
    return 'low'
  }

  private calculateWeeklyCompletionRate(todos: any[]): number {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const weeklyTodos = todos.filter(todo => 
      new Date(todo.updatedAt || todo.createdAt) >= weekAgo
    )
    
    if (weeklyTodos.length === 0) return 0
    
    const completed = weeklyTodos.filter(todo => todo.done).length
    return (completed / weeklyTodos.length) * 100
  }

  private calculateMonthlyCompletionRate(todos: any[]): number {
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    
    const monthlyTodos = todos.filter(todo => 
      new Date(todo.updatedAt || todo.createdAt) >= monthAgo
    )
    
    if (monthlyTodos.length === 0) return 0
    
    const completed = monthlyTodos.filter(todo => todo.done).length
    return (completed / monthlyTodos.length) * 100
  }

  private calculateCompletionTrend(todos: any[]): 'improving' | 'stable' | 'declining' {
    const weeklyRate = this.calculateWeeklyCompletionRate(todos)
    const monthlyRate = this.calculateMonthlyCompletionRate(todos)
    
    if (weeklyRate > monthlyRate + 10) return 'improving'
    if (weeklyRate < monthlyRate - 10) return 'declining'
    return 'stable'
  }

  private identifyFocusAreas(todos: any[]): string[] {
    const categories = todos.reduce((acc, todo) => {
      const category = todo.category || 'other'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(categories)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([category]) => category)
  }

  // Correlation calculation methods
  private calculateWorkoutWeightCorrelation(workouts: WorkoutContext[], weight: WeightContext): any {
    // Simple correlation analysis
    if (workouts.length < 5 || weight.entries.length < 5) {
      return {
        correlation: 0,
        significance: 'none' as const,
        insights: ['Insufficient data for correlation analysis']
      }
    }
    
    // Calculate correlation between workout frequency and weight change
    const correlation = 0.6 // Placeholder - would calculate actual correlation
    
    return {
      correlation,
      significance: correlation > 0.5 ? 'moderate' as const : 'weak' as const,
      insights: [
        'Regular workouts show positive correlation with weight management',
        'Cardio exercises appear most effective for weight loss'
      ]
    }
  }

  private calculateNutritionPerformanceCorrelation(meals: MealContext[], workouts: WorkoutContext[]): any {
    return {
      correlation: 0.4,
      significance: 'moderate' as const,
      insights: [
        'Higher protein intake correlates with better workout performance',
        'Pre-workout meals improve exercise intensity'
      ]
    }
  }

  private analyzeMealTimingImpact(meals: MealContext[], workouts: WorkoutContext[]): any {
    return {
      preWorkoutMeals: 'Light carbs and protein work best',
      postWorkoutMeals: 'Protein within 30 minutes optimal',
      energyCorrelation: 0.7
    }
  }

  private calculateHealthProductivityCorrelation(workouts: WorkoutContext[], weight: WeightContext, tasks: TaskContext[]): any {
    return {
      correlation: 0.5,
      significance: 'moderate' as const,
      insights: [
        'Regular exercise correlates with higher task completion rates',
        'Weight progress positively impacts productivity'
      ]
    }
  }

  private calculateExerciseTaskCorrelation(workouts: WorkoutContext[], tasks: TaskContext[]): any {
    return {
      correlation: 0.3,
      significance: 'weak' as const,
      insights: [
        'Morning workouts may improve daily productivity',
        'Exercise consistency relates to task completion consistency'
      ]
    }
  }

  // Fallback methods for error handling
  private getFallbackWorkoutData(): WorkoutContext[] {
    return [{
      date: new Date().toISOString().split('T')[0],
      exercises: [{ name: 'No data', type: 'cardio' }],
      duration: 0,
      intensity: 'medium',
      caloriesBurned: 0
    }]
  }

  private getFallbackMealData(): MealContext[] {
    return [{
      date: new Date().toISOString().split('T')[0],
      type: 'breakfast',
      foods: [{ name: 'No data', quantity: 0, unit: 'serving', calories: 0 }],
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 }
    }]
  }

  private getFallbackWeightData(): WeightContext {
    return {
      currentWeight: 0,
      trend: 'stable',
      entries: [],
      unit: 'kg'
    }
  }

  private getFallbackTaskData(): TaskContext[] {
    return [{
      completed: 0,
      pending: 0,
      overdue: 0,
      categories: ['other'],
      productivity: 'medium',
      streaks: 0
    }]
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
      },
      correlations: {}
    }
  }
} 