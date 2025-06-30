// src/modules/goals/types/goals-achievement.types.ts

// === CORE GOAL TYPES ===
export interface Goal {
  id: string
  userId: string
  title: string
  description: string
  category: GoalCategory
  priority: GoalPriority
  status: GoalStatus
  createdAt: string
  updatedAt: string
  targetDate?: string
  progress: number // 0-100 percentage
  tags?: string[]
}

export type GoalCategory = 
  | 'health' 
  | 'fitness' 
  | 'career' 
  | 'personal' 
  | 'financial' 
  | 'learning' 
  | 'social' 
  | 'creative'

export type GoalPriority = 'low' | 'medium' | 'high' | 'critical'

export type GoalStatus = 
  | 'planning' 
  | 'active' 
  | 'paused' 
  | 'completed' 
  | 'archived' 
  | 'cancelled'

// === SMART GOAL TYPES ===
export interface SmartGoal {
  specific: string
  measurable: string
  achievable: boolean
  relevant: boolean
  timeBound: TimeBound
}

export interface TimeBound {
  startDate: string
  targetDate: string
  duration: number // days
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  description: string
  targetDate: string
  progress: number
  completed: boolean
  metrics?: MilestoneMetric[]
}

export interface MilestoneMetric {
  name: string
  current: number
  target: number
  unit: string
}

// === GOAL OPTIMIZATION TYPES ===
export interface OptimizedGoal {
  originalGoal: string
  smart: SmartGoal
  timeline: GoalTimeline
  milestones: Milestone[]
  feasibilityScore: number
  riskFactors: RiskFactor[]
  recommendations: string[]
}

export interface GoalTimeline {
  totalDuration: number // days
  estimatedCompletion: string
  phases: GoalPhase[]
  checkpoints: string[]
}

export interface GoalPhase {
  name: string
  startDate: string
  endDate: string
  objectives: string[]
  estimatedEffort: number
}

export interface RiskFactor {
  type: string
  severity: 'low' | 'medium' | 'high'
  description: string
  mitigation: string
}

export interface FeasibilityAssessment {
  feasible: boolean
  feasibilityScore: number
  concerns: string[]
  alternatives: string[]
  recommendedAdjustments: string[]
}

export interface PrioritizedGoal {
  goal: Goal
  priorityScore: number
  reasoning: string
  recommendedOrder: number
  estimatedImpact: number
  estimatedEffort: number
}

// === USER CONTEXT TYPES ===
export interface UserContext {
  userId: string
  currentGoals?: Goal[]
  preferences?: UserPreferences
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced'
  availableTime?: string
  previousAttempts?: string[]
  currentWeight?: number
  targetWeight?: number
  runningHistory?: any[]
  workingContext?: string
}

export interface UserPreferences {
  focusAreas: GoalCategory[]
  communicationStyle: 'direct' | 'encouraging' | 'analytical'
  motivationType: 'achievement' | 'connection' | 'autonomy' | 'mastery'
  accountabilityLevel: 'low' | 'medium' | 'high'
  reminderFrequency: 'daily' | 'weekly' | 'as-needed'
}

// === PROGRESS TRACKING TYPES ===
export interface ProgressInsights {
  goalId: string
  currentProgress: number
  progressPercentage: number
  predictedCompletion: string
  momentum: MomentumAnalysis
  insights: ProgressInsight[]
  recommendations: string[]
}

export interface MomentumAnalysis {
  currentMomentum: number
  trend: 'increasing' | 'stable' | 'decreasing'
  consistencyScore: number
  patterns: ProgressPattern[]
  velocityMetrics: VelocityMetric[]
}

export interface ProgressPattern {
  type: string
  frequency: number
  description: string
  impact: 'positive' | 'negative' | 'neutral'
}

export interface VelocityMetric {
  period: 'daily' | 'weekly' | 'monthly'
  averageProgress: number
  projectedCompletion: string
}

export interface ProgressInsight {
  type: 'observation' | 'warning' | 'celebration' | 'suggestion'
  message: string
  data?: any
  actionable: boolean
}

export interface Activity {
  date: string
  type: string
  duration?: number
  intensity?: 'low' | 'medium' | 'high'
  completed?: boolean
  adherence?: number
  calories?: number
  [key: string]: any
}

// === BOTTLENECK ANALYSIS TYPES ===
export interface BottleneckAnalysis {
  goalId: string
  bottlenecks: Bottleneck[]
  recommendations: string[]
  estimatedImpact: number
  priorityOrder: string[]
}

