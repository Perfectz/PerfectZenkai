// src/modules/workout/services/WorkoutPlanningEngine.ts

import type {
  FitnessProfile,
  WorkoutPlan,
  WorkoutSession,
  FitnessGoal,
  EquipmentType,
  WorkoutType,
  IWorkoutPlanningEngine,
  Exercise
} from '../types/workout-fitness.types'
import { ExerciseDatabase } from './ExerciseDatabase'

export class WorkoutPlanningEngine implements IWorkoutPlanningEngine {
  private exerciseDatabase: ExerciseDatabase

  constructor(exerciseDatabase: ExerciseDatabase) {
    this.exerciseDatabase = exerciseDatabase
  }

  async generatePersonalizedPlan(profile: FitnessProfile): Promise<WorkoutPlan> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const { fitnessLevel, goals, availableEquipment, timeAvailable, preferences } = profile
    
    // Determine workout type based on primary goal
    const workoutType: WorkoutType = goals.includes('strength') ? 'strength' :
                                   goals.includes('endurance') ? 'cardio' :
                                   goals.includes('flexibility') ? 'flexibility' : 'mixed'
    
    // Get exercises based on workout type and equipment
    let exercises: Exercise[] = []
    
    if (workoutType === 'strength') {
      // Get strength training exercises
      exercises = await this.exerciseDatabase.getExercisesByMuscleGroup('chest', availableEquipment)
      exercises.push(...await this.exerciseDatabase.getExercisesByMuscleGroup('quadriceps', availableEquipment))
      exercises.push(...await this.exerciseDatabase.getExercisesByMuscleGroup('hamstrings', availableEquipment))
    } else if (workoutType === 'cardio') {
      // Get cardio exercises
      const allExercises = await this.exerciseDatabase.getAllExercises()
      exercises = allExercises.filter(ex => ex.category === 'cardio')
    } else if (workoutType === 'flexibility') {
      // Get flexibility exercises
      const allExercises = await this.exerciseDatabase.getAllExercises()
      exercises = allExercises.filter(ex => ex.category === 'flexibility')
    } else {
      // Mixed workout - get variety
      exercises = await this.exerciseDatabase.getAllExercises()
    }
    
    // Filter by available equipment if specified
    if (availableEquipment && availableEquipment.length > 0) {
      exercises = exercises.filter(ex => availableEquipment.includes(ex.equipment))
    }
    
    // Select appropriate number of exercises based on time available
    const maxExercises = timeAvailable ? Math.floor(timeAvailable / 8) : 6 // ~8 minutes per exercise
    const selectedExercises = exercises.slice(0, Math.min(maxExercises, exercises.length))
    
    // Calculate intensity based on fitness level and goals
    const baseIntensity = fitnessLevel === 'beginner' ? 3 : fitnessLevel === 'intermediate' ? 5 : 7
    const goalMultiplier = goals.includes('strength') ? 1.2 : goals.includes('endurance') ? 1.1 : 1.0
    const intensity = Math.min(10, Math.round(baseIntensity * goalMultiplier))

