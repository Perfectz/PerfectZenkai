// src/modules/workout/types/workout-fitness.types.ts

// === CORE TYPES ===
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type WorkoutType = 'strength' | 'cardio' | 'flexibility' | 'mixed' | 'sports' | 'martial_arts'
export type ExerciseCategory = 'upper_body' | 'lower_body' | 'core' | 'full_body' | 'cardio' | 'flexibility'
export type EquipmentType = 'barbell' | 'dumbbells' | 'resistance_bands' | 'bodyweight' | 'bench' | 'cable_machine' | 'kettlebell' | 'medicine_ball'
export type FitnessGoal = 'weight_loss' | 'muscle_gain' | 'strength' | 'endurance' | 'flexibility' | 'general_fitness'
export type ProgressTrend = 'improving' | 'plateau' | 'declining' | 'stable'

// === FITNESS PROFILE ===
export interface FitnessProfile {
  age: number
  fitnessLevel: FitnessLevel
  goals: FitnessGoal[]
  availableEquipment: EquipmentType[]
  timeAvailable: number
  workoutFrequency: number
  injuries: string[]
  preferences: {
    workoutTypes: WorkoutType[]
    exerciseCategories: ExerciseCategory[]
  }
}

// === EXERCISE DEFINITIONS ===
export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  primaryMuscles: string[]
  secondaryMuscles?: string[]
  equipment: EquipmentType
  difficulty: FitnessLevel
  instructions: string[]
  formTips?: string[]
  safetyGuidelines?: string[]
  commonMistakes?: string[]
  contraindications?: string[]
  weight?: number
  reps?: number
  sets?: number
  duration?: number
}

export interface ExerciseSet {
  reps: number
  weight: number
  duration: number
  restTime: number
}

export interface WorkoutExercise {
  exerciseId: string
  name: string
  sets: ExerciseSet[]
  notes?: string
}

