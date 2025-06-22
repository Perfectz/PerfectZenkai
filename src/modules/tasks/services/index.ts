// src/modules/tasks/services/index.ts

export { TaskProductivityAgent } from './TaskProductivityAgent'
export { TaskPriorityEngine } from './TaskPriorityEngine'
export { ProductivityAnalyticsEngine } from './ProductivityAnalyticsEngine'
export { TaskSchedulingEngine } from './TaskSchedulingEngine'

export type {
  UserContext,
  ProductivityInsights,
  AgentResponse,
  ChatFunctions,
  ChatFunctionResult,
  TaskIntegration,
  EnhancedTodo
} from './TaskProductivityAgent'

export type {
  PriorityOptions,
  PrioritizedTask
} from './TaskPriorityEngine'

export type {
  CompletionAnalytics,
  TrendAnalysis,
  TimePatternAnalysis,
  WeeklyPatternAnalysis,
  ProductivityBottleneck,
  BottleneckSolution,
  StreakAnalysis,
  StreakPrediction
} from './ProductivityAnalyticsEngine'

export type {
  SchedulingPreferences,
  ScheduleRecommendation,
  OptimizedSchedule,
  FeasibilityAnalysis,
  WorkloadBalance,
  RedistributionSuggestion
} from './TaskSchedulingEngine' 