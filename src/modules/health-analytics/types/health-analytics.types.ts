// src/modules/health-analytics/types/health-analytics.types.ts

// Core Health Data Types
export interface HealthData {
  weight?: WeightData
  nutrition?: NutritionData
  fitness?: FitnessData
  wellness?: WellnessData
}

export interface WeightData {
  current: number
  trend: 'increasing' | 'decreasing' | 'stable'
  change: number
  entries: number
  goal?: number
  timeline?: string
}

export interface NutritionData {
  averageCalories: number
  proteinIntake: number
  hydration: number
  meals: number
  macroBalance?: {
    protein: number
    carbs: number
    fat: number
  }
}

export interface FitnessData {
  workoutsPerWeek: number
  averageDuration: number
  caloriesBurned: number
  activeMinutes: number
  intensity?: 'light' | 'moderate' | 'intense'
  types?: string[]
}

export interface WellnessData {
  averageMood: number
  sleepQuality: number
  stressLevel: number
  journalEntries: number
  energyLevel?: number
}

// Health Insights & Analytics Types
export interface HealthInsights {
  weight?: WeightData
  nutrition?: NutritionData
  fitness?: FitnessData
  wellness?: WellnessData
  overallScore: number
  recommendations: string[]
  trends?: HealthTrends
  keyInsights?: string[]
  actionableItems?: string[]
  scoreBreakdown?: ScoreBreakdown
  dataAvailability?: DataAvailability
  moduleIntegration?: ModuleIntegration
  dataPoints?: number
  processingTime?: number
  error?: string
}

export interface HealthTrends {
  weight: 'improving' | 'stable' | 'declining'
  fitness: 'improving' | 'stable' | 'declining'
  nutrition: 'improving' | 'stable' | 'declining'
  wellness: 'improving' | 'stable' | 'declining'
}

export interface ScoreBreakdown {
  weight: number
  nutrition: number
  fitness: number
  wellness: number
}

export interface DataAvailability {
  sufficient: boolean
  missingModules?: string[]
  recommendations?: string[]
}

export interface ModuleIntegration {
  weight: boolean
  meals: boolean
  workouts: boolean
  journal: boolean
}

// Correlation Analysis Types
export interface CorrelationAnalysis {
  correlations: HealthCorrelation[]
  insights: string[]
  patterns?: HealthPatterns
}

export interface HealthCorrelation {
  metric1: string
  metric2: string
  correlation: number
  significance: 'weak' | 'moderate' | 'strong' | 'not significant'
  pValue: number
}

export interface HealthPatterns {
  weekly?: WeeklyPattern
  bestDays?: string[]
  challengingDays?: string[]
  recommendations?: string[]
}

export interface WeeklyPattern {
  [day: string]: {
    mood: number
    energy: number
    workouts: number
  }
}

// Prediction & Forecasting Types
export interface HealthPredictions {
  predictions: HealthPrediction[]
  insights: string[]
  goalProbabilities?: GoalProbability[]
  error?: string
  fallbackRecommendations?: string[]
  retryAfter?: string
}

export interface HealthPrediction {
  metric: string
  currentValue: number
  predictedValue: number
  confidence: number
  timeframe: string
  trend: 'improving' | 'stable' | 'declining'
}

export interface GoalProbability {
  goalType: string
  probability: number
  confidence: number
  recommendations: string[]
  timeline?: string
}

// Risk Assessment Types
export interface RiskAssessment {
  riskLevel: 'low' | 'moderate' | 'high'
  risks: HealthRisk[]
  overallScore: number
}

export interface HealthRisk {
  category: string
  risk: string
  severity: 'low' | 'moderate' | 'high'
  likelihood: number
  recommendations: string[]
}

// Health Profile & Recommendations Types
export interface HealthProfile {
  age?: number
  gender?: string
  goals?: string[]
  preferences?: string[]
  currentMetrics?: {
    weight: number
    fitness: number
    nutrition: number
    wellness: number
  }
  constraints?: string[]
  progressData?: ProgressData
  adherence?: AdherenceData
  lifestyle?: LifestyleData
}

export interface ProgressData {
  weightLoss?: {
    achieved: number
    target: number
    timeline: string
  }
  fitnessGain?: {
    achieved: number
    target: number
    timeline: string
  }
}