// === WORKOUT PLAN ===
export interface WorkoutPlan {
  id: string
  name: string
  workoutType: WorkoutType
  difficulty: FitnessLevel
  duration: number
  intensity: number
  exercises: Exercise[]
  modifications?: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkoutSession {
  id: string
  date: Date
  duration: number
  workoutType: WorkoutType
  exercises: WorkoutExercise[]
  notes?: string
  caloriesBurned?: number
  avgHeartRate?: number
  maxHeartRate?: number
}

// === PROGRESS TRACKING ===
export interface ProgressUpdate {
  sessionId: string
  performanceScore: number
  strengthGains: StrengthMetrics
  enduranceImprovements: EnduranceMetrics
  timestamp: Date
}

export interface StrengthMetrics {
  totalVolumeIncrease: number
  oneRepMaxEstimates: { [exercise: string]: number }
  powerOutput: number
  strengthScore: number
}

export interface EnduranceMetrics {
  avgHeartRateImprovement: number
  enduranceScore: number
  recoveryTime: number
  cardioCapacity: number
}

export interface ProgressTrendData {
  date: Date
  metric: string
  value: number
  trend: ProgressTrend
}

export interface FitnessInsights {
  overallFitnessScore: number
  strengthScore: number
  enduranceScore: number
  consistencyScore: number
  improvementRate: number
  progressTrends: ProgressTrendData[]
  recommendations: string[]
}

// === EXERCISE HISTORY ===
export interface ExerciseHistory {
  exerciseId: string
  totalSessions: number
  maxWeight: number
  avgReps: number
  lastPerformed: Date
  progressTrend: ProgressTrend
  formIssues: string[]
}

// === COACHING & GUIDANCE ===
export interface CoachingAdvice {
  formTips: string[]
  safetyReminders: string[]
  commonMistakes: string[]
  progressionSuggestions: string[]
  modifications: string[]
}

export interface CoachingTip {
  category: 'form' | 'safety' | 'progression' | 'motivation'
  message: string
  priority: 'low' | 'medium' | 'high'
  timing: 'before' | 'during' | 'after'
}

export interface SafetyGuideline {
  exerciseId: string
  guidelines: string[]
  contraindications: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

export interface InjuryModification {
  alternatives: Exercise[]
  modifications: string[]
  precautions: string[]
}

export interface RealtimeCoaching {
  motivationalCues: string[]
  formReminders: string[]
  breathingCues: string
  paceGuidance: string
}

export interface RecoveryRecommendation {
  restDayActivities: string[]
  stretchingRoutines: string[]
  sleepRecommendations: string
  nutritionTips: string
}

// === PERFORMANCE ANALYSIS ===
export interface PerformanceData {
  strength: StrengthMetrics
  endurance: EnduranceMetrics
  consistency: number
  goals: FitnessGoal[]
}

export interface WorkoutAdjustment {
  reason: string
  adjustments: string[]
  newPlan: WorkoutPlan
  rationale: string
}

export interface PlateauAnalysis {
  plateauDetected: boolean
  affectedExercises: string[]
  recommendations: string[]
  duration: number
}

export interface WorkoutEfficiency {
  efficiencyScore: number
  timeUtilization: number
  intensityRating: number
  recommendations: string[]
}

// === GAMIFICATION ===
export interface FitnessAchievement {
  id: string
  name: string
  description: string
  category: 'strength' | 'endurance' | 'consistency' | 'milestone'
  criteria: any
  unlockedAt?: Date
}

export interface WorkoutChallenge {
  id: string
  name: string
  description: string
  duration: number
  goals: any
  rewards: string[]
  participants?: number
}

export interface PersonalBest {
  exerciseId: string
  exerciseName: string
  metric: 'weight' | 'reps' | 'time' | 'distance'
  value: number
  achievedAt: Date
}

export interface ChallengeResponse {
  weeklyChallenge: WorkoutChallenge
  monthlyChallenge: WorkoutChallenge
  personalBests: PersonalBest[]
}

export interface AchievementResponse {
  newAchievements: FitnessAchievement[]
  progressTowardGoals: any
  milestoneReached: boolean
}

// === CHAT INTEGRATION ===
export interface WorkoutPlanRequest {
  query: string
  workoutType?: WorkoutType
  duration?: number
  targetMuscles?: string[]
  equipment?: EquipmentType[]
  fitnessLevel?: FitnessLevel
}

export interface WorkoutPlanResponse {
  success: boolean
  workoutPlan: WorkoutPlan
  message: string
  exercises: Exercise[]
}

export interface ExerciseGuidanceRequest {
  exerciseName: string
  userLevel: FitnessLevel
  specificConcerns?: string[]
  context?: string
}

export interface ExerciseGuidanceResponse {
  success: boolean
  formTips: string[]
  modifications: string[]
  message: string
  safetyNotes?: string[]
}

export interface ProgressAnalysisRequest {
  userId: string
  query: string
  timeframe: 'week' | 'month' | 'quarter' | 'year'
  focusArea: 'strength' | 'endurance' | 'overall'
  includeRecommendations: boolean
}

export interface ProgressAnalysisResponse {
  success: boolean
  progressSummary: string
  keyMetrics: any
  recommendations: string[]
  charts?: any
}

// === BODY COMPOSITION ===
export interface BodyCompositionAnalysis {
  muscleGainEstimate: number
  fatLossEstimate: number
  bodyCompositionTrend: ProgressTrend
  recommendations: string[]
}

export interface HealthGoalAlignment {
  workoutSplit: any
  cardioIntegration: any
  nutritionGuidance: string[]
}

// === WORKOUT STATS ===
export interface WorkoutStats {
  totalWorkouts: number
  totalDuration: number
  avgIntensity: number
  favoriteExercises: string[]
  consistencyScore: number
}

export interface ExerciseForm {
  exerciseId: string
  formScore: number
  commonIssues: string[]
  improvements: string[]
}

export interface InjuryPrevention {
  riskFactors: string[]
  preventiveMeasures: string[]
  warningSigns: string[]
}

// === WORKOUT RECOMMENDATION ===
export interface WorkoutRecommendation {
  workoutPlan: WorkoutPlan
  reasoning: string
  alternatives: WorkoutPlan[]
  adaptations: string[]
}

// === SERVICE INTERFACES ===
export interface IWorkoutPlanningEngine {
  generateWorkoutPlan(profile: FitnessProfile): Promise<WorkoutPlan>
  generateProgressiveWorkout(profile: FitnessProfile, basePlan: WorkoutPlan, week: number): Promise<WorkoutPlan>
  adaptForEquipment(plan: WorkoutPlan, equipment: EquipmentType[]): Promise<WorkoutPlan>
  adaptForInjuries(plan: WorkoutPlan, injuries: string[]): Promise<WorkoutPlan>
}

export interface IFitnessProgressEngine {
  trackProgress(session: WorkoutSession): Promise<ProgressUpdate>
  analyzeStrengthProgress(userId: string, timeframe: string): Promise<any>
  analyzeEnduranceProgress(userId: string, timeframe: string): Promise<any>
  detectPlateaus(userId: string, sessions: WorkoutSession[]): Promise<PlateauAnalysis>
}

export interface IFitnessCoachingEngine {
  provideCoaching(exercise: Exercise, history: ExerciseHistory): Promise<CoachingAdvice>
  getInjuryModifications(exercise: Exercise, injuries: string[]): Promise<InjuryModification>
  provideRealtimeCoaching(exerciseInProgress: any): Promise<RealtimeCoaching>
  getRecoveryRecommendations(userId: string, recentWorkouts: any[]): Promise<RecoveryRecommendation>
}

export interface IExerciseDatabase {
  getAllExercises(): Promise<Exercise[]>
  getExercisesByMuscleGroup(muscleGroup: string, equipment?: EquipmentType[]): Promise<Exercise[]>
  getAlternativeExercises(exerciseName: string, equipment: EquipmentType[]): Promise<Exercise[]>
  getExerciseById(exerciseId: string): Promise<Exercise>
}

export interface IWorkoutFitnessAgent {
  generateWorkoutPlan(profile: FitnessProfile): Promise<WorkoutPlan>
  trackProgress(session: WorkoutSession): Promise<ProgressUpdate>
  provideCoaching(exercise: Exercise, history: ExerciseHistory): Promise<CoachingAdvice>
  analyzePerformance(userId: string, timeframe: string): Promise<FitnessInsights>
  adaptWorkout(currentPlan: WorkoutPlan, performance: PerformanceData): Promise<WorkoutAdjustment>
}

// === PROGRESS DATA ===
export interface ProgressData {
  sessionId: string
  date: string
  duration: number
  estimatedDuration: number
  completionRate: number
  totalVolume: number
  averageIntensity: number
  caloriesBurned: number
  exercisesCompleted: number
  personalRecords: string[]
  improvements: string[]
  notes: string
  muscleGroupsWorked: string[]
  difficultyRating: FitnessLevel
}

export interface StrengthAnalysis {
  timeframe: string
  strengthGains: Record<string, number>
  volumeProgression: Array<{ week: number; volume: number }>
  oneRepMaxEstimates: Record<string, number>
  strengthScore: number
  recommendations: string[]
}

export interface EnduranceTracking {
  avgHeartRate: number
  maxHeartRate: number
  cardioEndurance: number
  recoveryTime: number
  enduranceScore: number
  improvements: {
    duration: number
    intensity: number
    recovery: number
  }
}

export interface FitnessScore {
  overall: number
  strength: number
  endurance: number
  flexibility: number
  composition: number
  trend: ProgressTrend
  improvements: string[]
  areas: string[]
}

export interface PlateauDetection {
  plateauDetected: boolean
  exerciseName: string
  duration: number
  recommendations: string[]
  breakoutStrategy: string[]
} 