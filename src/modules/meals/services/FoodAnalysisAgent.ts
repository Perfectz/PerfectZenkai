import { 
  FoodAnalysisAgentConfig, 
  FoodAnalysisResult, 
  IdentifiedFood, 
  CalorieEstimate,
  ValidationResult 
} from '../types';
import { NutritionValidator } from './NutritionValidator';

export class FoodAnalysisAgent {
  private config: FoodAnalysisAgentConfig;
  private nutritionValidator: NutritionValidator;

  constructor(config: FoodAnalysisAgentConfig) {
    this.config = {
      maxTokens: 1000,
      temperature: 0.1,
      ...config
    };
    this.nutritionValidator = new NutritionValidator();
  }

  async analyzePhoto(imageData: string, retries: number = 2): Promise<FoodAnalysisResult> {
    const startTime = Date.now();
    
    // Validate image data
    if (!imageData || !imageData.startsWith('data:image/')) {
      throw new Error('Invalid image data format');
    }
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.callOpenAIVision(imageData);
        const analysisTime = Date.now() - startTime;
        
        // Validate response
        if (!response.foods || response.foods.length === 0) {
          throw new Error('No foods detected in image');
        }
        
        return {
          ...response,
          analysisTime
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`Food analysis attempt ${attempt + 1} failed:`, lastError.message);
        
        if (attempt < retries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    console.error('Food analysis failed after all retries:', lastError);
    throw new Error(`Failed to analyze food image: ${lastError?.message || 'Unknown error'}`);
  }

  async estimateCalories(foods: IdentifiedFood[]): Promise<CalorieEstimate[]> {
    const estimates: CalorieEstimate[] = [];
    
    for (const food of foods) {
      // Basic calorie estimation logic - in production this would use a nutrition database
      const estimate = this.estimateCaloriesForFood(food);
      estimates.push(estimate);
    }
    
    return estimates;
  }

  async validateNutrition(foods: IdentifiedFood[]): Promise<ValidationResult> {
    return await this.nutritionValidator.validateFoods(foods);
  }

  private async callOpenAIVision(imageData: string): Promise<Omit<FoodAnalysisResult, 'analysisTime'>> {
    const prompt = `Analyze this food image and identify all food items visible. For each food item, provide:
1. Name of the food
2. Estimated portion size (e.g., "1 cup", "6 oz", "1 slice")
3. Confidence score (0-1)
4. Estimated calories

Respond in JSON format:
{
  "foods": [
    {
      "name": "food name",
      "portion": "portion size",
      "confidence": 0.95,
      "category": "food category"
    }
  ],
  "totalCalories": 450,
  "confidence": 0.88
}`;

    const payload = {
      model: this.config.model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: imageData
              }
            }
          ]
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI API');
    }

    try {
      const parsed = JSON.parse(content);
      return {
        foods: parsed.foods || [],
        totalCalories: parsed.totalCalories || 0,
        confidence: parsed.confidence || 0
      };
    } catch (error) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid response format from AI');
    }
  }

  private estimateCaloriesForFood(food: IdentifiedFood): CalorieEstimate {
    const nutritionData = this.nutritionValidator.getNutritionData(food.name);
    const calories = this.nutritionValidator.estimateCalories(food.name, food.portion);

    if (nutritionData) {
      return {
        food: food.name,
        calories,
        macros: {
          protein: nutritionData.protein,
          carbs: nutritionData.carbs,
          fat: nutritionData.fat
        },
        confidence: food.confidence
      };
    }

    // Fallback for unknown foods
    return {
      food: food.name,
      calories,
      macros: {
        protein: 5,
        carbs: 20,
        fat: 5
      },
      confidence: food.confidence * 0.7 // Reduce confidence for unknown foods
    };
  }
} 