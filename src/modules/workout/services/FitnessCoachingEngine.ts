import type {
  Exercise,
  ExerciseHistory,
  CoachingAdvice,
  InjuryModification,
  RealtimeCoaching,
  RecoveryRecommendation,
  IFitnessCoachingEngine
} from '../types/workout-fitness.types'

export class FitnessCoachingEngine implements IFitnessCoachingEngine {
  async provideCoaching(exercise: Exercise, history: ExerciseHistory): Promise<CoachingAdvice> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    return {
      formTips: exercise.formTips || [
        'Maintain proper posture throughout the movement',
        'Control the weight during both lifting and lowering phases',
        'Breathe consistently - exhale during effort, inhale during release'
      ],
      safetyReminders: exercise.safetyGuidelines || [
        'Warm up properly before exercise',
        'Use appropriate weight for your fitness level',
        'Stop if you feel pain or discomfort'
      ],
      commonMistakes: exercise.commonMistakes || [
        'Using too much weight too soon',
        'Rushing through the movement',
        'Poor range of motion'
      ],
      progressionSuggestions: this.generateProgressionSuggestions(exercise, history),
      modifications: this.generateModifications(exercise, history)
    }
  }

  async getInjuryModifications(exercise: Exercise, injuries: string[]): Promise<InjuryModification> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const modifications = this.getInjuryModificationsForExercise(exercise.name, injuries)
    
    return {
      alternatives: modifications.alternatives,
      modifications: modifications.modifications,
      precautions: modifications.precautions
    }
  }

  async provideRealtimeCoaching(exerciseInProgress: any): Promise<RealtimeCoaching> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    return {
      motivationalCues: [
        "You're doing great! Keep it up!",
        "Focus on your form",
        "One more rep - you've got this!"
      ],
      formReminders: [
        "Keep your core engaged",
        "Control the movement",
        "Maintain proper alignment"
      ],
      breathingCues: "Exhale during the effort phase, inhale during the release",
      paceGuidance: "Maintain a steady, controlled tempo"
    }
  }

  async getRecoveryRecommendations(userId: string, recentWorkouts: any[]): Promise<RecoveryRecommendation> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const workoutIntensity = recentWorkouts.length > 0 ? 70 : 50 // Mock calculation
    
    return {
      restDayActivities: [
        'Light walking',
        'Gentle stretching',
        'Meditation'
      ],
      stretchingRoutines: [
        'Full body stretch (15 minutes)',
        'Focus on worked muscle groups',
        'Hold each stretch for 20-30 seconds'
      ],
      sleepRecommendations: '8+ hours of quality sleep for optimal recovery',
      nutritionTips: 'Consume protein within 30 minutes post-workout for muscle repair'
    }
  }

  async provideFormGuidance(exercise: Exercise): Promise<FormGuidance> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    return {
      exerciseName: exercise.name,
      keyPoints: exercise.formTips || [
        'Maintain proper posture throughout the movement',
        'Control the weight during both lifting and lowering phases',
        'Breathe consistently - exhale during effort, inhale during release'
      ],
      commonMistakes: exercise.commonMistakes || [
        'Using too much weight too soon',
        'Rushing through the movement',
        'Poor range of motion'
      ],
      visualCues: this.generateVisualCues(exercise),
      breathingPattern: this.getBreathingPattern(exercise),
      setupInstructions: exercise.instructions?.slice(0, 2) || [
        'Set up equipment properly',
        'Position body in starting position'
      ],
      executionSteps: exercise.instructions || [
        'Begin movement slowly and controlled',
        'Complete full range of motion',
        'Return to starting position'
      ],
      safetyTips: exercise.safetyGuidelines || [
        'Warm up properly before exercise',
        'Use appropriate weight for your fitness level',
        'Stop if you feel pain or discomfort'
      ]
    }
  }

  async suggestModifications(exercise: Exercise, injuryType: string): Promise<InjuryModification> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const modifications = this.getInjuryModifications(exercise.name, injuryType)
    
    return {
      originalExercise: exercise.name,
      injuryType,
      modifications: modifications.modifications,
      alternativeExercises: modifications.alternatives,
      precautions: modifications.precautions,
      progressionPlan: this.createProgressionPlan(exercise, injuryType),
      clearanceNeeded: this.requiresClearance(injuryType)
    }
  }

  async generateRealTimeCoaching(exerciseName: string, currentSet: number, targetSets: number): Promise<CoachingAdvice> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const progressPercentage = (currentSet / targetSets) * 100
    
    let motivation: string
    let technique: string
    let nextSetAdvice: string
    
    if (currentSet === 1) {
      motivation = "Great start! Focus on your form for this first set."
      technique = "Establish your rhythm and breathing pattern."
      nextSetAdvice = "Maintain the same tempo for your next set."
    } else if (progressPercentage < 50) {
      motivation = "You're building momentum! Keep that form tight."
      technique = "Focus on the muscle you're targeting with each rep."
      nextSetAdvice = "You can push a little harder on the next set."
    } else if (progressPercentage < 80) {
      motivation = "Halfway there! Your strength is showing."
      technique = "Don't compromise form as fatigue sets in."
      nextSetAdvice = "Dig deep for these final sets - you've got this!"
    } else {
      motivation = "Final set! Show yourself what you're capable of!"
      technique = "Quality over quantity - make every rep count."
      nextSetAdvice = "Great job! Take your rest and prepare for the next exercise."
    }
    
    return {
      exerciseName,
      currentSet,
      totalSets: targetSets,
      motivation,
      techniqueReminder: technique,
      intensityAdjustment: this.getIntensityAdjustment(currentSet, targetSets),
      restRecommendation: this.getRestRecommendation(exerciseName, currentSet, targetSets),
      nextSetAdvice,
      encouragement: this.generateEncouragement(progressPercentage),
      formCheckpoints: this.getFormCheckpoints(exerciseName)
    }
  }

  async recommendRecovery(workoutIntensity: number, duration: number): Promise<RecoveryRecommendation> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Calculate recovery needs based on intensity and duration
    const recoveryScore = (workoutIntensity + duration / 10) / 2
    
    let recommendedRestDays: number
    let activeRecovery: string[]
    let nutritionTips: string[]
    let sleepRecommendations: string[]
    
    if (recoveryScore < 30) {
      recommendedRestDays = 1
      activeRecovery = ['Light walking', 'Gentle stretching']
      nutritionTips = ['Stay hydrated', 'Eat a balanced meal within 2 hours']
      sleepRecommendations = ['Aim for 7-8 hours of sleep']
    } else if (recoveryScore < 60) {
      recommendedRestDays = 1
      activeRecovery = ['Yoga or light stretching', 'Easy swim or bike ride', 'Foam rolling']
      nutritionTips = ['Protein within 30 minutes post-workout', 'Complex carbs for energy replenishment', 'Anti-inflammatory foods']
      sleepRecommendations = ['8+ hours of quality sleep', 'Avoid screens before bed']
    } else {
      recommendedRestDays = 2
      activeRecovery = ['Professional massage', 'Meditation and relaxation', 'Light mobility work only']
      nutritionTips = ['Extra protein for muscle repair', 'Omega-3 rich foods', 'Stay well hydrated']
      sleepRecommendations = ['8-9 hours of sleep for 2-3 nights', 'Consider short afternoon nap if tired']
    }
    
    return {
      workoutIntensity,
      recommendedRestDays,
      activeRecovery,
      nutritionTips,
      sleepRecommendations,
      hydrationNeeds: this.calculateHydrationNeeds(duration, workoutIntensity),
      stretchingRoutine: this.getStretchingRoutine(workoutIntensity),
      warningSignsToWatch: [
        'Persistent muscle soreness beyond 72 hours',
        'Decreased performance in subsequent workouts',
        'Unusual fatigue or mood changes',
        'Joint pain or stiffness'
      ],
      followUpActions: recoveryScore > 70 ? ['Consider reducing intensity next session', 'Schedule extra rest day'] : ['Continue normal training schedule']
    }
  }

  // Helper methods
  private generateVisualCues(exercise: Exercise): string[] {
    const cues: Record<string, string[]> = {
      'Barbell Bench Press': [
        'Imagine pushing the floor away with your feet',
        'Drive your back into the bench',
        'Touch your shirt, press the ceiling'
      ],
      'Barbell Squat': [
        'Sit back like sitting in a chair',
        'Drive your knees out over your toes',
        'Push the floor apart with your feet'
      ],
      'Barbell Deadlift': [
        'Imagine you\'re trying to leave footprints in the floor',
        'Pull the bar into your body',
        'Stand tall like a soldier at attention'
      ],
      'Push-up': [
        'Body like a plank of wood',
        'Push the ground away',
        'Lead with your chest, not your head'
      ]
    }
    
    return cues[exercise.name] || [
      'Focus on the working muscle',
      'Move with control and purpose',
      'Maintain tension throughout the movement'
    ]
  }
  
  private getBreathingPattern(exercise: Exercise): string {
    const patterns: Record<string, string> = {
      'Barbell Bench Press': 'Inhale at the top, exhale while pressing up',
      'Barbell Squat': 'Big breath at top, hold during descent, exhale driving up',
      'Barbell Deadlift': 'Inhale before lift, hold breath during lift, exhale at top',
      'Push-up': 'Inhale going down, exhale pushing up'
    }
    
    return patterns[exercise.name] || 'Exhale during the effort phase, inhale during the lowering phase'
  }
  
  private getInjuryModificationsForExercise(exerciseName: string, injuries: string[]): {
    alternatives: Exercise[]
    modifications: string[]
    precautions: string[]
  } {
    // Create mock Exercise objects for alternatives
    const createMockExercise = (name: string, category: string): Exercise => ({
      id: `mock-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      category: category as any,
      primaryMuscles: ['chest'],
      equipment: 'bodyweight',
      difficulty: 'beginner',
      instructions: [`Perform ${name}`]
    })
    
    const modifications: Record<string, any> = {
      'lower_back': {
        'Barbell Deadlift': {
          alternatives: [
            createMockExercise('Glute Bridge', 'lower_body'),
            createMockExercise('Romanian Deadlift (Light)', 'lower_body')
          ],
          modifications: ['Use trap bar instead of straight bar', 'Reduce range of motion', 'Decrease weight significantly'],
          precautions: ['Stop immediately if pain occurs', 'Focus on hip hinge movement', 'Avoid rounding the back']
        },
        'Barbell Squat': {
          alternatives: [
            createMockExercise('Leg Press', 'lower_body'),
            createMockExercise('Wall Sit', 'lower_body')
          ],
          modifications: ['Use box squats for limited range', 'Front squats instead of back squats', 'Goblet squats with light weight'],
          precautions: ['Don\'t squat below parallel', 'Keep core extra tight', 'Avoid forward lean']
        }
      },
      'knee_pain': {
        'Barbell Squat': {
          alternatives: [
            createMockExercise('Leg Press', 'lower_body'),
            createMockExercise('Chair-supported Squat', 'lower_body')
          ],
          modifications: ['Partial range of motion', 'Wider stance', 'Use heel elevation'],
          precautions: ['Stop if knee pain increases', 'Avoid deep knee flexion', 'Focus on glute activation']
        }
      },
      'shoulder': {
        'Barbell Bench Press': {
          alternatives: [
            createMockExercise('Push-up', 'upper_body'),
            createMockExercise('Chest Press Machine', 'upper_body')
          ],
          modifications: ['Reduce range of motion', 'Use dumbbells for better shoulder position', 'Incline instead of flat'],
          precautions: ['Don\'t lower bar to chest', 'Keep elbows closer to body', 'Stop if shoulder pain occurs']
        }
      }
    }
    
    // Find modifications for the first injury that matches
    for (const injury of injuries) {
      const injuryKey = injury.toLowerCase().replace(/\s+/g, '_')
      if (modifications[injuryKey] && modifications[injuryKey][exerciseName]) {
        return modifications[injuryKey][exerciseName]
      }
    }
    
    // Default modifications if no specific match found
    return {
      alternatives: [createMockExercise('Modified Version', 'full_body')],
      modifications: ['Reduce weight by 50%', 'Limit range of motion', 'Focus on pain-free movement'],
      precautions: ['Stop if pain increases', 'Consult healthcare provider', 'Prioritize healing over training']
    }
  }
  
  private createProgressionPlan(exercise: Exercise, injuryType: string): string[] {
    return [
      'Week 1-2: Pain-free range of motion with bodyweight or very light resistance',
      'Week 3-4: Gradually increase range of motion while maintaining comfort',
      'Week 5-6: Begin adding light resistance if no pain is present',
      'Week 7+: Slowly progress weight/intensity as tolerated',
      'Return to full exercise only when completely pain-free'
    ]
  }
  
  private requiresClearance(injuryType: string): boolean {
    const seriousInjuries = ['back', 'knee', 'shoulder', 'neck', 'spine']
    return seriousInjuries.some(injury => injuryType.toLowerCase().includes(injury))
  }
  
  private getIntensityAdjustment(currentSet: number, totalSets: number): string {
    const progress = currentSet / totalSets
    
    if (progress <= 0.5) {
      return 'Maintain current intensity'
    } else if (progress <= 0.8) {
      return 'Consider pushing slightly harder if form allows'
    } else {
      return 'Give everything you have left - this is your moment!'
    }
  }
  
  private getRestRecommendation(exerciseName: string, currentSet: number, totalSets: number): string {
    const strengthExercises = ['deadlift', 'squat', 'bench']
    const isStrengthExercise = strengthExercises.some(ex => exerciseName.toLowerCase().includes(ex))
    
    if (currentSet === totalSets) {
      return 'Great job! Take 2-3 minutes before your next exercise.'
    }
    
    if (isStrengthExercise) {
      return currentSet < totalSets - 1 ? '2-3 minutes rest' : '3-4 minutes for your final set'
    }
    
    return '60-90 seconds rest'
  }
  
  private generateEncouragement(progressPercentage: number): string {
    const encouragements = [
      "You're stronger than you think!",
      "Every rep is making you better!",
      "Your dedication is paying off!",
      "Trust the process - you've got this!",
      "Consistency beats perfection!",
      "Today's effort is tomorrow's strength!"
    ]
    
    return encouragements[Math.floor(Math.random() * encouragements.length)]
  }
  
  private getFormCheckpoints(exerciseName: string): string[] {
    const checkpoints: Record<string, string[]> = {
      'Barbell Bench Press': ['Shoulder blades pinched', 'Feet planted firmly', 'Controlled descent'],
      'Barbell Squat': ['Chest up', 'Knees tracking toes', 'Weight in heels'],
      'Barbell Deadlift': ['Neutral spine', 'Bar close to body', 'Hips driving forward'],
      'Push-up': ['Straight body line', 'Elbows at 45 degrees', 'Full range of motion']
    }
    
    return checkpoints[exerciseName] || ['Proper posture', 'Controlled movement', 'Full range of motion']
  }
  
  private calculateHydrationNeeds(duration: number, intensity: number): string {
    const baseFluid = 150 // ml per 15 minutes of exercise
    const fluidNeeds = Math.round((duration / 15) * baseFluid * (1 + intensity / 100))
    
    return `${fluidNeeds}ml of water during and immediately after workout`
  }
  
  private getStretchingRoutine(intensity: number): string[] {
    if (intensity < 30) {
      return [
        'Gentle full-body stretching (10-15 minutes)',
        'Focus on major muscle groups worked',
        'Hold each stretch for 20-30 seconds'
      ]
    } else if (intensity < 70) {
      return [
        'Comprehensive stretching routine (15-20 minutes)',
        'Include dynamic and static stretches',
        'Focus extra time on tight areas',
        'Consider yoga or Pilates session'
      ]
    } else {
      return [
        'Extended stretching and mobility work (20-30 minutes)',
        'Professional massage if available',
        'Foam rolling for muscle release',
        'Gentle yoga or restorative stretching',
        'Ice bath or contrast shower if available'
      ]
    }
  }
} 