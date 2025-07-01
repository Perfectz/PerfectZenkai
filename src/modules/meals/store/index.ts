import { create } from 'zustand'
import { MealEntry, MealEntryInput, DietAnalytics, MealSuggestions, MealType } from '../types'
import { offlineSyncService } from '@/shared/services/OfflineSyncService'

interface MealState {
  // Data
  meals: MealEntry[]
  analytics: DietAnalytics | null
  suggestions: MealSuggestions | null
  
  // Loading states
  isLoading: boolean
  isAnalyticsLoading: boolean
  isSuggestionsLoading: boolean
  
  // Error states
  error: string | null
  
  // Actions
  loadMeals: () => Promise<void>
  addMeal: (meal: MealEntryInput) => Promise<void>
  updateMeal: (id: string, meal: Partial<MealEntryInput>) => Promise<void>
  deleteMeal: (id: string) => Promise<void>
  loadAnalytics: () => Promise<void>
  loadSuggestions: () => Promise<void>
  clearError: () => void
}

export const useMealStore = create<MealState>((set, get) => ({
  // Initial state
  meals: [],
  analytics: null,
  suggestions: null,
  isLoading: false,
  isAnalyticsLoading: false,
  isSuggestionsLoading: false,
  error: null,

  // Actions
  loadMeals: async () => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        // TODO: Implement meal repository and replace mock data
        // const meals = await mealRepo.getAll()
        // set({ meals, isLoading: false })
        
        // Temporary mock data for development
        set({ 
          meals: [], 
          isLoading: false 
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to load meals (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load meals after multiple retries',
            isLoading: false 
          })
        }
      }
    }
  },

  addMeal: async (mealInput: MealEntryInput) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        // TODO: Implement meal repository
        // const newMeal = await mealRepo.create(mealInput)
        // const currentMeals = get().meals
        // set({ meals: [newMeal, ...currentMeals], isLoading: false })
        
        // Temporary mock implementation
        const newMeal: MealEntry = {
          id: crypto.randomUUID(),
          userId: undefined,
          type: mealInput.type,
          timestamp: mealInput.timestamp || new Date().toISOString(),
          foods: mealInput.foods.map(food => ({
            ...food,
            id: crypto.randomUUID()
          })),
          photos: mealInput.photos,
          notes: mealInput.notes,
          location: mealInput.location,
          nutrition: {
            calories: mealInput.foods.reduce((sum, food) => sum + food.calories, 0),
            protein: mealInput.foods.reduce((sum, food) => sum + food.macros.protein, 0),
            carbs: mealInput.foods.reduce((sum, food) => sum + food.macros.carbs, 0),
            fat: mealInput.foods.reduce((sum, food) => sum + food.macros.fat, 0),
            fiber: mealInput.foods.reduce((sum, food) => sum + food.macros.fiber, 0),
          },
          context: mealInput.context ? {
            location: mealInput.context.location,
            voiceNotes: mealInput.context.voiceNotes,
            tags: mealInput.context.tags || [],
            mood: mealInput.context.mood,
            hunger: mealInput.context.hunger,
            satisfaction: mealInput.context.satisfaction,
          } : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        const currentMeals = get().meals
        set({ meals: [newMeal, ...currentMeals], isLoading: false })

        // TODO: Integrate with mealRepo and then queue for offline sync
        offlineSyncService.queueOperation({
          type: 'CREATE',
          table: 'meals',
          data: newMeal,
          localId: newMeal.id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to add meal (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add meal after multiple retries',
            isLoading: false 
          })
          throw error
        }
      }
    }
  },

  updateMeal: async (id: string, mealUpdate: Partial<MealEntryInput>) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        // TODO: Implement meal repository
        // const updatedMeal = await mealRepo.update(id, mealUpdate)
        // const currentMeals = get().meals
        // const updatedMeals = currentMeals.map(meal => 
        //   meal.id === id ? updatedMeal : meal
        // )
        // set({ meals: updatedMeals, isLoading: false })
        
        // Temporary mock implementation
        const currentMeals = get().meals
        const updatedMeals = currentMeals.map(meal => {
          if (meal.id === id) {
            const updatedMeal: MealEntry = {
              ...meal,
              type: mealUpdate.type || meal.type,
              timestamp: mealUpdate.timestamp || meal.timestamp,
              foods: mealUpdate.foods ? mealUpdate.foods.map(food => ({
                ...food,
                id: crypto.randomUUID()
              })) : meal.foods,
              photos: mealUpdate.photos !== undefined ? mealUpdate.photos : meal.photos,
              notes: mealUpdate.notes !== undefined ? mealUpdate.notes : meal.notes,
              location: mealUpdate.location !== undefined ? mealUpdate.location : meal.location,
              nutrition: mealUpdate.foods ? {
                calories: mealUpdate.foods.reduce((sum, food) => sum + food.calories, 0),
                protein: mealUpdate.foods.reduce((sum, food) => sum + food.macros.protein, 0),
                carbs: mealUpdate.foods.reduce((sum, food) => sum + food.macros.carbs, 0),
                fat: mealUpdate.foods.reduce((sum, food) => sum + food.macros.fat, 0),
                fiber: mealUpdate.foods.reduce((sum, food) => sum + food.macros.fiber, 0),
              } : meal.nutrition,
              context: mealUpdate.context ? {
                location: mealUpdate.context.location,
                voiceNotes: mealUpdate.context.voiceNotes,
                tags: mealUpdate.context.tags || [],
                mood: mealUpdate.context.mood,
                hunger: mealUpdate.context.hunger,
                satisfaction: mealUpdate.context.satisfaction,
              } : meal.context,
              updatedAt: new Date().toISOString(),
            }
            return updatedMeal
          }
          return meal
        })
        set({ meals: updatedMeals, isLoading: false })

        // TODO: Integrate with mealRepo and then queue for offline sync
        offlineSyncService.queueOperation({
          type: 'UPDATE',
          table: 'meals',
          data: { id, ...mealUpdate },
          localId: id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to update meal (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update meal after multiple retries',
            isLoading: false 
          })
          throw error
        }
      }
    }
  },

  deleteMeal: async (id: string) => {
    set({ isLoading: true, error: null })
    const MAX_RETRIES = 3
    const RETRY_DELAY_MS = 1000

    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        // TODO: Implement meal repository
        // await mealRepo.delete(id)
        // const currentMeals = get().meals
        // const filteredMeals = currentMeals.filter(meal => meal.id !== id)
        // set({ meals: filteredMeals, isLoading: false })
        
        // Temporary mock implementation
        const currentMeals = get().meals
        const filteredMeals = currentMeals.filter(meal => meal.id !== id)
        set({ meals: filteredMeals, isLoading: false })

        // TODO: Integrate with mealRepo and then queue for offline sync
        offlineSyncService.queueOperation({
          type: 'DELETE',
          table: 'meals',
          data: { id },
          localId: id,
          timestamp: new Date().toISOString(),
        })
        return // Success, exit function
      } catch (error) {
        console.error(`❌ Failed to delete meal (attempt ${i + 1}/${MAX_RETRIES}):`, error)
        if (i < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, i)))
        } else {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete meal after multiple retries',
            isLoading: false 
          })
          throw error
        }
      }
    }
  },

  loadAnalytics: async () => {
    set({ isAnalyticsLoading: true, error: null })
    try {
      // TODO: Implement analytics calculation
      const meals = get().meals
      
      // Calculate basic analytics
      const totalMeals = meals.length
      const totalCalories = meals.reduce((sum, meal) => sum + meal.nutrition.calories, 0)
      const averageCalories = totalMeals > 0 ? totalCalories / totalMeals : 0
      
      // Weekly and monthly calculations (simplified)
      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      const weeklyMeals = meals.filter(meal => new Date(meal.timestamp) >= weekAgo)
      const monthlyMeals = meals.filter(meal => new Date(meal.timestamp) >= monthAgo)
      
      const weeklyCalories = weeklyMeals.reduce((sum, meal) => sum + meal.nutrition.calories, 0)
      const monthlyCalories = monthlyMeals.reduce((sum, meal) => sum + meal.nutrition.calories, 0)
      
      // Macro balance calculation
      const totalProtein = meals.reduce((sum, meal) => sum + meal.nutrition.protein, 0)
      const totalCarbs = meals.reduce((sum, meal) => sum + meal.nutrition.carbs, 0)
      const totalFat = meals.reduce((sum, meal) => sum + meal.nutrition.fat, 0)
      const totalMacros = totalProtein + totalCarbs + totalFat
      
      const macroBalance = totalMacros > 0 ? {
        protein: (totalProtein / totalMacros) * 100,
        carbs: (totalCarbs / totalMacros) * 100,
        fat: (totalFat / totalMacros) * 100,
      } : { protein: 0, carbs: 0, fat: 0 }
      
      // Meal frequency
      const mealFrequency = meals.reduce((freq, meal) => {
        freq[meal.type] = (freq[meal.type] || 0) + 1
        return freq
      }, {} as Record<string, number>)
      
      // Calculate streak (simplified)
      const streak = 0 // TODO: Implement proper streak calculation
      
      const analytics: DietAnalytics = {
        totalMeals,
        averageCalories,
        weeklyCalories,
        monthlyCalories,
        macroBalance,
        mealFrequency: mealFrequency as Record<MealType, number>,
        streak,
      }
      
      set({ analytics, isAnalyticsLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load analytics',
        isAnalyticsLoading: false 
      })
    }
  },

  loadSuggestions: async () => {
    set({ isSuggestionsLoading: true, error: null })
    try {
      // TODO: Implement smart suggestions
      const suggestions: MealSuggestions = {
        byTimeOfDay: {
          '07:00': ['oatmeal', 'coffee', 'eggs'],
          '12:00': ['sandwich', 'salad', 'soup'],
          '18:00': ['chicken', 'rice', 'vegetables'],
          '21:00': ['yogurt', 'fruit', 'nuts'],
        },
        recentFoods: [],
        popularFoods: [],
        customFoods: [],
      }
      
      set({ suggestions, isSuggestionsLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load suggestions',
        isSuggestionsLoading: false 
      })
    }
  },

  clearError: () => {
    set({ error: null })
  },
})) 