import { MealType, MealEntry, FoodItem } from '../types'

export interface MealPlan {
  id: string
  userId?: string
  date: string
  meals: PlannedMeal[]
  totalCalories: number
  macroTargets: MacroTargets
  adherenceScore: number
  createdAt: string
}

export interface PlannedMeal {
  type: MealType
  plannedTime: string
  foods: FoodItem[]
  calories: number
  isCompleted: boolean
  actualEntry?: MealEntry
}

export interface MacroTargets {
  calories: number
  protein: number // grams
  carbs: number   // grams
  fat: number     // grams
  fiber: number   // grams
}

export interface MealPlanningPreferences {
  dietaryRestrictions: string[]
  preferredCalories: number
  macroRatios: {
    protein: number // percentage
    carbs: number   // percentage  
    fat: number     // percentage
  }
  mealTimes: {
    breakfast: string
    lunch: string
    dinner: string
    snack?: string
  }
  cookingTime: 'quick' | 'moderate' | 'extended'
  budgetRange: 'low' | 'medium' | 'high'
}

export interface SmartSuggestion {
  id: string
  type: 'meal_timing' | 'food_substitution' | 'macro_balance' | 'calorie_adjustment'
  title: string
  description: string
  recommendation: string
  confidence: number
  reasoning: string[]
  actionable: boolean
  data?: Record<string, unknown>
}

export interface MealReminder {
  id: string
  mealType: MealType
  scheduledTime: string
  message: string
  isActive: boolean
  priority: 'low' | 'medium' | 'high'
}

export class MealPlanningService {
  
  /**
   * Generate personalized meal plan for a specific date
   */
  async generateMealPlan(
    date: string, 
    preferences: MealPlanningPreferences,
    recentMeals: MealEntry[] = []
  ): Promise<MealPlan> {
    // Analyze recent eating patterns
    const patterns = this.analyzeEatingPatterns(recentMeals)
    
    // Generate optimized meal distribution
    const calorieDistribution = this.calculateMealDistribution(preferences.preferredCalories)
    
    // Create planned meals based on preferences and patterns
    const plannedMeals: PlannedMeal[] = [
      {
        type: 'breakfast',
        plannedTime: preferences.mealTimes.breakfast,
        foods: await this.generateMealFoods('breakfast', calorieDistribution.breakfast, preferences),
        calories: calorieDistribution.breakfast,
        isCompleted: false
      },
      {
        type: 'lunch', 
        plannedTime: preferences.mealTimes.lunch,
        foods: await this.generateMealFoods('lunch', calorieDistribution.lunch, preferences),
        calories: calorieDistribution.lunch,
        isCompleted: false
      },
      {
        type: 'dinner',
        plannedTime: preferences.mealTimes.dinner,
        foods: await this.generateMealFoods('dinner', calorieDistribution.dinner, preferences),
        calories: calorieDistribution.dinner,
        isCompleted: false
      }
    ]

    // Add snack if preferences include it
    if (preferences.mealTimes.snack && calorieDistribution.snack > 0) {
      plannedMeals.push({
        type: 'snack',
        plannedTime: preferences.mealTimes.snack,
        foods: await this.generateMealFoods('snack', calorieDistribution.snack, preferences),
        calories: calorieDistribution.snack,
        isCompleted: false
      })
    }

    const totalCalories = plannedMeals.reduce((sum, meal) => sum + meal.calories, 0)
    
    return {
      id: crypto.randomUUID(),
      date,
      meals: plannedMeals,
      totalCalories,
      macroTargets: this.calculateMacroTargets(preferences),
      adherenceScore: 0, // Will be calculated as meals are completed
      createdAt: new Date().toISOString()
    }
  }

  /**
   * Generate smart meal suggestions based on user patterns and time
   */
  async generateSmartSuggestions(
    recentMeals: MealEntry[],
    currentTime: Date = new Date()
  ): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = []
    const hour = currentTime.getHours()
    