export interface Bottleneck {
  type: string
  severity: number
  description: string
  frequency: number
  impact: number
  solutions: string[]
}

// === COMPLETION PREDICTION TYPES ===
export interface CompletionPrediction {
  probability: number
  confidence: number
  estimatedCompletionDate: string
  factorsInfluencing: InfluencingFactor[]
  scenarios: PredictionScenario[]
}

export interface InfluencingFactor {
  factor: string
  impact: number
  description: string
  controlLevel: 'high' | 'medium' | 'low'
}

export interface PredictionScenario {
  name: string
  probability: number
  completionDate: string
  description: string
}

// === MOTIVATION & COACHING TYPES ===
export interface MotivationStrategy {
  strategies: Strategy[]
  personalizedMessage: string
  accountabilityActions: string[]
  nextCheckIn: string
  tone: MotivationTone
}

export interface Strategy {
  type: StrategyType
  title: string
  description: string
  implementation: string[]
  expectedOutcome: string
  difficulty: 'easy' | 'medium' | 'challenging'
}

export type StrategyType = 
  | 'habit_formation'
  | 'environmental_design'
  | 'social_accountability'
  | 'reward_system'
  | 'mindset_shift'
  | 'skill_building'

export type MotivationTone = 
  | 'encouraging'
  | 'challenging'
  | 'supportive'
  | 'analytical'
  | 'celebratory'

export interface UserProfile {
  motivationType: UserPreferences['motivationType']
  personalityType?: 'introvert' | 'extrovert' | 'ambivert'
  previousSuccesses: string[]
  challengeAreas: string[]
  respondsBestTo?: string[]
  celebrationStyle?: 'public' | 'private' | 'social'
}

export interface GoalProgress {
  goalId: string
  progressPercentage: number
  daysActive: number
  strugglingAreas?: string[]
  recentActivity?: 'improving' | 'stable' | 'declining'
}

export interface AdaptedMotivation {
  tone: MotivationTone
  interventionType: 'reset' | 'adjustment' | 'breakthrough' | 'maintenance'
  urgency: 'low' | 'medium' | 'high'
  strategies: Strategy[]
  timeline: string
}

// === ACCOUNTABILITY TYPES ===
export interface AccountabilitySystem {
  reminders: Reminder[]
  checkIns: CheckIn[]
  socialFeatures: SocialFeature[]
  escalationTriggers: EscalationTrigger[]
}

export interface Reminder {
  id: string
  type: 'daily' | 'weekly' | 'milestone' | 'custom'
  time: string
  message: string
  channels: ('push' | 'email' | 'sms')[]
}

export interface CheckIn {
  id: string
  frequency: string
  questions: string[]
  format: 'quick' | 'detailed' | 'conversational'
  autoTriggers: string[]
}

export interface SocialFeature {
  type: 'buddy_system' | 'group_challenge' | 'public_commitment'
  enabled: boolean
  settings: Record<string, any>
}

export interface EscalationTrigger {
  condition: string
  threshold: number
  action: string
  delay: number // hours
}

// === ACHIEVEMENT CELEBRATION TYPES ===
export interface Achievement {
  goalId: string
  milestoneReached: string
  daysToAchieve: number
  significance: 'minor' | 'major' | 'milestone' | 'completion'
  metrics?: Record<string, number>
}

export interface Celebration {
  message: string
  rewards: Reward[]
  shareOptions: ShareOption[]
  nextMilestone: string
  badgeEarned?: Badge
}

export interface Reward {
  type: 'badge' | 'points' | 'unlock' | 'suggestion'
  title: string
  description: string
  value?: number
}