    return {
      id: `plan-${Date.now()}`,
      name: `Personalized ${goals.join('/')} Plan`,
      workoutType,
      difficulty: fitnessLevel,
      duration: timeAvailable || 45,
      intensity,
      exercises: selectedExercises,
      modifications: profile.injuries.length > 0 ? [`Modified for ${profile.injuries.join(', ')}`] : undefined,
      notes: `Custom workout plan for ${fitnessLevel} level focusing on ${goals.join(', ')}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  async adaptForEquipment(plan: WorkoutPlan, availableEquipment: EquipmentType[]): Promise<WorkoutPlan> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const adaptedSessions = await Promise.all(
      plan.sessions.map(async session => {
        const adaptedExercises = await Promise.all(
          session.exercises.map(async exercise => {
            if (availableEquipment.includes(exercise.equipment)) {
              return exercise
            }
            
            // Find alternative exercise with available equipment
            const alternatives = await this.exerciseDatabase.getAlternativeExercises(
              exercise.name,
              availableEquipment
            )
            
            if (alternatives.length > 0) {
              const alternative = alternatives[0]
              return {
                ...exercise,
                name: alternative.name,
                equipment: alternative.equipment,
                instructions: alternative.instructions
              }
            }
            
            return exercise // Keep original if no alternative found
          })
        )
        
        return {
          ...session,
          exercises: adaptedExercises
        }
      })
    )

    return {
      ...plan,
      sessions: adaptedSessions,
      lastModified: new Date().toISOString()
    }
  }

  async modifyForInjuries(plan: WorkoutPlan, injuries: InjuryConstraints): Promise<WorkoutPlan> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const modifiedSessions = plan.sessions.map(session => {
      const safeExercises = session.exercises.filter(exercise => {
        // Check if exercise conflicts with injury constraints
        if (injuries.restrictions) {
          return !injuries.restrictions.some(restriction => 
            exercise.name.toLowerCase().includes(restriction.toLowerCase()) ||
            exercise.primaryMuscles.some(muscle => muscle.toLowerCase().includes(restriction.toLowerCase()))
          )
        }
        return true
      })
      
      return {
        ...session,
        exercises: safeExercises,
        notes: [
          ...(session.notes || []),
          `Modified for ${injuries.restrictions?.join(', ')} injury/constraints`
        ]
      }
    })

    return {
      ...plan,
      sessions: modifiedSessions,
      lastModified: new Date().toISOString()
    }
  }

  async generateProgressivePlan(startingWeights: Record<string, number>, weeks: number): Promise<WorkoutPlan> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const sessions: WorkoutSession[] = []
    const progressionRate = 1.025 // 2.5% increase per week
    
    for (let week = 1; week <= weeks; week++) {
      for (let day = 1; day <= 3; day++) {
        const dayType = day === 1 ? 'upper_body' : day === 2 ? 'lower_body' : 'full_body'
        
        const session = await this.generateSession(
          {
            fitnessLevel: 'intermediate',
            goals: ['strength'],
            availableEquipment: ['barbell', 'dumbbells'],
            timeAvailable: 60
          },
          `Week ${week} - ${dayType}`,
          60,
          dayType
        )
        
        // Apply progressive overload
        const progressiveExercises = session.exercises.map(exercise => {
          const baseWeight = startingWeights[exercise.name] || 20
          const weeklyWeight = Math.round(baseWeight * Math.pow(progressionRate, week - 1))
          
          return {
            ...exercise,
            weight: weeklyWeight,
            notes: [`Week ${week} progression: ${weeklyWeight}kg`]
          }
        })
        
        sessions.push({
          ...session,
          exercises: progressiveExercises
        })
      }
    }

    return {
      id: `progressive-plan-${Date.now()}`,
      name: `${weeks}-Week Progressive Strength Plan`,
      description: `Progressive overload plan with ${progressionRate * 100 - 100}% weekly increases`,
      duration: weeks,
      sessionsPerWeek: 3,
      targetGoals: ['strength'],
      sessions,
      progressionScheme: {
        weeklyIncrease: 2.5,
        assessmentPoints: Array.from({ length: Math.floor(weeks / 4) }, (_, i) => (i + 1) * 4)
      },
      fitnessLevel: 'intermediate',
      estimatedCaloriesBurn: 60 * 3 * 10, // 60min * 3 sessions * 10 cal/min
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
  }

  private async generateSession(
    profile: FitnessProfile,
    name: string,
    duration: number,
    focusArea: string
  ): Promise<WorkoutSession> {
    // Get exercises for focus area
    let exercises: Exercise[] = []
    
    if (focusArea === 'upper_body') {
      exercises = await this.exerciseDatabase.getExercisesByMuscleGroup('chest', profile.availableEquipment)
      exercises.push(...await this.exerciseDatabase.getExercisesByMuscleGroup('shoulders', profile.availableEquipment))
    } else if (focusArea === 'lower_body') {
      exercises = await this.exerciseDatabase.getExercisesByMuscleGroup('quadriceps', profile.availableEquipment)
      exercises.push(...await this.exerciseDatabase.getExercisesByMuscleGroup('hamstrings', profile.availableEquipment))
    } else if (focusArea === 'cardio') {
      exercises = await this.exerciseDatabase.getExercisesByMuscleGroup('heart', profile.availableEquipment)
    } else {
      exercises = await this.exerciseDatabase.getAllExercises()
    }
    
    // Select 4-6 exercises for the session
    const selectedExercises = exercises.slice(0, Math.min(6, exercises.length))
    
    // Create workout exercises with sets/reps based on fitness level
    const workoutExercises = selectedExercises.map(exercise => ({
      name: exercise.name,
      equipment: exercise.equipment,
      sets: profile.fitnessLevel === 'beginner' ? 2 : profile.fitnessLevel === 'intermediate' ? 3 : 4,
      reps: profile.goals.includes('strength') ? '6-8' : profile.goals.includes('endurance') ? '12-15' : '8-12',
      weight: this.getDefaultWeight(exercise.name, profile.fitnessLevel),
      restTime: profile.goals.includes('strength') ? 180 : 60,
      instructions: exercise.instructions,
      notes: [`Focus on proper form`, `Adjust weight as needed`]
    }))

    return {
      id: `session-${Date.now()}-${Math.random()}`,
      name,
      exercises: workoutExercises,
      estimatedDuration: duration,
      targetMuscleGroups: focusArea === 'full_body' ? ['chest', 'back', 'legs'] : [focusArea],
      difficulty: profile.fitnessLevel,
      caloriesBurnEstimate: duration * 8, // 8 calories per minute estimate
      warmUp: this.getWarmUpExercises(focusArea),
      coolDown: this.getCoolDownExercises(),
      notes: [`${focusArea} focused session`, `Estimated duration: ${duration} minutes`]
    }
  }

  private getDefaultWeight(exerciseName: string, fitnessLevel: string): number {
    const baseWeights: Record<string, number> = {
      'Barbell Bench Press': 40,
      'Barbell Squat': 50,
      'Barbell Deadlift': 60,
      'Dumbbell Bench Press': 15,
      'Push-up': 0
    }
    
    const base = baseWeights[exerciseName] || 20
    const multiplier = fitnessLevel === 'beginner' ? 0.7 : fitnessLevel === 'intermediate' ? 1.0 : 1.3
    
    return Math.round(base * multiplier)
  }

  private getWarmUpExercises(focusArea: string): string[] {
    const warmUps: Record<string, string[]> = {
      upper_body: ['Arm circles', 'Shoulder rolls', 'Light cardio'],
      lower_body: ['Leg swings', 'Hip circles', 'Bodyweight squats'],
      cardio: ['Walking', 'Dynamic stretching'],
      full_body: ['Jumping jacks', 'Arm circles', 'Leg swings']
    }
    
    return warmUps[focusArea] || warmUps.full_body
  }

  private getCoolDownExercises(): string[] {
    return [
      'Static stretching',
      'Deep breathing',
      'Foam rolling (if available)'
    ]
  }

  async generateWorkoutPlan(profile: FitnessProfile): Promise<WorkoutPlan> {
    return await this.generatePersonalizedPlan(profile)
  }

  async generateProgressiveWorkout(profile: FitnessProfile, basePlan: WorkoutPlan, week: number): Promise<WorkoutPlan> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Apply progressive overload to the base plan based on week number
    const progressionRate = 1.02 // 2% increase per week
    const weeklyMultiplier = Math.pow(progressionRate, week - 1)
    
    const progressiveExercises = basePlan.exercises.map(exercise => ({
      ...exercise,
      weight: exercise.weight ? Math.round(exercise.weight * weeklyMultiplier) : undefined,
      reps: exercise.reps ? Math.min(exercise.reps + Math.floor(week / 4), exercise.reps + 3) : undefined
    }))
    
    return {
      ...basePlan,
      id: `${basePlan.id}-week-${week}`,
      name: `${basePlan.name} - Week ${week}`,
      exercises: progressiveExercises,
      intensity: Math.min(basePlan.intensity * weeklyMultiplier, 10),
      updatedAt: new Date()
    }
  }

  async adaptForInjuries(plan: WorkoutPlan, injuries: string[]): Promise<WorkoutPlan> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const injuryConstraints: InjuryConstraints = {
      restrictions: injuries,
      severity: 'moderate',
      recoveryTime: 0
    }
    
    return await this.modifyForInjuries(plan, injuryConstraints)
  }
} 