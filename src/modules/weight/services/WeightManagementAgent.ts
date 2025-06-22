// src/modules/weight/services/WeightManagementAgent.ts

import type { 
  WeightEntry, 
  WeightGoal, 
  WeightTrendAnalysis, 
  GoalRecommendation,
  WeightCoaching,
  WeightInsight
} from '../types'
import { WeightAnalyticsEngine } from './WeightAnalyticsEngine'
import { WeightGoalIntelligence } from './WeightGoalIntelligence'
import { WeightPredictionModel } from './WeightPredictionModel'

// Add interfaces at the top after imports
interface FeedbackResponse {
  response: string
  actionItems: string[]
  data?: Record<string, unknown>
}

interface ChatQueryResponse {
  message: string
  data: Record<string, unknown>
  suggestedActions: string[]
}

interface DashboardInsights {
  summary: string
  keyMetrics: Record<string, unknown>
  recommendations: string[]
  alerts: string[]
}

interface WeightReport {
  status: string
  data: {
    summary: string
    insights: unknown[]
    recommendations: unknown[]
  }
}

export class WeightManagementAgent {
  private analytics: WeightAnalyticsEngine
  private goalIntelligence: WeightGoalIntelligence
  private predictionModel: WeightPredictionModel

  constructor() {
    this.analytics = new WeightAnalyticsEngine()
    this.goalIntelligence = new WeightGoalIntelligence()
    this.predictionModel = new WeightPredictionModel()
  }

  /**
   * Comprehensive weight trend analysis
   */
  async analyzeWeightTrends(userId: string, entries?: WeightEntry[]): Promise<WeightTrendAnalysis> {
    // In a real implementation, we'd fetch entries from the store using userId
    // For now, use provided entries or return default
    const weightEntries = entries || []
    
    return this.analytics.analyzeTrends(weightEntries)
  }

  /**
   * Generate personalized recommendations
   */
  async generateRecommendations(entries: WeightEntry[], currentGoal?: WeightGoal): Promise<{
    goals: GoalRecommendation[]
    coaching: WeightCoaching
    insights: WeightInsight[]
  }> {
    const goalRecommendations = this.goalIntelligence.recommendGoals(entries, currentGoal)
    const trendAnalysis = this.analytics.analyzeTrends(entries)
    
    // Generate coaching message
    const coaching = this.generateCoaching(trendAnalysis, entries, currentGoal)
    
    // Generate insights
    const insights = this.generateInsights(entries, trendAnalysis, goalRecommendations)

    return {
      goals: goalRecommendations,
      coaching,
      insights
    }
  }

  /**
   * Provide contextual feedback for user queries
   */
  async provideFeedback(query: string, entries: WeightEntry[], goal?: WeightGoal): Promise<FeedbackResponse> {
    const analysis = this.analytics.analyzeTrends(entries)
    const queryLower = query.toLowerCase()

    if (queryLower.includes('progress') || queryLower.includes('doing')) {
      return this.generateProgressFeedback(analysis, entries, goal)
    }

    if (queryLower.includes('goal') || queryLower.includes('target')) {
      return this.generateGoalFeedback(entries, goal)
    }

    if (queryLower.includes('predict') || queryLower.includes('forecast')) {
      return this.generatePredictionFeedback(entries, goal)
    }

    if (queryLower.includes('plateau') || queryLower.includes('stuck')) {
      return this.generatePlateauFeedback(entries, analysis)
    }

    // Default response
    return {
      response: "I can help you analyze your weight trends, set realistic goals, and predict your progress. What would you like to know?",
      actionItems: [
        "Ask about your progress",
        "Request goal recommendations", 
        "Get weight predictions",
        "Analyze plateaus or patterns"
      ]
    }
  }

  /**
   * Handle AI chat queries with structured responses
   */
  async handleChatQuery(query: string, entries: WeightEntry[], goal?: WeightGoal): Promise<ChatQueryResponse> {
    const feedback = await this.provideFeedback(query, entries, goal)
    
    return {
      message: feedback.response,
      data: feedback.data || {},
      suggestedActions: feedback.actionItems
    }
  }

  /**
   * Real-time weight coaching
   */
  async provideRealTimeCoaching(entries: WeightEntry[], goal?: WeightGoal): Promise<WeightCoaching> {
    const analysis = this.analytics.analyzeTrends(entries)
    
    return this.generateCoaching(analysis, entries, goal)
  }