export interface AdherenceData {
  nutrition: number
  fitness: number
  wellness: number
}

export interface LifestyleData {
  workSchedule: string
  familyStatus: string
  travelFrequency: string
}

export interface HealthRecommendations {
  nutrition: string[]
  fitness: string[]
  lifestyle: string[]
  priority: 'high' | 'medium' | 'low'
  timeline: string
  expectedOutcomes: string[]
  adaptations?: RecommendationAdaptations
  motivationalMessages?: string[]
  adjustedTimeline?: string
  alternatives?: string[]
}

export interface RecommendationAdaptations {
  fitness?: string
  nutrition?: string
  lifestyle?: string
}

// Chat Integration Types
export interface ChatResponse {
  type: 'health-analysis' | 'diagnostic-assistance' | 'recommendations'
  insights?: string[]
  visualizations?: any
  followUpQuestions?: string[]
  possibleCauses?: string[]
  recommendations?: string[]
  dataRequests?: any
  context?: ChatContext
  contextAware?: boolean
  comparison?: any
  relativeTrends?: string[]
}

export interface ChatContext {
  previousQuery?: string
  analysisType?: string
  timeframe?: string
  focusArea?: string
}

// Service Interface Types
export interface IHealthDataAggregator {
  aggregateHealthData(userId: string, timeframe: string): Promise<HealthData>
  getModuleData(module: string): Promise<any>
}

export interface IHealthCorrelationEngine {
  analyzeCorrelations(healthData: any): Promise<CorrelationAnalysis>
}

export interface IHealthPredictionEngine {
  predictHealthTrends(userId: string, metrics: string[]): Promise<HealthPredictions>
}

export interface IHealthRiskAssessment {
  assessHealthRisks(currentData: any): Promise<RiskAssessment>
}

// Function Parameters for Chat Integration
export interface AnalyzeHealthParams {
  timeframe: 'week' | 'month' | 'quarter' | 'year'
  focusArea: 'all' | 'weight' | 'fitness' | 'nutrition' | 'wellness'
  includeRecommendations: boolean
}

export interface FindCorrelationsParams {
  primaryMetric: 'weight' | 'mood' | 'energy' | 'sleep' | 'exercise'
  secondaryMetrics: string[]
  timeframe: 'month' | 'quarter' | 'year'
}

export interface PredictHealthTrendsParams {
  metrics: string[]
  forecastPeriod: 'week' | 'month' | 'quarter'
  includeRiskAssessment: boolean
}

// Agent Configuration Types
export interface HealthAnalyticsConfig {
  enablePredictions?: boolean
  enableCorrelations?: boolean
  enableRiskAssessment?: boolean
  cacheTimeout?: number
  updateInterval?: number
  dataRetentionDays?: number
}

export interface PersonalizedRecommendations {
  nutrition: {
    recommendations: string[];
    priority: 'low' | 'medium' | 'high';
    reasoning: string;
  };
  fitness: {
    recommendations: string[];
    priority: 'low' | 'medium' | 'high';
    reasoning: string;
  };
  wellness: {
    recommendations: string[];
    priority: 'low' | 'medium' | 'high';
    reasoning: string;
  };
  medical: {
    recommendations: string[];
    priority: 'low' | 'medium' | 'high';
    reasoning: string;
  };
}

export interface HealthOverview {
  overallHealthScore: number;
  keyMetrics: {
    weightTrend: string;
    fitnessLevel: string;
    nutritionQuality: string;
    wellnessScore: number;
  };
  lastUpdated: string;
}

export interface HealthAlert {
  id: string;
  type: 'warning' | 'info' | 'critical';
  message: string;
  category: 'weight' | 'fitness' | 'nutrition' | 'wellness';
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  actionRequired?: boolean;
  recommendations?: string[];
}

export interface HealthDashboardData {
  summary: HealthOverview;
  quickStats: {
    currentWeight: number;
    weeklyWeightChange: number;
    totalWorkouts: number;
    averageCalories: number;
    sleepQuality: number;
    stressLevel: number;
  };
  recentTrends: HealthTrends;
  upcomingGoals: string[];
  healthAlerts: HealthAlert[];
}

// All types are exported as interfaces above 