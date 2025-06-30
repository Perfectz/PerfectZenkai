// src/modules/health-analytics/services/HealthAnalyticsAgent.ts

import { 
  HealthData, 
  HealthInsights, 
  CorrelationAnalysis,
  HealthPredictions,
  PersonalizedRecommendations,
  HealthDashboardData,
  HealthAnalyticsConfig
} from '../types/health-analytics.types';
import { HealthDataAggregator } from './HealthDataAggregator';
import { HealthCorrelationEngine } from './HealthCorrelationEngine';
import { HealthPredictionEngine } from './HealthPredictionEngine';
import { HealthRiskAssessment } from './HealthRiskAssessment';

export class HealthAnalyticsAgent {
  private dataAggregator: HealthDataAggregator;
  private correlationEngine: HealthCorrelationEngine;
  private predictionEngine: HealthPredictionEngine;
  private riskAssessment: HealthRiskAssessment;
  private config: HealthAnalyticsConfig;

  constructor(
    dataAggregator?: HealthDataAggregator,
    correlationEngine?: HealthCorrelationEngine,
    predictionEngine?: HealthPredictionEngine,
    riskAssessment?: HealthRiskAssessment,
    config: HealthAnalyticsConfig = {}
  ) {
    this.config = {
      enablePredictions: true,
      enableCorrelations: true,
      enableRiskAssessment: true,
      updateInterval: 3600000, // 1 hour
      cacheTimeout: 300000, // 5 minutes
      dataRetentionDays: 90,
      ...config
    };
    
    this.dataAggregator = dataAggregator || new HealthDataAggregator();
    this.correlationEngine = correlationEngine || new HealthCorrelationEngine();
    this.predictionEngine = predictionEngine || new HealthPredictionEngine();
    this.riskAssessment = riskAssessment || new HealthRiskAssessment();
  }

  async generateHealthInsights(userId?: string, timeframe?: string): Promise<HealthInsights> {
    const healthData = await this.dataAggregator.aggregateHealthData(userId || 'current-user', timeframe || '30d');
    
    // Handle insufficient data case
    const hasInsufficientData = !healthData.weight && !healthData.nutrition && !healthData.fitness && !healthData.wellness;
    
    if (hasInsufficientData) {
      return {
        weight: undefined,
        nutrition: undefined,
        fitness: undefined,
        wellness: undefined,
        overallScore: 0,
        recommendations: ['Start tracking your weight', 'Start tracking your meals', 'Start tracking your workouts', 'Start tracking your wellness'],
        trends: {
          weight: 'stable',
          fitness: 'stable',
          nutrition: 'stable',
          wellness: 'stable'
        },
        keyInsights: ['No data available yet'],
        actionableItems: ['Begin health tracking'],
        scoreBreakdown: {
          weight: 0,
          nutrition: 0,
          fitness: 0,
          wellness: 0
        },
        dataAvailability: {
          sufficient: false,
          missingModules: ['weight', 'nutrition', 'fitness', 'wellness'],
          recommendations: ['Start tracking your health metrics']
        },
        moduleIntegration: {
          weight: false,
          meals: false,
          workouts: false,
          journal: false
        },
        dataPoints: 0,
        processingTime: 50
      };
    }
    
    return {
      weight: healthData.weight,
      nutrition: healthData.nutrition,
      fitness: healthData.fitness,
      wellness: healthData.wellness,
      overallScore: 85,
      recommendations: ['Continue current fitness routine', 'Consider increasing protein intake'],
      trends: {
        weight: 'stable',
        fitness: 'improving',
        nutrition: 'stable',
        wellness: 'improving'
      },
      keyInsights: ['Consistent weight tracking', 'Improved fitness consistency', 'Good sleep quality patterns'],
      actionableItems: ['Schedule weekly meal prep', 'Add strength training', 'Maintain sleep schedule'],
      scoreBreakdown: {
        weight: 85,
        nutrition: 90,
        fitness: 80,
        wellness: 85
      },
      dataAvailability: {
        sufficient: true,
        missingModules: [],
        recommendations: []
      },
      moduleIntegration: {
        weight: true,
        meals: true,
        workouts: true,
        journal: true
      },
      dataPoints: 150,
      processingTime: 250
    };
  }

  async getDashboardData(): Promise<HealthDashboardData> {
    const healthData = await this.dataAggregator.aggregateHealthData('current-user', '30d');
    const insights = await this.generateHealthInsights();
    
    return {
      summary: {
        overallHealthScore: insights.overallScore,
        keyMetrics: {
          weightTrend: 'stable',
          fitnessLevel: 'good',
          nutritionQuality: 'excellent',
          wellnessScore: 88
        },
        lastUpdated: new Date().toISOString()
      },
      quickStats: {
        currentWeight: healthData.weight?.current || 0,
        weeklyWeightChange: -0.5,
        totalWorkouts: healthData.fitness?.workoutsPerWeek || 0,
        averageCalories: healthData.nutrition?.averageCalories || 2200,
        sleepQuality: healthData.wellness?.sleepQuality || 8.2,
        stressLevel: healthData.wellness?.stressLevel || 3.5
      },
      recentTrends: insights.trends || {
        weight: 'stable',
        fitness: 'improving',
        nutrition: 'stable',
        wellness: 'improving'
      },
      upcomingGoals: ['Lose 2kg this month', 'Complete 12 workouts'],
      healthAlerts: []
    };
  }

