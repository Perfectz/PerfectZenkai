import { IdentifiedFood, ValidationResult } from '../types';

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  commonPortions: string[];
}

// Basic nutrition database for validation
const NUTRITION_DATABASE: Record<string, NutritionData> = {
  // Proteins
  'grilled chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, commonPortions: ['3 oz', '4 oz', '6 oz'] },
  'salmon fillet': { calories: 206, protein: 22, carbs: 0, fat: 12, commonPortions: ['3 oz', '4 oz', '6 oz'] },
  'ground beef': { calories: 250, protein: 26, carbs: 0, fat: 15, commonPortions: ['3 oz', '4 oz', '1/4 lb'] },
  'eggs': { calories: 70, protein: 6, carbs: 0.6, fat: 5, commonPortions: ['1 large', '2 large', '3 large'] },
  
  // Carbs
  'white rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, commonPortions: ['1/2 cup', '1 cup', '1.5 cups'] },
  'brown rice': { calories: 112, protein: 2.6, carbs: 23, fat: 0.9, commonPortions: ['1/2 cup', '1 cup', '1.5 cups'] },
  'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1.1, commonPortions: ['1/2 cup', '1 cup', '1.5 cups'] },
  'bread slice': { calories: 79, protein: 2.3, carbs: 14, fat: 1.1, commonPortions: ['1 slice', '2 slices', '3 slices'] },
  
  // Vegetables
  'steamed broccoli': { calories: 25, protein: 3, carbs: 5, fat: 0.3, commonPortions: ['1/2 cup', '1 cup', '1.5 cups'] },
  'mixed salad': { calories: 20, protein: 1.5, carbs: 4, fat: 0.2, commonPortions: ['1 cup', '2 cups', '3 cups'] },
  'carrots': { calories: 25, protein: 0.5, carbs: 6, fat: 0.1, commonPortions: ['1/2 cup', '1 cup', '1 medium'] },
  
  // Fast Food
  'pizza slice': { calories: 285, protein: 12, carbs: 36, fat: 10, commonPortions: ['1 slice', '2 slices', '3 slices'] },
  'hamburger': { calories: 354, protein: 20, carbs: 32, fat: 16, commonPortions: ['1 burger', '1 small', '1 large'] },
  'french fries': { calories: 365, protein: 4, carbs: 63, fat: 17, commonPortions: ['small', 'medium', 'large'] },
  
  // Fruits
  'apple': { calories: 95, protein: 0.5, carbs: 25, fat: 0.3, commonPortions: ['1 medium', '1 large', '1 small'] },
  'banana': { calories: 105, protein: 1.3, carbs: 27, fat: 0.4, commonPortions: ['1 medium', '1 large', '1 small'] },
  'orange': { calories: 62, protein: 1.2, carbs: 15, fat: 0.2, commonPortions: ['1 medium', '1 large', '1 small'] }
};

export class NutritionValidator {
  
  async validateFoods(foods: IdentifiedFood[]): Promise<ValidationResult> {
    const corrections: string[] = [];
    let totalConfidence = 0;
    let validatedFoods = 0;

    for (const food of foods) {
      const validation = this.validateSingleFood(food);
      
      if (validation.isValid) {
        validatedFoods++;
        totalConfidence += food.confidence;
      } else {
        corrections.push(...validation.corrections);
      }
    }

    const overallConfidence = validatedFoods > 0 ? totalConfidence / validatedFoods : 0;
    const isValid = corrections.length === 0 && validatedFoods > 0;

    return {
      isValid,
      corrections,
      confidence: overallConfidence
    };
  }

  private validateSingleFood(food: IdentifiedFood): ValidationResult {
    const normalizedName = food.name.toLowerCase();
    const nutritionData = this.findNutritionData(normalizedName);
    const corrections: string[] = [];

    if (!nutritionData) {
      corrections.push(`Unknown food: "${food.name}" - using estimated values`);
      return {
        isValid: false,
        corrections,
        confidence: food.confidence * 0.7 // Reduce confidence for unknown foods
      };
    }

    // Validate portion size
    const isPortionValid = this.validatePortion(food.portion, nutritionData.commonPortions);
    if (!isPortionValid) {
      corrections.push(`Unusual portion for ${food.name}: "${food.portion}"`);
    }

    // Validate confidence threshold
    if (food.confidence < 0.6) {
      corrections.push(`Low confidence for ${food.name}: ${(food.confidence * 100).toFixed(0)}%`);
    }

    return {
      isValid: corrections.length === 0,
      corrections,
      confidence: food.confidence
    };
  }

  private findNutritionData(foodName: string): NutritionData | null {
    // Direct match
    if (NUTRITION_DATABASE[foodName]) {
      return NUTRITION_DATABASE[foodName];
    }

    // Fuzzy matching for common variations
    const keys = Object.keys(NUTRITION_DATABASE);
    for (const key of keys) {
      if (foodName.includes(key) || key.includes(foodName)) {
        return NUTRITION_DATABASE[key];
      }
    }

    // Check for common food words
    const foodWords = foodName.split(' ');
    for (const word of foodWords) {
      for (const key of keys) {
        if (key.includes(word) && word.length > 3) {
          return NUTRITION_DATABASE[key];
        }
      }
    }

    return null;
  }

  private validatePortion(portion: string, commonPortions: string[]): boolean {
    const normalizedPortion = portion.toLowerCase();
    
    return commonPortions.some(common => {
      const normalizedCommon = common.toLowerCase();
      return normalizedPortion.includes(normalizedCommon) || 
             normalizedCommon.includes(normalizedPortion);
    });
  }

  // Get nutrition data for a food item
  getNutritionData(foodName: string): NutritionData | null {
    return this.findNutritionData(foodName.toLowerCase());
  }

  // Estimate calories based on portion and food type
  estimateCalories(foodName: string, portion: string): number {
    const nutritionData = this.findNutritionData(foodName.toLowerCase());
    if (!nutritionData) {
      return 150; // Default estimate for unknown foods
    }

    // Simple portion multiplier logic
    const portionMultiplier = this.getPortionMultiplier(portion);
    return Math.round(nutritionData.calories * portionMultiplier);
  }

  private getPortionMultiplier(portion: string): number {
    const normalizedPortion = portion.toLowerCase();
    
    // Extract numbers from portion string
    const numberMatch = normalizedPortion.match(/(\d+(?:\.\d+)?)/);
    const baseNumber = numberMatch ? parseFloat(numberMatch[1]) : 1;

    // Adjust based on portion type
    if (normalizedPortion.includes('large')) return baseNumber * 1.5;
    if (normalizedPortion.includes('small')) return baseNumber * 0.7;
    if (normalizedPortion.includes('medium')) return baseNumber * 1.0;
    if (normalizedPortion.includes('cup')) return baseNumber * 1.0;
    if (normalizedPortion.includes('slice')) return baseNumber * 1.0;
    if (normalizedPortion.includes('oz')) return baseNumber / 3; // 3oz is typical serving
    
    return baseNumber;
  }
} 