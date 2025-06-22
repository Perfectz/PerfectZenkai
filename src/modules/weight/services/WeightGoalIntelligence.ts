import type { 
  WeightEntry, 
  WeightGoal, 
  GoalRecommendation, 
  WeightMilestone 
} from '../types'
import { WeightAnalyticsEngine } from './WeightAnalyticsEngine'

export class WeightGoalIntelligence {
  private analytics: WeightAnalyticsEngine

  constructor() {
    this.analytics = new WeightAnalyticsEngine()
  }

  /**
   * Recommend realistic weight goals based on historical data
   */
  recommendGoals(entries: WeightEntry[], _currentGoal?: WeightGoal): GoalRecommendation[] {
    if (entries.length === 0) {
      return this.getDefaultRecommendations()
    }

    const recommendations: GoalRecommendation[] = []
    const analysis = this.analytics.analyzeTrends(entries)
    const currentWeight = entries[entries.length - 1]?.kg || 0

    // Weight loss recommendation
    const lossTarget = currentWeight - (currentWeight * 0.1) // 10% loss
    const lossRecommendation = this.createRecommendation(
      'lose',
      lossTarget,
      currentWeight,
      analysis.rate,
      'Gradual weight loss at a sustainable pace'
    )
    recommendations.push(lossRecommendation)

    // Weight gain recommendation (if underweight)
    const gainTarget = currentWeight + (currentWeight * 0.05) // 5% gain
    const gainRecommendation = this.createRecommendation(
      'gain',
      gainTarget,
      currentWeight,
      Math.abs(analysis.rate),
      'Healthy weight gain for optimal health'
    )
    recommendations.push(gainRecommendation)

    // Maintenance recommendation
    const maintainRecommendation = this.createRecommendation(
      'maintain',
      currentWeight,
      currentWeight,
      0,
      'Maintain current weight within healthy range'
    )
    recommendations.push(maintainRecommendation)

    return recommendations.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Adjust goals based on actual progress
   */
  adjustGoalBasedOnProgress(goal: WeightGoal, entries: WeightEntry[]): WeightGoal {
    if (entries.length < 2) return goal

    const analysis = this.analytics.analyzeTrends(entries)
    // Store current weight for potential future use
    // const _currentWeight = entries[entries.length - 1]?.kg || goal.startingWeight || 0
    
    // Calculate progress rate
    const expectedRate = this.calculateExpectedRate(goal)
    const actualRate = Math.abs(analysis.rate)
    
    const adjustedGoal = { ...goal }

    // If progress is too slow, extend timeline or adjust target
    if (actualRate < expectedRate * 0.5) {
      // Extend timeline by 50%
      if (goal.targetDate) {
        const currentDate = new Date(goal.targetDate)
        currentDate.setDate(currentDate.getDate() + 45) // Add ~6 weeks
        adjustedGoal.targetDate = currentDate.toISOString().split('T')[0]
      }
    }

    // If progress is too fast, adjust target to be more conservative
    if (actualRate > expectedRate * 2) {
      const adjustment = goal.goalType === 'lose' ? 2 : -2 // 2kg adjustment
      adjustedGoal.targetWeight = goal.targetWeight + adjustment
    }

    adjustedGoal.updatedAt = new Date().toISOString()
    return adjustedGoal
  }

  /**
   * Validate goal feasibility and safety
   */
  validateGoalFeasibility(goal: WeightGoal, entries: WeightEntry[]): {
    feasible: boolean
    healthRisk: 'low' | 'medium' | 'high'
    recommendations: string[]
  } {
    const recommendations: string[] = []
    let healthRisk: 'low' | 'medium' | 'high' = 'low'
    let feasible = true

    const currentWeight = entries[entries.length - 1]?.kg || goal.startingWeight || 0
    const weightChange = Math.abs(currentWeight - goal.targetWeight)
    const expectedRate = this.calculateExpectedRate(goal)

    // Check for extreme weight loss/gain rates
    if (expectedRate > 1) { // More than 1kg per week
      healthRisk = 'high'
      feasible = false
      recommendations.push('Goal requires unsafe rate of weight change')
    } else if (expectedRate > 0.7) {
      healthRisk = 'medium'
      recommendations.push('Consider extending timeline for safer progress')
    }

    // Check for extreme weight targets
    const percentageChange = (weightChange / currentWeight) * 100
    if (percentageChange > 20) {
      healthRisk = 'high'
      recommendations.push('Target weight change exceeds recommended limits')
    }

    // Timeline validation
    if (goal.targetDate) {
      const timeToGoal = new Date(goal.targetDate).getTime() - new Date().getTime()
      const weeksToGoal = timeToGoal / (1000 * 60 * 60 * 24 * 7)
      
      if (weeksToGoal < 4) {
        feasible = false
        recommendations.push('Timeline too short for healthy progress')
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Goal appears realistic and achievable')
    }

    return { feasible, healthRisk, recommendations }
  }

  /**
   * Generate milestone planning for goals
   */
  generateMilestones(goal: WeightGoal): WeightMilestone[] {
    const milestones: WeightMilestone[] = []
    
    if (!goal.startingWeight || !goal.targetDate) {
      return milestones
    }

    const startWeight = goal.startingWeight
    const targetWeight = goal.targetWeight
    const totalChange = Math.abs(targetWeight - startWeight)
    
    const startDate = new Date()
    const endDate = new Date(goal.targetDate)
    const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    
    // Create milestones every 25% of progress
    for (let i = 1; i <= 4; i++) {
      const progress = i * 25
      const weightProgress = (totalChange * progress) / 100
      
      const milestoneWeight = goal.goalType === 'lose' 
        ? startWeight - weightProgress
        : startWeight + weightProgress
      
      const milestoneDate = new Date(startDate)
      milestoneDate.setDate(milestoneDate.getDate() + (totalDays * progress) / 100)
      
      milestones.push({
        weight: milestoneWeight,
        targetDate: milestoneDate.toISOString().split('T')[0],
        description: `${progress}% progress towards goal`,
        progress: 0, // Will be calculated based on actual progress
        achieved: false
      })
    }

    return milestones
  }



  // === PRIVATE HELPER METHODS ===

  private createRecommendation(
    type: 'lose' | 'gain' | 'maintain',
    targetWeight: number,
    currentWeight: number,
    currentRate: number,
    reasoning: string
  ): GoalRecommendation {
    const weightChange = Math.abs(targetWeight - currentWeight)
    const safeRate = type === 'maintain' ? 0 : 0.5 // 0.5kg per week max
    const weeksNeeded = weightChange / safeRate || 8
    
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + weeksNeeded * 7)

    // Calculate feasibility based on current trends
    let feasibility: 'high' | 'medium' | 'low' = 'medium'
    if (type === 'maintain') {
      feasibility = 'high'
    } else {
      const rateAlignment = Math.abs(currentRate - safeRate)
      if (rateAlignment < 0.2) feasibility = 'high'
      else if (rateAlignment > 0.5) feasibility = 'low'
    }

    // Calculate health risk
    let healthRisk: 'low' | 'medium' | 'high' = 'low'
    if (safeRate > 0.7) healthRisk = 'medium'
    if (safeRate > 1.0) healthRisk = 'high'

    // Calculate confidence based on data quality and alignment
    const confidence = Math.max(0.6, Math.min(1.0, 
      (feasibility === 'high' ? 0.9 : feasibility === 'medium' ? 0.7 : 0.5) +
      (healthRisk === 'low' ? 0.1 : healthRisk === 'medium' ? 0 : -0.2)
    ))

    return {
      type,
      targetWeight,
      targetDate: targetDate.toISOString().split('T')[0],
      feasibility,
      ratePerWeek: safeRate,
      reasoning,
      healthRisk,
      confidence
    }
  }

  private calculateExpectedRate(goal: WeightGoal): number {
    if (!goal.startingWeight || !goal.targetDate) return 0.5 // Default safe rate

    const weightChange = Math.abs(goal.targetWeight - goal.startingWeight)
    const timeToGoal = new Date(goal.targetDate).getTime() - new Date().getTime()
    const weeksToGoal = timeToGoal / (1000 * 60 * 60 * 24 * 7)
    
    return weeksToGoal > 0 ? weightChange / weeksToGoal : 0
  }

  private getDefaultRecommendations(): GoalRecommendation[] {
    return [
      {
        type: 'maintain',
        targetWeight: 70, // Default target
        targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        feasibility: 'high',
        ratePerWeek: 0,
        reasoning: 'Start by tracking your current weight consistently',
        healthRisk: 'low',
        confidence: 0.8
      }
    ]
  }
} 