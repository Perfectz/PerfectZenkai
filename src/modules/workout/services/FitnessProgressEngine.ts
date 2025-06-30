// src/modules/workout/services/FitnessProgressEngine.ts

import type {
  WorkoutSession,
  ProgressData,
  StrengthAnalysis,
  EnduranceTracking,
  FitnessScore,
  PlateauDetection,
  IFitnessProgressEngine
} from '../types/workout-fitness.types'

export class FitnessProgressEngine implements IFitnessProgressEngine {
  
  async trackWorkoutSession(session: WorkoutSession, actualDuration: number, notes?: string): Promise<ProgressData> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Calculate basic progress metrics
    const totalVolume = session.exercises.reduce((sum, exercise) => {
      const weight = exercise.weight || 0
      const sets = exercise.sets || 1
      const reps = parseInt(exercise.reps?.split('-')[0] || '1')
      return sum + (weight * sets * reps)
    }, 0)
    
    const averageIntensity = this.calculateIntensity(session, actualDuration)
    const completionRate = actualDuration <= session.estimatedDuration ? 1.0 : 0.8
    
    return {
      sessionId: session.id,
      date: new Date().toISOString(),
      duration: actualDuration,
      estimatedDuration: session.estimatedDuration,
      completionRate,
      totalVolume,
      averageIntensity,
      caloriesBurned: session.caloriesBurnEstimate * (actualDuration / session.estimatedDuration),
      exercisesCompleted: session.exercises.length,
      personalRecords: this.detectPersonalRecords(session),
      improvements: this.calculateImprovements(session),
      notes: notes || '',
      muscleGroupsWorked: session.targetMuscleGroups || [],
      difficultyRating: session.difficulty || 'intermediate'
    }
  }

  async analyzeStrengthProgress(sessions: WorkoutSession[], timeframe: string): Promise<StrengthAnalysis> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    if (sessions.length === 0) {
      return {
        timeframe,
        strengthGains: {},
        volumeProgression: [],
        oneRepMaxEstimates: {},
        strengthScore: 0,
        recommendations: ['Complete more workouts to analyze strength progress']
      }
    }
    
    // Calculate strength gains for each exercise
    const strengthGains: Record<string, number> = {}
    const oneRepMaxEstimates: Record<string, number> = {}
    
    sessions.forEach(session => {
      session.exercises.forEach(exercise => {
        if (exercise.weight && exercise.weight > 0) {
          const currentWeight = exercise.weight
          const reps = parseInt(exercise.reps?.split('-')[0] || '1')
          
          // Simple 1RM estimation using Epley formula
          const oneRepMax = currentWeight * (1 + reps / 30)
          
          if (!oneRepMaxEstimates[exercise.name] || oneRepMax > oneRepMaxEstimates[exercise.name]) {
            oneRepMaxEstimates[exercise.name] = Math.round(oneRepMax)
          }
          
          // Track strength gains (simplified)
          if (!strengthGains[exercise.name]) {
            strengthGains[exercise.name] = 0
          }
          strengthGains[exercise.name] = Math.max(strengthGains[exercise.name], currentWeight)
        }
      })
    })
    
    // Calculate volume progression
    const volumeProgression = sessions.map((session, index) => ({
      week: Math.floor(index / 3) + 1,
      volume: session.exercises.reduce((sum, ex) => {
        const weight = ex.weight || 0
        const sets = ex.sets || 1
        const reps = parseInt(ex.reps?.split('-')[0] || '1')
        return sum + (weight * sets * reps)
      }, 0)
    }))
    
    // Calculate overall strength score
    const totalOneRepMax = Object.values(oneRepMaxEstimates).reduce((sum, max) => sum + max, 0)
    const strengthScore = Math.min(100, Math.round(totalOneRepMax / 100))
    
    return {
      timeframe,
      strengthGains,
      volumeProgression,
      oneRepMaxEstimates,
      strengthScore,
      recommendations: this.generateStrengthRecommendations(strengthGains, strengthScore)
    }
  }

  async trackEnduranceMetrics(sessions: WorkoutSession[], heartRateData?: number[]): Promise<EnduranceTracking> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    const cardioSessions = sessions.filter(session => 
      session.targetMuscleGroups?.includes('cardio') || 
      session.exercises.some(ex => ex.name.toLowerCase().includes('cardio') || ex.name.toLowerCase().includes('running'))
    )
    
    if (cardioSessions.length === 0) {
      return {
        avgHeartRate: 0,
        maxHeartRate: 0,
        cardioEndurance: 0,
        recoveryTime: 0,
        enduranceScore: 0,
        improvements: {
          duration: 0,
          intensity: 0,
          recovery: 0
        }
      }
    }
    
    // Calculate endurance metrics
    const avgDuration = cardioSessions.reduce((sum, s) => sum + s.estimatedDuration, 0) / cardioSessions.length
    const avgIntensity = cardioSessions.reduce((sum, s) => sum + this.calculateIntensity(s, s.estimatedDuration), 0) / cardioSessions.length
    
    // Mock heart rate data if not provided
    const avgHeartRate = heartRateData?.length ? 
      heartRateData.reduce((sum, hr) => sum + hr, 0) / heartRateData.length : 
      130 + Math.random() * 20 // Mock average heart rate
    
    const maxHeartRate = heartRateData?.length ?
      Math.max(...heartRateData) :
      180 + Math.random() * 20 // Mock max heart rate
    
    const enduranceScore = Math.min(100, Math.round((avgDuration * avgIntensity) / 10))
    
    return {
      avgHeartRate: Math.round(avgHeartRate),
      maxHeartRate: Math.round(maxHeartRate),
      cardioEndurance: Math.round(avgDuration),
      recoveryTime: Math.round(120 - (enduranceScore * 0.5)), // Better fitness = faster recovery
      enduranceScore,
      improvements: {
        duration: cardioSessions.length > 1 ? 10 : 0, // Mock 10% improvement
        intensity: cardioSessions.length > 1 ? 5 : 0,  // Mock 5% improvement
        recovery: cardioSessions.length > 1 ? 15 : 0   // Mock 15% improvement
      }
    }
  }

  async calculateFitnessScore(recentSessions: WorkoutSession[]): Promise<FitnessScore> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    if (recentSessions.length === 0) {
      return {
        overall: 0,
        strength: 0,
        endurance: 0,
        flexibility: 0,
        composition: 50, // Neutral starting point
        trend: 'stable',
        improvements: [],
        areas: []
      }
    }
    
    // Calculate component scores
    const strengthSessions = recentSessions.filter(s => 
      s.exercises.some(ex => ex.weight && ex.weight > 0)
    )
    const cardioSessions = recentSessions.filter(s => 
      s.targetMuscleGroups?.includes('cardio') || 
      s.exercises.some(ex => ex.name.toLowerCase().includes('cardio'))
    )
    const flexSessions = recentSessions.filter(s => 
      s.exercises.some(ex => ex.name.toLowerCase().includes('stretch') || ex.name.toLowerCase().includes('flexibility'))
    )
    
    const strength = Math.min(100, strengthSessions.length * 25)
    const endurance = Math.min(100, cardioSessions.length * 20)
    const flexibility = Math.min(100, flexSessions.length * 30)
    const composition = 50 + (recentSessions.length * 5) // Improves with consistent training
    
    const overall = Math.round((strength + endurance + flexibility + composition) / 4)
    
    // Determine trend based on recent activity
    const trend = recentSessions.length >= 3 ? 'improving' : 
                 recentSessions.length >= 1 ? 'stable' : 'declining'
    
    const improvements = []
    const areas = []
    
    if (strength > 70) improvements.push('Strong strength gains')
    if (endurance > 70) improvements.push('Excellent cardiovascular fitness')
    if (flexibility > 70) improvements.push('Great flexibility maintenance')
    
    if (strength < 50) areas.push('Focus on strength training')
    if (endurance < 50) areas.push('Add more cardio workouts')
    if (flexibility < 50) areas.push('Include stretching and mobility work')
    
    return {
      overall,
      strength,
      endurance,
      flexibility,
      composition,
      trend,
      improvements,
      areas
    }
  }

  async detectPlateaus(exerciseHistory: WorkoutSession[], exerciseName: string): Promise<PlateauDetection> {
    await new Promise(resolve => setTimeout(resolve, 10))
    
    // Find exercises matching the name
    const exerciseData = exerciseHistory
      .flatMap(session => session.exercises)
      .filter(ex => ex.name === exerciseName)
      .map(ex => ({
        date: new Date(),
        weight: ex.weight || 0,
        reps: parseInt(ex.reps?.split('-')[0] || '1')
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
    
    if (exerciseData.length < 5) {
      return {
        exerciseName,
        plateauDetected: false,
        plateauDuration: 0,
        lastImprovement: new Date().toISOString(),
        suggestions: ['Continue training for plateau detection'],
        confidenceLevel: 0
      }
    }
    
    // Simple plateau detection: no improvement in last 3 sessions
    const recent = exerciseData.slice(-3)
    const hasImproved = recent.some((session, index) => {
      if (index === 0) return false
      const prev = recent[index - 1]
      return session.weight > prev.weight || 
             (session.weight === prev.weight && session.reps > prev.reps)
    })
    
    const plateauDetected = !hasImproved && exerciseData.length >= 5
    
    return {
      exerciseName,
      plateauDetected,
      plateauDuration: plateauDetected ? 3 : 0, // 3 weeks
      lastImprovement: exerciseData[exerciseData.length - 4]?.date.toISOString() || new Date().toISOString(),
      suggestions: plateauDetected ? [
        'Try deload week with 80% weight',
        'Change rep ranges (5-6 reps if doing 8-10)',
        'Add variation exercises',
        'Focus on form improvements'
      ] : ['Continue current progression'],
      confidenceLevel: exerciseData.length >= 8 ? 0.8 : 0.5
    }
  }

  // Helper methods
  private calculateIntensity(session: WorkoutSession, duration: number): number {
    // Basic intensity calculation based on estimated calories and duration
    const caloriesPerMinute = session.caloriesBurnEstimate / session.estimatedDuration
    const actualCaloriesPerMinute = caloriesPerMinute * (session.estimatedDuration / duration)
    
    // Normalize to 0-100 scale
    return Math.min(100, Math.round(actualCaloriesPerMinute * 10))
  }
  
  private detectPersonalRecords(session: WorkoutSession): string[] {
    // Mock PR detection - in real app would compare against historical data
    const records = []
    
    session.exercises.forEach(exercise => {
      if (exercise.weight && exercise.weight > 0) {
        // Mock: 10% chance of PR
        if (Math.random() < 0.1) {
          records.push(`${exercise.name}: ${exercise.weight}kg`)
        }
      }
    })
    
    return records
  }
  
  private calculateImprovements(session: WorkoutSession): string[] {
    // Mock improvements - in real app would compare against previous sessions
    const improvements = []
    
    if (Math.random() < 0.3) {
      improvements.push('Completed workout faster than planned')
    }
    if (Math.random() < 0.2) {
      improvements.push('Better form and technique observed')
    }
    
    return improvements
  }
  
  private generateStrengthRecommendations(strengthGains: Record<string, number>, strengthScore: number): string[] {
    const recommendations = []
    
    if (strengthScore < 30) {
      recommendations.push('Focus on progressive overload with consistent weight increases')
      recommendations.push('Ensure adequate protein intake for muscle growth')
    } else if (strengthScore < 60) {
      recommendations.push('Consider periodization to break through plateaus')
      recommendations.push('Add variation exercises to target muscles differently')
    } else {
      recommendations.push('Excellent strength progress! Consider advanced techniques')
      recommendations.push('Focus on movement quality and injury prevention')
    }
    
    if (Object.keys(strengthGains).length < 3) {
      recommendations.push('Include more compound movements in your routine')
    }
    
    return recommendations
  }
} 