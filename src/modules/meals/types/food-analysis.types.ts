export interface IdentifiedFood {
  name: string;
  confidence: number; // 0-1 confidence score
  portion: string;
  category?: string;
}

export interface CalorieEstimate {
  food: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  confidence: number;
}

export interface FoodAnalysisResult {
  foods: IdentifiedFood[];
  totalCalories: number;
  analysisTime: number;
  confidence: number;
  imageUrl?: string;
}

export interface ValidationResult {
  isValid: boolean;
  corrections: string[];
  confidence: number;
}

export interface VisionAgentConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface PhotoUploadProps {
  onPhotoCapture: (imageData: string) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

export interface FoodAnalysisAgentConfig extends VisionAgentConfig {
  nutritionApiUrl?: string;
  enableNutritionValidation?: boolean;
} 