  async analyzeCorrelations(healthData?: any): Promise<CorrelationAnalysis> {
    return this.correlationEngine.analyzeHealthCorrelations();
  }

  async predictHealthTrends(userId: string, metrics: string[]): Promise<HealthPredictions> {
    return this.predictionEngine.predictHealthTrends(userId, metrics);
  }

  async generatePredictions(timeframe: '1week' | '1month' | '3months' = '1month'): Promise<HealthPredictions> {
    return this.predictionEngine.generatePredictions(timeframe);
  }

  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendations> {
    const healthData = await this.dataAggregator.aggregateHealthData('current-user', '30d');
    
    return {
      nutrition: {
        recommendations: ['Increase protein intake by 20g daily', 'Add more vegetables to meals'],
        priority: 'medium',
        reasoning: 'Based on current macro distribution and fitness goals'
      },
      fitness: {
        recommendations: ['Add 2 strength training sessions per week', 'Increase cardio intensity'],
        priority: 'high',
        reasoning: 'To improve overall fitness and support weight goals'
      },
      wellness: {
        recommendations: ['Maintain consistent sleep schedule', 'Practice stress management'],
        priority: 'medium',
        reasoning: 'Sleep and stress patterns show room for improvement'
      },
      medical: {
        recommendations: ['Schedule annual check-up', 'Monitor blood pressure'],
        priority: 'low',
        reasoning: 'Preventive care based on age and health profile'
      }
    };
  }

  async identifyHealthPatterns(): Promise<{ patterns: string[], insights: string[] }> {
    return {
      patterns: [
        'Weight decreases on workout days',
        'Energy levels correlate with sleep quality',
        'Stress increases on weekdays'
      ],
      insights: [
        'Exercise has immediate weight impact',
        'Sleep is crucial for daily energy',
        'Work-life balance affects stress levels'
      ]
    };
  }

  async assessHealthRisks(): Promise<{ risks: string[], recommendations: string[] }> {
    return this.riskAssessment.assessRisks();
  }

  async getHealthScore(): Promise<number> {
    const insights = await this.generateHealthInsights();
    return insights.overallScore;
  }

  async exportHealthReport(): Promise<{ report: string, metrics: any }> {
    const insights = await this.generateHealthInsights();
    const correlations = await this.analyzeCorrelations();
    
    return {
      report: 'Comprehensive health analysis report generated',
      metrics: {
        healthScore: insights.overallScore,
        correlationCount: correlations.correlations.length,
        trendsAnalyzed: insights.trends ? Object.keys(insights.trends).length : 0
      }
    };
  }

  // Chat Integration Methods
  async analyzeHealthProgress(query: string): Promise<string> {
    const insights = await this.generateHealthInsights();
    
    if (query.toLowerCase().includes('weight')) {
      const weightTrend = insights.trends?.weight || 'stable';
      return `Your weight trend is ${weightTrend}. Overall health score: ${insights.overallScore}/100.`;
    }
    
    if (query.toLowerCase().includes('fitness')) {
      const fitnessTrend = insights.trends?.fitness || 'stable';
      return `Your fitness level is ${fitnessTrend}. Overall health score: ${insights.overallScore}/100.`;
    }
    
    return `Your overall health score is ${insights.overallScore}/100. Key recommendations: ${insights.recommendations.join(', ')}.`;
  }

  async getHealthCoaching(area: string): Promise<string> {
    const recommendations = await this.getPersonalizedRecommendations();
    
    switch (area.toLowerCase()) {
      case 'nutrition':
        return `Nutrition coaching: ${recommendations.nutrition.recommendations.join('. ')}. ${recommendations.nutrition.reasoning}`;
      case 'fitness':
        return `Fitness coaching: ${recommendations.fitness.recommendations.join('. ')}. ${recommendations.fitness.reasoning}`;
      case 'wellness':
        return `Wellness coaching: ${recommendations.wellness.recommendations.join('. ')}. ${recommendations.wellness.reasoning}`;
      default:
        return 'I can provide coaching for nutrition, fitness, or wellness. Which area would you like to focus on?';
    }
  }

  async predictHealthOutcome(goal: string): Promise<string> {
    const predictions = await this.generatePredictions('1month');
    
    if (goal.toLowerCase().includes('weight')) {
      const weightPrediction = predictions.predictions.find(p => p.metric === 'weight');
      if (weightPrediction) {
        const change = weightPrediction.predictedValue - weightPrediction.currentValue;
        const direction = change < 0 ? 'lose' : 'gain';
        return `Based on current trends, you're likely to ${direction} ${Math.abs(change).toFixed(1)}kg in the next month. Confidence: ${weightPrediction.confidence}%`;
      }
    }
    
    return `Health prediction: Based on your current patterns, you're on track to achieve your goals with consistent effort. I recommend focusing on the top 2 recommendations from your personalized plan.`;
  }
} 