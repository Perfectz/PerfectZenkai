import { describe, test, expect, beforeEach } from 'vitest'
import { WorkoutFitnessAgent } from '../services/WorkoutFitnessAgent'
import { WorkoutPlanningEngine } from '../services/WorkoutPlanningEngine'
import { FitnessProgressEngine } from '../services/FitnessProgressEngine'
import { FitnessCoachingEngine } from '../services/FitnessCoachingEngine'
import { ExerciseDatabase } from '../services/ExerciseDatabase'
import type {
  FitnessProfile,
  WorkoutPlan,
  WorkoutSession,
  ProgressUpdate,
  Exercise,
  ExerciseHistory,
  CoachingAdvice,
  FitnessInsights,
  PerformanceData,
  WorkoutAdjustment,
  WorkoutPlanRequest,
  ProgressAnalysisRequest,
  ExerciseGuidanceRequest,
  WorkoutRecommendation,
  FitnessGoal,
  WorkoutType,
  EquipmentType,
  FitnessLevel,
  ExerciseCategory,
  CoachingTip,
  SafetyGuideline,
  WorkoutStats,
  ExerciseForm,
  InjuryPrevention,
  RecoveryRecommendation
} from '../types/workout-fitness.types'

describe('WorkoutFitnessAgent', () => {
  let workoutAgent: WorkoutFitnessAgent
  let planningEngine: WorkoutPlanningEngine
  let progressEngine: FitnessProgressEngine
  let coachingEngine: FitnessCoachingEngine
  let exerciseDatabase: ExerciseDatabase

  beforeEach(() => {
    // Initialize ExerciseDatabase first since other services depend on it
    exerciseDatabase = new ExerciseDatabase()
    
    // Pass exerciseDatabase to services that require it
    planningEngine = new WorkoutPlanningEngine(exerciseDatabase)
    progressEngine = new FitnessProgressEngine()
    coachingEngine = new FitnessCoachingEngine()
    
    // Pass all dependencies to the main agent
    workoutAgent = new WorkoutFitnessAgent(
      planningEngine,
      progressEngine,
      coachingEngine,
      exerciseDatabase
    )
  })

  // === WORKOUT PLANNING AGENT ===
  describe('Workout Planning', () => {
    test('should generate personalized workout plan for strength training', async () => {
      const fitnessProfile: FitnessProfile = {
        age: 25,
        fitnessLevel: 'intermediate' as FitnessLevel,
        goals: ['muscle_gain', 'strength'] as FitnessGoal[],
        availableEquipment: ['barbell', 'dumbbells', 'bench'] as EquipmentType[],
        timeAvailable: 60,
        workoutFrequency: 4,
        injuries: [],
        preferences: {
          workoutTypes: ['strength'] as WorkoutType[],
          exerciseCategories: ['upper_body', 'lower_body'] as ExerciseCategory[]
        }
      }

      const workoutPlan = await workoutAgent.generateWorkoutPlan(fitnessProfile)

      expect(workoutPlan).toBeDefined()
      expect(workoutPlan.exercises.length).toBeGreaterThan(0)
      expect(workoutPlan.duration).toBeLessThanOrEqual(60)
      expect(workoutPlan.workoutType).toBe('strength')
      expect(workoutPlan.difficulty).toBe('intermediate')
    })

    test('should adapt workout plan based on available equipment', async () => {
      const homeProfile = {
        age: 30,
        fitnessLevel: 'beginner',
        goals: ['weight_loss'],
        availableEquipment: ['bodyweight'],
        timeAvailable: 30,
        workoutFrequency: 3,
        injuries: [],
        preferences: {
          workoutTypes: ['cardio', 'strength'],
          exerciseCategories: ['full_body']
        }
      }

      const workoutPlan = await workoutAgent.generateWorkoutPlan(homeProfile)

      expect(workoutPlan.exercises.every(ex => ex.equipment === 'bodyweight')).toBe(true)
      expect(workoutPlan.duration).toBeLessThanOrEqual(30)
      expect(workoutPlan.difficulty).toBe('beginner')
    })

    test('should consider user injuries in workout planning', async () => {
      const injuredProfile = {
        age: 35,
        fitnessLevel: 'advanced',
        goals: ['strength', 'endurance'],
        availableEquipment: ['dumbbells', 'resistance_bands'],
        timeAvailable: 45,
        workoutFrequency: 5,
        injuries: ['lower_back', 'right_knee'],
        preferences: {
          workoutTypes: ['strength', 'flexibility'],
          exerciseCategories: ['upper_body', 'core']
        }
      }

      const workoutPlan = await workoutAgent.generateWorkoutPlan(injuredProfile)

      expect(workoutPlan.exercises.some(ex => ex.contraindications?.includes('lower_back'))).toBe(false)
      expect(workoutPlan.exercises.some(ex => ex.contraindications?.includes('right_knee'))).toBe(false)
      expect(workoutPlan.modifications).toBeDefined()
    })

    test('should generate progressive workout plans over time', async () => {
      const profile = {
        age: 28,
        fitnessLevel: 'intermediate',
        goals: ['strength'],
        availableEquipment: ['barbell', 'dumbbells'],
        timeAvailable: 60,
        workoutFrequency: 4,
        injuries: [],
        preferences: {
          workoutTypes: ['strength'],
          exerciseCategories: ['full_body']
        }
      }

      const week1Plan = await workoutAgent.generateWorkoutPlan(profile)
      const week4Plan = await workoutAgent.generateProgressiveWorkout(profile, week1Plan, 4)

      expect(week4Plan.intensity).toBeGreaterThan(week1Plan.intensity)
      expect(week4Plan.exercises.some(ex => 
        ex.weight && week1Plan.exercises.find(w1 => w1.name === ex.name)?.weight && 
        ex.weight > week1Plan.exercises.find(w1 => w1.name === ex.name)?.weight!
      )).toBe(true)
    })
  })

  // === FITNESS PROGRESS TRACKING ===
  describe('Progress Tracking', () => {
    test('should track workout session performance accurately', async () => {
      const workoutSession = {
        id: 'session-1',
        date: new Date(),
        duration: 60,
        workoutType: 'strength',
        exercises: [
          {
            exerciseId: 'ex-1',
            name: 'Bench Press',
            sets: [
              { reps: 8, weight: 135, duration: 0, restTime: 90 },
              { reps: 8, weight: 145, duration: 0, restTime: 90 },
              { reps: 6, weight: 155, duration: 0, restTime: 120 }
            ],
            notes: 'Felt strong today'
          }
        ],
        notes: 'Good workout session',
        caloriesBurned: 300,
        avgHeartRate: 140,
        maxHeartRate: 165
      }

      const progressUpdate = await workoutAgent.trackProgress(workoutSession)

      expect(progressUpdate).toBeDefined()
      expect(progressUpdate.sessionId).toBe('session-1')
      expect(progressUpdate.performanceScore).toBeGreaterThan(0)
      expect(progressUpdate.strengthGains).toBeDefined()
      expect(progressUpdate.enduranceImprovements).toBeDefined()
    })

    test('should identify strength progression patterns', async () => {
      const userId = 'user-123'
      const timeframe = 'month'

      const progressAnalysis = await workoutAgent.analyzeStrengthProgress(userId, timeframe)

      expect(progressAnalysis.strengthMetrics).toBeDefined()
      expect(progressAnalysis.strengthMetrics.totalVolumeIncrease).toBeGreaterThanOrEqual(0)
      expect(progressAnalysis.strengthMetrics.oneRepMaxEstimates).toBeDefined()
      expect(progressAnalysis.progressTrends.length).toBeGreaterThan(0)
    })

    test('should track endurance improvements over time', async () => {
      const userId = 'user-123'
      const timeframe = 'quarter'

      const enduranceProgress = await workoutAgent.analyzeEnduranceProgress(userId, timeframe)

      expect(enduranceProgress.cardioMetrics).toBeDefined()
      expect(enduranceProgress.cardioMetrics.avgHeartRateImprovement).toBeDefined()
      expect(enduranceProgress.cardioMetrics.enduranceScore).toBeGreaterThanOrEqual(0)
      expect(enduranceProgress.recoveryMetrics).toBeDefined()
    })

    test('should calculate comprehensive fitness score', async () => {
      const userId = 'user-123'
      const timeframe = 'year'

      const fitnessInsights = await workoutAgent.analyzePerformance(userId, timeframe)

      expect(fitnessInsights.overallFitnessScore).toBeGreaterThanOrEqual(0)
      expect(fitnessInsights.overallFitnessScore).toBeLessThanOrEqual(100)
      expect(fitnessInsights.strengthScore).toBeDefined()
      expect(fitnessInsights.enduranceScore).toBeDefined()
      expect(fitnessInsights.consistencyScore).toBeDefined()
      expect(fitnessInsights.improvementRate).toBeDefined()
    })

    test('should detect workout plateaus and recommend changes', async () => {
      const userId = 'user-123'
      const recentSessions = []

      const plateauAnalysis = await workoutAgent.detectPlateaus(userId, recentSessions)

      expect(plateauAnalysis.plateauDetected).toBeDefined()
      expect(plateauAnalysis.affectedExercises).toBeDefined()
      expect(plateauAnalysis.recommendations.length).toBeGreaterThan(0)
    })
  })

  // === FITNESS COACHING ENGINE ===
  describe('Coaching Intelligence', () => {
    test('should provide exercise form guidance for beginners', async () => {
      const exercise = {
        id: 'ex-1',
        name: 'Deadlift',
        category: 'lower_body',
        primaryMuscles: ['hamstrings', 'glutes', 'erector_spinae'],
        equipment: 'barbell',
        difficulty: 'intermediate',
        instructions: ['Step 1', 'Step 2', 'Step 3']
      }

      const userHistory = {
        exerciseId: 'ex-1',
        totalSessions: 3,
        maxWeight: 135,
        avgReps: 8,
        lastPerformed: new Date(),
        progressTrend: 'improving',
        formIssues: ['rounded_back', 'knee_valgus']
      }

      const coachingAdvice = await workoutAgent.provideCoaching(exercise, userHistory)

      expect(coachingAdvice.formTips.length).toBeGreaterThan(0)
      expect(coachingAdvice.safetyReminders.length).toBeGreaterThan(0)
      expect(coachingAdvice.commonMistakes.length).toBeGreaterThan(0)
      expect(coachingAdvice.progressionSuggestions).toBeDefined()
    })

    test('should suggest exercise modifications for injuries', async () => {
      const exercise = {
        id: 'ex-2',
        name: 'Barbell Squat',
        category: 'lower_body',
        primaryMuscles: ['quadriceps', 'glutes'],
        equipment: 'barbell',
        difficulty: 'intermediate',
        instructions: ['Step 1', 'Step 2']
      }

      const injuryModifications = await workoutAgent.getInjuryModifications(exercise, ['knee_pain'])

      expect(injuryModifications.alternatives.length).toBeGreaterThan(0)
      expect(injuryModifications.modifications.length).toBeGreaterThan(0)
      expect(injuryModifications.precautions.length).toBeGreaterThan(0)
    })

    test('should provide real-time coaching cues during workouts', async () => {
      const exerciseInProgress = {
        exerciseId: 'ex-1',
        currentSet: 2,
        currentRep: 5,
        targetReps: 8,
        weight: 145,
        timeElapsed: 30
      }

      const realtimeCoaching = await workoutAgent.provideRealtimeCoaching(exerciseInProgress)

      expect(realtimeCoaching.motivationalCues.length).toBeGreaterThan(0)
      expect(realtimeCoaching.formReminders.length).toBeGreaterThan(0)
      expect(realtimeCoaching.breathingCues).toBeDefined()
      expect(realtimeCoaching.paceGuidance).toBeDefined()
    })

    test('should recommend recovery and rest day activities', async () => {
      const userId = 'user-123'
      const recentWorkouts = []

      const recoveryRecommendation = await workoutAgent.getRecoveryRecommendations(userId, recentWorkouts)

      expect(recoveryRecommendation.restDayActivities.length).toBeGreaterThan(0)
      expect(recoveryRecommendation.stretchingRoutines.length).toBeGreaterThan(0)
      expect(recoveryRecommendation.sleepRecommendations).toBeDefined()
      expect(recoveryRecommendation.nutritionTips).toBeDefined()
    })
  })

  // === EXERCISE DATABASE ===
  describe('Exercise Database', () => {
    test('should provide comprehensive exercise library', async () => {
      const allExercises = await exerciseDatabase.getAllExercises()

      expect(allExercises.length).toBeGreaterThan(200)
      expect(allExercises.every(ex => ex.name && ex.category && ex.primaryMuscles)).toBe(true)
    })

    test('should filter exercises by muscle group and equipment', async () => {
      const chestExercises = await exerciseDatabase.getExercisesByMuscleGroup('chest', ['dumbbells'])

      expect(chestExercises.every(ex => 
        ex.primaryMuscles.includes('chest') || ex.secondaryMuscles?.includes('chest')
      )).toBe(true)
      expect(chestExercises.every(ex => ex.equipment === 'dumbbells')).toBe(true)
    })

    test('should provide exercise alternatives for equipment substitution', async () => {
      const originalExercise = 'Barbell Bench Press'
      const availableEquipment = ['dumbbells']

      const alternatives = await exerciseDatabase.getAlternativeExercises(originalExercise, availableEquipment)

      expect(alternatives.length).toBeGreaterThan(0)
      expect(alternatives.every(alt => availableEquipment.includes(alt.equipment))).toBe(true)
    })

    test('should provide detailed exercise instructions and safety tips', async () => {
      const exercise = await exerciseDatabase.getExerciseById('deadlift-barbell')

      expect(exercise.instructions.length).toBeGreaterThan(3)
      expect(exercise.formTips.length).toBeGreaterThan(0)
      expect(exercise.safetyGuidelines.length).toBeGreaterThan(0)
      expect(exercise.commonMistakes.length).toBeGreaterThan(0)
    })
  })

  // === CHAT INTEGRATION ===
  describe('Chat Integration', () => {
    test('should handle workout generation requests through natural language', async () => {
      const request = {
        query: 'Create a 30-minute upper body strength workout for intermediate level with dumbbells',
        workoutType: 'strength',
        duration: 30,
        targetMuscles: ['chest', 'shoulders', 'arms'],
        equipment: ['dumbbells'],
        fitnessLevel: 'intermediate'
      }

      const response = await workoutAgent.handleWorkoutRequest(request)

      expect(response.success).toBe(true)
      expect(response.workoutPlan).toBeDefined()
      expect(response.message).toContain('workout plan')
      expect(response.exercises.length).toBeGreaterThan(0)
    })

    test('should provide exercise guidance through conversational interface', async () => {
      const guidanceRequest = {
        exerciseName: 'Push-up',
        userLevel: 'beginner',
        specificConcerns: ['proper form', 'wrist pain'],
        context: 'first time doing push-ups'
      }

      const guidance = await workoutAgent.handleGuidanceRequest(guidanceRequest)

      expect(guidance.success).toBe(true)
      expect(guidance.formTips.length).toBeGreaterThan(0)
      expect(guidance.modifications.length).toBeGreaterThan(0)
      expect(guidance.message).toContain('push-up')
    })

    test('should analyze progress through conversational queries', async () => {
      const analysisRequest = {
        userId: 'user-123',
        query: 'How has my strength improved over the last month?',
        timeframe: 'month',
        focusArea: 'strength',
        includeRecommendations: true
      }

      const analysis = await workoutAgent.handleProgressAnalysis(analysisRequest)

      expect(analysis.success).toBe(true)
      expect(analysis.progressSummary).toBeDefined()
      expect(analysis.keyMetrics).toBeDefined()
      expect(analysis.recommendations.length).toBeGreaterThan(0)
    })
  })

  // === CROSS-MODULE INTEGRATION ===
  describe('Cross-Module Integration', () => {
    test('should integrate with weight tracking for body composition analysis', async () => {
      const userId = 'user-123'
      const workoutData = []
      const weightData = []

      const bodyComposition = await workoutAgent.analyzeBodyComposition(userId, workoutData, weightData)

      expect(bodyComposition.muscleGainEstimate).toBeDefined()
      expect(bodyComposition.fatLossEstimate).toBeDefined()
      expect(bodyComposition.bodyCompositionTrend).toBeDefined()
    })

    test('should align workout plans with health goals', async () => {
      const healthGoals = [
        { type: 'weight_loss', target: -10, timeframe: '3_months' },
        { type: 'muscle_gain', target: 5, timeframe: '6_months' }
      ]

      const alignedWorkout = await workoutAgent.alignWithHealthGoals(healthGoals)

      expect(alignedWorkout.workoutSplit).toBeDefined()
      expect(alignedWorkout.cardioIntegration).toBeDefined()
      expect(alignedWorkout.nutritionGuidance).toBeDefined()
    })
  })

  // === PERFORMANCE & GAMIFICATION ===
  describe('Performance & Gamification', () => {
    test('should calculate workout efficiency scores', async () => {
      const workoutSession = {
        id: 'session-1',
        date: new Date(),
        duration: 45,
        workoutType: 'strength',
        exercises: [
          {
            exerciseId: 'ex-1',
            name: 'Bench Press',
            sets: [
              { reps: 8, weight: 135, duration: 0, restTime: 90 }
            ]
          }
        ],
        caloriesBurned: 250,
        avgHeartRate: 135
      }

      const efficiency = await workoutAgent.calculateWorkoutEfficiency(workoutSession)

      expect(efficiency.efficiencyScore).toBeGreaterThanOrEqual(0)
      expect(efficiency.efficiencyScore).toBeLessThanOrEqual(100)
      expect(efficiency.timeUtilization).toBeDefined()
      expect(efficiency.intensityRating).toBeDefined()
    })

    test('should track and award fitness achievements', async () => {
      const userId = 'user-123'
      const recentWorkouts = []

      const achievements = await workoutAgent.checkAchievements(userId, recentWorkouts)

      expect(achievements.newAchievements).toBeDefined()
      expect(achievements.progressTowardGoals).toBeDefined()
      expect(achievements.milestoneReached).toBeDefined()
    })

    test('should provide workout challenges and competitions', async () => {
      const userId = 'user-123'
      const fitnessLevel = 'intermediate'

      const challenges = await workoutAgent.getAvailableChallenges(userId, fitnessLevel)

      expect(challenges.weeklyChallenge).toBeDefined()
      expect(challenges.monthlyChallenge).toBeDefined()
      expect(challenges.personalBests.length).toBeGreaterThan(0)
    })
  })
}) 