  /**
   * Generate dashboard insights
   */
  async generateDashboardInsights(entries: WeightEntry[], goal?: WeightGoal): Promise<DashboardInsights> {
    const analysis = this.analytics.analyzeTrends(entries)
    // const stats = entries.length > 0 ? this.analytics.calculateStatistics(entries) : null
    
    let summary = "Keep tracking your weight consistently!"
    
    if (analysis.trend === 'losing' && goal?.goalType === 'lose') {
      summary = `Great progress! You're losing weight at ${Math.abs(analysis.rate * 7).toFixed(1)}kg/week.`
    } else if (analysis.trend === 'gaining' && goal?.goalType === 'gain') {
      summary = `Good work! You're gaining weight steadily at ${Math.abs(analysis.rate * 7).toFixed(1)}kg/week.`
    } else if (analysis.trend === 'maintaining') {
      summary = "You're maintaining your weight well - great consistency!"
    }

    const recommendations: string[] = []
    if (analysis.streakDays < 7) {
      recommendations.push("Try to track your weight daily for better insights")
    }
    if (analysis.pattern === 'volatile') {
      recommendations.push("Consider tracking at the same time each day for more consistent readings")
    }

    const alerts: string[] = []
    if (Math.abs(analysis.rate * 7) > 1) {
      alerts.push("Weight change rate exceeds healthy recommendations")
    }

    return {
      summary,
      keyMetrics: {
        currentWeight: entries[entries.length - 1]?.kg || 0,
        weeklyChange: analysis.weeklyChange,
        streakDays: analysis.streakDays,
        trend: analysis.trend,
        confidence: analysis.confidence
      },
      recommendations,
      alerts
    }
  }

  async generateReport(_userId: string): Promise<WeightReport> {
    // For now, return mock comprehensive report
    // Store stats for potential future use (commented out to avoid unused variable)
    // const _stats = await this.analytics.calculateStats()
    
    return {
      status: 'success',
      data: {
        summary: 'Comprehensive weight analysis complete',
        insights: [],
        recommendations: []
      }
    }
  }

  // === PRIVATE HELPER METHODS ===