    // Time-based meal suggestions
    if (hour >= 6 && hour <= 10) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'meal_timing',
        title: 'Morning Nutrition Window',
        description: 'Optimal time for high-protein breakfast',
        recommendation: 'Consider eggs, Greek yogurt, or protein smoothie',
        confidence: 0.85,
        reasoning: [
          'Current time is optimal for breakfast (6-10 AM)',
          'Protein intake supports muscle protein synthesis',
          'Sets positive metabolic tone for the day'
        ],
        actionable: true,
        data: { mealType: 'breakfast', suggestedCalories: 350 }
      })
    }

    // Pattern-based suggestions
    const patterns = this.analyzeEatingPatterns(recentMeals)
    
    if (patterns.averageCaloriesPerMeal < 300) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'calorie_adjustment',
        title: 'Low Calorie Pattern Detected',
        description: 'Your recent meals are below optimal calorie range',
        recommendation: 'Consider adding healthy fats or complex carbs',
        confidence: 0.78,
        reasoning: [
          `Average meal calories: ${patterns.averageCaloriesPerMeal}`,
          'Below recommended 300-500 calorie range',
          'May impact energy levels and metabolism'
        ],
        actionable: true,
        data: { targetIncrease: 150 }
      })
    }

    // Macro balance suggestions
    if (patterns.proteinPercentage < 20) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'macro_balance',
        title: 'Increase Protein Intake',
        description: 'Your protein intake is below optimal levels',
        recommendation: 'Add lean protein sources to your next meal',
        confidence: 0.82,
        reasoning: [
          `Current protein: ${patterns.proteinPercentage.toFixed(1)}%`,
          'Recommended range: 20-30%',
          'Protein supports muscle maintenance and satiety'
        ],
        actionable: true,
        data: { 
          currentProtein: patterns.proteinPercentage,
          targetProtein: 25,
          suggestedFoods: ['chicken breast', 'tofu', 'lentils', 'Greek yogurt']
        }
      })
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Schedule automatic meal reminders based on user preferences
   */
  async scheduleMealReminders(preferences: MealPlanningPreferences): Promise<{
    reminders: MealReminder[]
    nextReminder: MealReminder | null
  }> {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    const reminders: MealReminder[] = [
      {
        id: crypto.randomUUID(),
        mealType: 'breakfast',
        scheduledTime: `${today}T${preferences.mealTimes.breakfast}:00`,
        message: 'Time for a nutritious breakfast! Start your day right.',
        isActive: true,
        priority: 'medium'
      },
      {
        id: crypto.randomUUID(),
        mealType: 'lunch',
        scheduledTime: `${today}T${preferences.mealTimes.lunch}:00`,
        message: 'Lunch time! Fuel your afternoon with balanced nutrition.',
        isActive: true,
        priority: 'medium'
      },
      {
        id: crypto.randomUUID(),
        mealType: 'dinner',
        scheduledTime: `${today}T${preferences.mealTimes.dinner}:00`,
        message: 'Dinner time! Wind down with a wholesome meal.',
        isActive: true,
        priority: 'medium'
      }
    ]

    if (preferences.mealTimes.snack) {
      reminders.push({
        id: crypto.randomUUID(),
        mealType: 'snack',
        scheduledTime: `${today}T${preferences.mealTimes.snack}:00`,
        message: 'Snack time! A healthy snack can boost your energy.',
        isActive: true,
        priority: 'low'
      })
    }

    // Find next upcoming reminder
    const nextReminder = reminders
      .filter(r => new Date(r.scheduledTime).getTime() > now.getTime())
      .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())[0] || null

    return { reminders, nextReminder }
  }

  /**
   * Analyze user eating patterns from recent meals
   */
  private analyzeEatingPatterns(recentMeals: MealEntry[]) {
    if (recentMeals.length === 0) {
      return {
        averageCaloriesPerMeal: 0,
        proteinPercentage: 0,
        carbsPercentage: 0,
        fatPercentage: 0,
        mealsPerDay: 0,
        preferredMealTimes: {} as Record<MealType, string>,
        consistencyScore: 0
      }
    }

    const totalCalories = recentMeals.reduce((sum, meal) => sum + meal.nutrition.calories, 0)
    const totalProtein = recentMeals.reduce((sum, meal) => sum + meal.nutrition.protein, 0)
    const totalCarbs = recentMeals.reduce((sum, meal) => sum + meal.nutrition.carbs, 0)
    const totalFat = recentMeals.reduce((sum, meal) => sum + meal.nutrition.fat, 0)

    const totalMacros = totalProtein + totalCarbs + totalFat
    
    // Calculate preferred meal times by type
    const mealTimesByType: Record<MealType, Date[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    }

    recentMeals.forEach(meal => {
      mealTimesByType[meal.type].push(new Date(meal.timestamp))
    })

    const preferredMealTimes: Record<MealType, string> = {} as Record<MealType, string>
    Object.entries(mealTimesByType).forEach(([type, times]) => {
      if (times.length > 0) {
        const averageHour = times.reduce((sum, time) => sum + time.getHours(), 0) / times.length
        const averageMinute = times.reduce((sum, time) => sum + time.getMinutes(), 0) / times.length
        preferredMealTimes[type as MealType] = `${Math.round(averageHour).toString().padStart(2, '0')}:${Math.round(averageMinute).toString().padStart(2, '0')}`
      }
    })

    return {
      averageCaloriesPerMeal: totalCalories / recentMeals.length,
      proteinPercentage: totalMacros > 0 ? (totalProtein * 4 / totalCalories) * 100 : 0,
      carbsPercentage: totalMacros > 0 ? (totalCarbs * 4 / totalCalories) * 100 : 0,
      fatPercentage: totalMacros > 0 ? (totalFat * 9 / totalCalories) * 100 : 0,
      mealsPerDay: this.calculateAverageMealsPerDay(recentMeals),
      preferredMealTimes,
      consistencyScore: this.calculateConsistencyScore(recentMeals)
    }
  }

  /**
   * Calculate optimal calorie distribution across meals
   */
  private calculateMealDistribution(totalCalories: number) {
    return {
      breakfast: Math.round(totalCalories * 0.25), // 25%
      lunch: Math.round(totalCalories * 0.35),     // 35% 
      dinner: Math.round(totalCalories * 0.30),    // 30%
      snack: Math.round(totalCalories * 0.10)      // 10%
    }
  }

  /**
   * Generate meal foods based on meal type and calorie target
   */
  private async generateMealFoods(
    mealType: MealType, 
    calorieTarget: number, 
    preferences: MealPlanningPreferences
  ): Promise<FoodItem[]> {
    // This would ideally connect to a food database or nutrition API
    // For now, providing sample foods based on meal type and preferences
    // TODO: Use preferences.dietaryRestrictions and preferences.cookingTime in future implementation
    // TODO: Use preferences.dietaryRestrictions and macroRatios to customize foods
    
    const mealTemplates: Record<MealType, FoodItem[]> = {
      breakfast: [
        {
          id: crypto.randomUUID(),
          name: 'Oatmeal with berries',
          quantity: 1,
          unit: 'serving',
          calories: Math.round(calorieTarget * 0.6),
          macros: {
            protein: Math.round(calorieTarget * 0.6 * 0.15 / 4),
            carbs: Math.round(calorieTarget * 0.6 * 0.65 / 4),
            fat: Math.round(calorieTarget * 0.6 * 0.20 / 9),
            fiber: 8
          }
        },
        {
          id: crypto.randomUUID(),
          name: 'Greek yogurt',
          quantity: 1,
          unit: 'cup',
          calories: Math.round(calorieTarget * 0.4),
          macros: {
            protein: Math.round(calorieTarget * 0.4 * 0.50 / 4),
            carbs: Math.round(calorieTarget * 0.4 * 0.30 / 4),
            fat: Math.round(calorieTarget * 0.4 * 0.20 / 9),
            fiber: 0
          }
        }
      ],
      lunch: [
        {
          id: crypto.randomUUID(),
          name: 'Grilled chicken salad',
          quantity: 1,
          unit: 'serving',
          calories: calorieTarget,
          macros: {
            protein: Math.round(calorieTarget * 0.35 / 4),
            carbs: Math.round(calorieTarget * 0.25 / 4),
            fat: Math.round(calorieTarget * 0.40 / 9),
            fiber: 12
          }
        }
      ],
      dinner: [
        {
          id: crypto.randomUUID(),
          name: 'Salmon with quinoa and vegetables',
          quantity: 1,
          unit: 'serving',
          calories: calorieTarget,
          macros: {
            protein: Math.round(calorieTarget * 0.30 / 4),
            carbs: Math.round(calorieTarget * 0.35 / 4),
            fat: Math.round(calorieTarget * 0.35 / 9),
            fiber: 10
          }
        }
      ],
      snack: [
        {
          id: crypto.randomUUID(),
          name: 'Mixed nuts and apple',
          quantity: 1,
          unit: 'serving',
          calories: calorieTarget,
          macros: {
            protein: Math.round(calorieTarget * 0.15 / 4),
            carbs: Math.round(calorieTarget * 0.50 / 4),
            fat: Math.round(calorieTarget * 0.35 / 9),
            fiber: 6
          }
        }
      ]
    }

    return mealTemplates[mealType] || []
  }

  /**
   * Calculate macro targets based on preferences
   */
  private calculateMacroTargets(preferences: MealPlanningPreferences): MacroTargets {
    const { preferredCalories, macroRatios } = preferences
    
    return {
      calories: preferredCalories,
      protein: Math.round((preferredCalories * macroRatios.protein / 100) / 4),
      carbs: Math.round((preferredCalories * macroRatios.carbs / 100) / 4),
      fat: Math.round((preferredCalories * macroRatios.fat / 100) / 9),
      fiber: Math.round(preferredCalories / 1000 * 14) // 14g per 1000 calories
    }
  }

  /**
   * Calculate average meals per day from recent history
   */
  private calculateAverageMealsPerDay(meals: MealEntry[]): number {
    if (meals.length === 0) return 0
    
    const dates = new Set(meals.map(meal => meal.timestamp.split('T')[0]))
    return meals.length / dates.size
  }

  /**
   * Calculate consistency score based on meal timing patterns
   */
  private calculateConsistencyScore(meals: MealEntry[]): number {
    if (meals.length < 7) return 0 // Need at least a week of data
    
    const mealsByType: Record<MealType, Date[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: []
    }

    meals.forEach(meal => {
      mealsByType[meal.type].push(new Date(meal.timestamp))
    })

    let totalVariance = 0
    let mealTypesWithData = 0

    Object.values(mealsByType).forEach(times => {
      if (times.length >= 3) { // Need at least 3 data points
        const hours = times.map(time => time.getHours() + time.getMinutes() / 60)
        const mean = hours.reduce((sum, hour) => sum + hour, 0) / hours.length
        const variance = hours.reduce((sum, hour) => sum + Math.pow(hour - mean, 2), 0) / hours.length
        totalVariance += variance
        mealTypesWithData++
      }
    })

    if (mealTypesWithData === 0) return 0

    const averageVariance = totalVariance / mealTypesWithData
    // Convert variance to consistency score (0-1, where 1 is most consistent)
    return Math.max(0, 1 - (averageVariance / 4)) // Normalize assuming 4-hour variance = 0 consistency
  }
}

// Export singleton instance
export const mealPlanningService = new MealPlanningService() 