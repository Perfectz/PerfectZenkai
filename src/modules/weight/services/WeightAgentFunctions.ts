import { WeightManagementAgent } from './WeightManagementAgent'
import { useWeightStore } from '../store'
import { WeightEntry } from '../types'

// Global instance of the weight management agent
const weightAgent = new WeightManagementAgent()

/**
 * Weight Agent Function Registry for AI Chat Integration
 */
export const WEIGHT_AGENT_FUNCTIONS = {
  analyzeWeightProgress: {
    name: 'analyzeWeightProgress',
    description: 'Analyze user\'s weight trends and provide comprehensive insights',
    parameters: {
      type: 'object',
      properties: {
        timeframe: { 
          type: 'string', 
          enum: ['week', 'month', 'quarter', 'year', 'all'],
          description: 'Time period to analyze'
        },
        includeGoals: { 
          type: 'boolean',
          description: 'Whether to include goal progress analysis'
        }
      },
      required: ['timeframe']
    }
  },

  recommendWeightGoal: {
    name: 'recommendWeightGoal',
    description: 'Generate intelligent weight goal recommendations based on user data',
    parameters: {
      type: 'object',
      properties: {
        targetType: { 
          type: 'string', 
          enum: ['loss', 'gain', 'maintain'],
          description: 'Type of weight goal desired'
        },
        timeframe: { 
          type: 'string',
          description: 'Desired timeline for achieving the goal'
        }
      },
      required: ['targetType']
    }
  },

  predictWeightProgress: {
    name: 'predictWeightProgress',
    description: 'Forecast weight trajectory and goal achievement timeline',
    parameters: {
      type: 'object',
      properties: {
        daysAhead: { 
          type: 'number',
          description: 'Number of days to predict into the future',
          minimum: 1,
          maximum: 365
        },
        includeConfidence: { 
          type: 'boolean',
          description: 'Whether to include confidence intervals'
        }
      },
      required: ['daysAhead']
    }
  },

  getWeightCoaching: {
    name: 'getWeightCoaching',
    description: 'Provide personalized weight management coaching and actionable advice',
    parameters: {
      type: 'object',
      properties: {
        focusArea: {
          type: 'string',
          enum: ['motivation', 'plateau', 'goal-setting', 'tracking', 'general'],
          description: 'Specific area to focus coaching on'
        }
      }
    }
  }
}

/**
 * Implementation functions for AI chat integration
 */
export const weightAgentImplementations = {
  /**
   * Analyze weight progress with intelligent insights
   */
  async analyzeWeightProgress(args: { 
    timeframe: 'week' | 'month' | 'quarter' | 'year' | 'all'
    includeGoals?: boolean 
  }) {
    try {
      // Get weight data from store
      const { weights, activeGoal } = useWeightStore.getState()
      
      // Filter data based on timeframe
      const filteredWeights = filterWeightsByTimeframe(weights, args.timeframe)
      
      // Analyze trends
      const analysis = await weightAgent.analyzeWeightTrends('current-user', filteredWeights)
      
      // Generate insights
      const insights = await weightAgent.generateDashboardInsights(
        filteredWeights, 
        args.includeGoals ? (activeGoal || undefined) : undefined
      )

      return {
        success: true,
        analysis,
        insights,
        summary: insights.summary,
        recommendations: insights.recommendations,
        alerts: insights.alerts
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to analyze weight progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  /**
   * Generate intelligent goal recommendations
   */
  async recommendWeightGoal(args: { 
    targetType: 'loss' | 'gain' | 'maintain'
    timeframe?: string 
  }) {
    try {
      const { weights, activeGoal } = useWeightStore.getState()
      
      const recommendations = await weightAgent.generateRecommendations(weights, activeGoal || undefined)
      
      // Filter recommendations by target type
      const filteredRecommendations = recommendations.goals.filter(
        goal => goal.type === args.targetType
      )

      return {
        success: true,
        recommendations: filteredRecommendations,
        coaching: recommendations.coaching,
        topRecommendation: filteredRecommendations[0],
        reasoning: filteredRecommendations[0]?.reasoning || 'No specific recommendations available'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to generate goal recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  /**
   * Predict weight progress and trajectory
   */
  async predictWeightProgress(_args: { 
    daysAhead: number
    includeConfidence?: boolean 
  }) {
    try {
      const { weights, activeGoal } = useWeightStore.getState()
      
      const predictions = await weightAgent.provideFeedback(
        'predict my weight progress', 
        weights, 
        activeGoal || undefined
      )

      return {
        success: true,
        predictions: predictions.data?.predictions || [],
        confidence: predictions.data?.confidence,
        goalTimeline: predictions.data?.goal ? 
          `You'll reach your goal in approximately ${predictions.data.goal.estimatedDays} days` : 
          'No active goal set',
        summary: predictions.response
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to predict weight progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  /**
   * Provide personalized weight management coaching
   */
  async getWeightCoaching(_args?: { 
    focusArea?: 'motivation' | 'plateau' | 'goal-setting' | 'tracking' | 'general' 
  }) {
    try {
      const { weights, activeGoal } = useWeightStore.getState()
      
      const coaching = await weightAgent.provideRealTimeCoaching(weights, activeGoal || undefined)
      
      return {
        success: true,
        coaching,
        message: coaching.message,
        actionItems: coaching.actionItems,
        priority: coaching.priority,
        nextCheckIn: coaching.nextCheckIn
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to provide coaching',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * Get all weight agent functions for registration
 */
export function getWeightAgentFunctions() {
  return WEIGHT_AGENT_FUNCTIONS
}

/**
 * Get weight agent implementations for execution
 */
export function getWeightAgentImplementations() {
  return weightAgentImplementations
}

// === HELPER FUNCTIONS ===

function filterWeightsByTimeframe(
  weights: WeightEntry[],
  timeframe: 'week' | 'month' | 'quarter' | 'year' | 'all'
): WeightEntry[] {
  if (timeframe === 'all') return weights

  const now = new Date()
  const cutoffDate = new Date()

  switch (timeframe) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7)
      break
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1)
      break
    case 'quarter':
      cutoffDate.setMonth(now.getMonth() - 3)
      break
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1)
      break
  }

  return weights.filter(weight => 
    new Date(weight.dateISO) >= cutoffDate
  )
} 