  private generateCoaching(
    analysis: WeightTrendAnalysis, 
    entries: WeightEntry[], 
    goal?: WeightGoal
  ): WeightCoaching {
    let message = "Keep up the great work with tracking your weight!"
    let type: WeightCoaching['type'] = 'encouragement'
    let priority: WeightCoaching['priority'] = 'low'
    const actionItems: string[] = []

    if (analysis.streakDays >= 30) {
      message = "Amazing! You've tracked your weight for 30+ days straight. This consistency will pay off!"
      type = 'milestone'
    } else if (analysis.streakDays < 3) {
      message = "Try to track your weight more consistently for better insights and motivation."
      type = 'concern'
      priority = 'medium'
      actionItems.push("Set a daily reminder to weigh yourself")
    }

    if (goal && goal.goalType === 'lose' && analysis.trend === 'gaining') {
      message = "Your weight is trending upward while your goal is to lose. Let's reassess your approach."
      type = 'adjustment'
      priority = 'high'
      actionItems.push("Review your nutrition and exercise plan", "Consider adjusting your goal timeline")
    }

    if (analysis.pattern === 'plateau' && goal) {
      message = "It looks like you've hit a plateau. This is normal - let's work on breaking through it!"
      type = 'adjustment'
      priority = 'medium'
      actionItems.push("Try varying your routine", "Consider consulting a nutritionist")
    }

    return {
      message,
      type,
      priority,
      actionItems,
      nextCheckIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  }

  private generateInsights(
    entries: WeightEntry[], 
    analysis: WeightTrendAnalysis, 
    recommendations: GoalRecommendation[]
  ): WeightInsight[] {
    const insights: WeightInsight[] = []
    const now = new Date().toISOString()

    // Trend insight
    insights.push({
      id: `trend-${Date.now()}`,
      type: 'trend',
      title: `Weight ${analysis.trend} pattern detected`,
      description: `Your weight has been ${analysis.trend} at a rate of ${Math.abs(analysis.rate * 7).toFixed(1)}kg per week.`,
      importance: analysis.confidence > 0.7 ? 'high' : 'medium',
      generatedAt: now,
      data: analysis
    })

    // Goal insight
    if (recommendations.length > 0) {
      const topRecommendation = recommendations[0]
      insights.push({
        id: `goal-${Date.now()}`,
        type: 'goal',
        title: `${topRecommendation.type} goal recommended`,
        description: topRecommendation.reasoning,
        importance: topRecommendation.feasibility === 'high' ? 'high' : 'medium',
        generatedAt: now,
        data: topRecommendation
      })
    }

    // Prediction insight
    if (entries.length >= 3) {
      insights.push({
        id: `prediction-${Date.now()}`,
        type: 'prediction',
        title: 'Weight trajectory forecast',
        description: 'Based on your current trend, here\'s where you\'re heading.',
        importance: 'medium',
        generatedAt: now,
        data: { confidence: analysis.confidence, trend: analysis.trend }
      })
    }

    return insights
  }

  private generateProgressFeedback(
    analysis: WeightTrendAnalysis, 
    entries: WeightEntry[], 
    goal?: WeightGoal
  ): FeedbackResponse {
    const currentWeight = entries[entries.length - 1]?.kg || 0
    
    let response = `You're currently ${analysis.trend} weight at ${Math.abs(analysis.rate * 7).toFixed(1)}kg per week. `
    
    if (goal) {
      const remaining = Math.abs(goal.targetWeight - currentWeight)
      response += `You have ${remaining.toFixed(1)}kg to go to reach your ${goal.goalType} goal.`
      
      if (goal.goalType === 'lose' && analysis.trend === 'losing') {
        response += " Great job staying on track! 🎯"
      } else if (goal.goalType === 'lose' && analysis.trend === 'gaining') {
        response += " You might want to reassess your approach. 🤔"
      }
    }

    const actionItems = [
      "Continue tracking daily",
      "Review your goal alignment",
      "Check prediction timeline"
    ]

    return {
      response,
      actionItems,
      data: { analysis, currentWeight, goal }
    }
  }

  private generateGoalFeedback(
    entries: WeightEntry[], 
    goal?: WeightGoal
  ): FeedbackResponse {
    const recommendations = this.goalIntelligence.recommendGoals(entries, goal)
    const topRec = recommendations[0]
    
    const response = goal 
      ? `Your current goal to ${goal.goalType} to ${goal.targetWeight}kg looks ${topRec?.feasibility || 'reasonable'}. ${topRec?.reasoning || ''}`
      : `Based on your data, I recommend a ${topRec?.type} goal to ${topRec?.targetWeight.toFixed(1)}kg. ${topRec?.reasoning}`

    return {
      response,
      actionItems: [
        "Review goal recommendations",
        "Set milestone checkpoints", 
        "Adjust timeline if needed"
      ],
      data: { recommendations, currentGoal: goal }
    }
  }

  private generatePredictionFeedback(
    entries: WeightEntry[], 
    goal?: WeightGoal
  ): FeedbackResponse {
    const predictions = this.predictionModel.forecastTrajectory(entries, 30)
    const confidence = this.predictionModel.predictWithConfidence(entries, 30)
    
    let response = "Based on your current trend, "
    
    if (predictions.length > 0) {
      const futureWeight = predictions[predictions.length - 1].predictedWeight
      response += `in 30 days you'll likely weigh ${futureWeight.toFixed(1)}kg (${confidence.reliability} confidence).`
    } else {
      response += "I need more data points to make accurate predictions."
    }

    if (goal) {
      const timeline = this.predictionModel.estimateGoalTimeline(entries, goal)
      response += ` At your current rate, you'll reach your goal in approximately ${timeline.estimatedDays} days.`
    }

    return {
      response,
      actionItems: [
        "Track more consistently for better predictions",
        "Adjust goal timeline if needed",
        "Monitor trend changes"
      ],
      data: { predictions, confidence, goal }
    }
  }

  private generatePlateauFeedback(
    entries: WeightEntry[], 
    analysis: WeightTrendAnalysis
  ): FeedbackResponse {
    const plateaus = this.analytics.detectPlateaus(entries)
    
    let response = "Weight plateaus are completely normal! "
    
    if (plateaus.length > 0) {
      const recentPlateau = plateaus[plateaus.length - 1]
      response += `I detected a plateau lasting ${recentPlateau.duration} days. `
    }
    
    response += "They often happen as your body adjusts. Here's how to break through:"

    return {
      response,
      actionItems: [
        "Try changing your exercise routine",
        "Reassess your caloric intake",
        "Be patient - plateaus are temporary",
        "Consider consulting a nutritionist"
      ],
      data: { plateaus, analysis }
    }
  }
} 