export interface ShareOption {
  platform: string
  message: string
  enabled: boolean
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// === ACTION PLANNING TYPES ===
export interface ActionPlan {
  goalId: string
  dailyActions: DailyAction[]
  weeklyActions: WeeklyAction[]
  milestones: Milestone[]
  estimatedTimeCommitment: TimeCommitment
  progressMarkers: ProgressMarker[]
}

export interface DailyAction {
  id: string
  title: string
  description: string
  estimatedTime: number // minutes
  priority: 'high' | 'medium' | 'low'
  dependencies: string[]
  category: string
}

export interface WeeklyAction {
  id: string
  title: string
  description: string
  dailyActions: string[] // DailyAction IDs
  estimatedHours: number
  objectives: string[]
}

export interface TimeCommitment {
  dailyMinutes: number
  weeklyHours: number
  peakEffortPeriods: string[]
  flexibleTimeSlots: string[]
}

export interface ProgressMarker {
  id: string
  title: string
  description: string
  measurable: boolean
  frequency: string
  successCriteria: string[]
}

export interface MilestoneStructure {
  weekly: Milestone[]
  monthly: Milestone[]
  checkpoints: string[]
  adjustmentOpportunities: string[]
}

// === TASK INTEGRATION TYPES ===
export interface TaskGoalConnection {
  goalId: string
  taskId: string
  relevanceScore: number
  contributionType: 'direct' | 'supporting' | 'preparatory'
  estimatedImpact: number
}

export interface TaskIntegration {
  relatedTasks: TaskGoalConnection[]
  newTaskSuggestions: string[]
  synergies: TaskSynergy[]
  optimizationOpportunities: string[]
}

export interface TaskSynergy {
  tasks: string[]
  synergy: string
  combinedImpact: number
  efficiency: number
}

// === CHAT INTEGRATION TYPES ===
export interface ChatQuery {
  query: string
  context: ChatContext
  intent?: 'optimization' | 'progress' | 'motivation' | 'planning'
}

export interface ChatContext {
  userId: string
  currentGoals?: Goal[]
  activeGoals?: string[]
  chatHistory?: ChatMessage[]
  requestType?: string
  currentMood?: string
  goalType?: string
  strugglingArea?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface ChatResponse {
  type: 'goal_optimization' | 'progress_analysis' | 'motivation' | 'planning'
  message: string
  actions: string[]
  followUpQuestions?: string[]
  data?: any
}

export interface ProgressAnalysisResponse {
  progressSummary: string
  insights: ProgressInsight[]
  recommendations: string[]
  encouragement: string
  metrics?: Record<string, number>
}

export interface MotivationResponse {
  motivationalMessage: string
  strategies: Strategy[]
  actionItems: string[]
  checkInReminder: string
  urgency: 'low' | 'medium' | 'high'
}

// === CROSS-MODULE INTEGRATION TYPES ===
export interface TaskModule {
  id: string
  description: string
  status: 'in_progress' | 'planned' | 'completed'
  frequency?: string
  category?: string
}

export interface TaskModuleIntegration {
  alignedTasks: TaskGoalConnection[]
  taskGoalConnections: TaskGoalConnection[]
  optimizationSuggestions: string[]
}

export interface HealthData {
  weight?: { date: string; value: number }[]
  workouts?: { date: string; type: string; duration: number }[]
  sleep?: { date: string; hours: number }[]
  nutrition?: { date: string; calories: number; macros: Record<string, number> }[]
}

export interface HealthIntegration {
  dataConnections: HealthDataConnection[]
  correlations: HealthCorrelation[]
  healthInsights: string[]
  recommendations: string[]
}

export interface HealthDataConnection {
  dataType: string
  goalRelevance: number
  trackingFrequency: string
  lastUpdate: string
}

export interface HealthCorrelation {
  metric1: string
  metric2: string
  correlation: number
  significance: 'low' | 'medium' | 'high'
  actionable: boolean
}

export interface JournalEntry {
  date: string
  mood: string
  reflections: string
  tags?: string[]
  rating?: number
}

export interface JournalIntegration {
  moodPatterns: MoodPattern[]
  reflectionInsights: string[]
  adjustmentRecommendations: string[]
  correlations: JournalCorrelation[]
}

export interface MoodPattern {
  mood: string
  frequency: number
  context: string[]
  goalAlignment: number
}

export interface JournalCorrelation {
  journalMetric: string
  goalMetric: string
  correlation: number
  insights: string[]
}

// === SUCCESS PREDICTION TYPES ===
export interface SuccessPrediction {
  successProbability: number
  confidenceLevel: number
  riskFactors: RiskFactor[]
  successFactors: SuccessFactor[]
  timelinePrediction: TimelinePrediction
}

export interface SuccessFactor {
  factor: string
  impact: number
  description: string
  strengthLevel: 'low' | 'medium' | 'high'
}

export interface TimelinePrediction {
  mostLikely: string
  optimistic: string
  pessimistic: string
  scenarios: PredictionScenario[]
}

export interface AchievementHistory {
  completedGoals: number
  averageCompletionTime: number
  successPatterns: string[]
  categoryPerformance: Record<string, number>
  preferredMethods: string[]
}

export interface SuccessPatterns {
  strongCategories: string[]
  challengingCategories: string[]
  optimalDuration: number
  successFactors: string[]
  commonPitfalls: string[]
}

export interface GoalOptimization {
  recommendations: OptimizationRecommendation[]
  estimatedImpact: number
  confidenceLevel: number
  alternativeApproaches: AlternativeApproach[]
}

export interface OptimizationRecommendation {
  type: 'timeline' | 'approach' | 'resources' | 'support'
  recommendation: string
  rationale: string
  expectedImprovement: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface AlternativeApproach {
  name: string
  description: string
  successRate: number
  timeCommitment: string
  resources: string[]
}

// === SERVICE INTERFACES ===
export interface GoalOptimizationEngine {
  optimizeGoal(goal: string, context: UserContext): Promise<OptimizedGoal>
  assessFeasibility(goal: string, context: UserContext): Promise<FeasibilityAssessment>
  prioritizeGoals(goals: any[]): Promise<PrioritizedGoal[]>
  suggestMilestones(goal: Goal): Promise<Milestone[]>
}

export interface ProgressIntelligenceEngine {
  trackProgress(goalId: string, activities: Activity[]): Promise<ProgressInsights>
  analyzeBottlenecks(goalId: string, activities: Activity[]): Promise<BottleneckAnalysis>
  calculateMomentum(progressData: any[]): Promise<MomentumAnalysis>
  predictCompletion(goal: any): Promise<CompletionPrediction>
}

export interface MotivationCoachingEngine {
  provideMotivation(progress: GoalProgress, profile: UserProfile): Promise<MotivationStrategy>
  adaptMotivation(progress: GoalProgress, profile: UserProfile): Promise<AdaptedMotivation>
  createAccountabilitySystem(goal: any, preferences: any): Promise<AccountabilitySystem>
  celebrateAchievement(achievement: Achievement, profile: UserProfile): Promise<Celebration>
}

export interface ActionPlanningEngine {
  planActions(goal: any, timeframe: string): Promise<ActionPlan>
  createMilestones(goal: any): Promise<MilestoneStructure>
  connectToTasks(goal: any, tasks: any[]): Promise<TaskIntegration>
  optimizeSchedule(plan: ActionPlan, constraints: any): Promise<ActionPlan>
}

export interface GoalsAchievementAgent {
  optimizeGoal(goal: string, context: UserContext): Promise<OptimizedGoal>
  trackProgress(goalId: string, activities: Activity[]): Promise<ProgressInsights>
  provideMotivation(progress: GoalProgress, profile: UserProfile): Promise<MotivationStrategy>
  planActions(goal: any, timeframe: string): Promise<ActionPlan>
  predictSuccess(goal: any, history: AchievementHistory): Promise<SuccessPrediction>
  
  // Additional methods for comprehensive functionality
  assessFeasibility(goal: string, context: UserContext): Promise<FeasibilityAssessment>
  prioritizeGoals(goals: any[]): Promise<PrioritizedGoal[]>
  analyzeBottlenecks(goalId: string, activities: Activity[]): Promise<BottleneckAnalysis>
  calculateMomentum(progressData: any[]): Promise<MomentumAnalysis>
  predictCompletion(goal: any): Promise<CompletionPrediction>
  adaptMotivation(progress: GoalProgress, profile: UserProfile): Promise<AdaptedMotivation>
  createAccountabilitySystem(goal: any, preferences: any): Promise<AccountabilitySystem>
  celebrateAchievement(achievement: Achievement, profile: UserProfile): Promise<Celebration>
  createMilestones(goal: any): Promise<MilestoneStructure>
  connectToTasks(goal: any, tasks: any[]): Promise<TaskIntegration>
  
  // Chat integration methods
  processChatQuery(query: string, context: ChatContext): Promise<ChatResponse>
  analyzeProgressChat(query: string, context: ChatContext): Promise<ProgressAnalysisResponse>
  motivateUser(query: string, context: ChatContext): Promise<MotivationResponse>
  
  // Cross-module integration methods
  integrateWithTasks(goal: any, tasks: TaskModule[]): Promise<TaskModuleIntegration>
  integrateWithHealth(goal: any, healthData: HealthData): Promise<HealthIntegration>
  integrateWithJournal(goal: any, entries: JournalEntry[]): Promise<JournalIntegration>
  
  // Success prediction methods
  analyzeSuccessPatterns(history: any[]): Promise<SuccessPatterns>
  suggestOptimizations(goal: any, analytics: any): Promise<GoalOptimization>
} 