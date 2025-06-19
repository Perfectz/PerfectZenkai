import type { WeightEntry, WeightGoal, ProgressPrediction } from '../types'

export class WeightPredictionModel {
  /**
   * Forecast weight trajectory using linear regression
   */
  forecastTrajectory(entries: WeightEntry[], daysAhead: number): ProgressPrediction[] {
    if (entries.length < 2) {
      return []
    }

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    )

    // Simple linear regression
    const { slope, intercept } = this.calculateLinearRegression(sortedEntries)
    const predictions: ProgressPrediction[] = []

    const lastEntry = sortedEntries[sortedEntries.length - 1]
    const baseDate = new Date(lastEntry.dateISO)

    for (let day = 1; day <= daysAhead; day++) {
      const predictDate = new Date(baseDate)
      predictDate.setDate(predictDate.getDate() + day)
      
      const daysSinceStart = this.daysBetween(
        new Date(sortedEntries[0].dateISO),
        predictDate
      )
      
      const predictedWeight = slope * daysSinceStart + intercept
      const standardError = this.calculateStandardError(sortedEntries, slope, intercept)
      
      predictions.push({
        predictedWeight,
        date: predictDate.toISOString().split('T')[0],
        confidence: Math.max(0.3, Math.min(0.95, 1 - (day / daysAhead) * 0.5)),
        upperBound: predictedWeight + (1.96 * standardError),
        lowerBound: predictedWeight - (1.96 * standardError),
        methodology: 'linear'
      })
    }

    return predictions
  }

  /**
   * Estimate timeline for achieving weight goal
   */
  estimateGoalTimeline(entries: WeightEntry[], goal: WeightGoal): {
    estimatedDays: number
    estimatedDate: string
    confidence: number
    feasible: boolean
  } {
    if (entries.length < 2) {
      return {
        estimatedDays: 90,
        estimatedDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        confidence: 0.3,
        feasible: false
      }
    }

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    )

    const currentWeight = sortedEntries[sortedEntries.length - 1].kg
    const weightToGo = Math.abs(goal.targetWeight - currentWeight)
    
    const { slope } = this.calculateLinearRegression(sortedEntries)
    const dailyRate = Math.abs(slope)

    let estimatedDays: number
    let feasible = true
    let confidence = 0.7

    if (dailyRate < 0.001) {
      // No meaningful trend
      estimatedDays = 365
      feasible = false
      confidence = 0.2
    } else {
      estimatedDays = Math.ceil(weightToGo / dailyRate)
      
      // Validate feasibility
      const weeklyRate = dailyRate * 7
      if (weeklyRate > 1) {
        // Too fast - unsafe
        feasible = false
        confidence = 0.3
      } else if (weeklyRate < 0.1) {
        // Too slow - might lose motivation
        confidence = 0.4
      }
    }

    // Cap at reasonable timeline
    estimatedDays = Math.min(estimatedDays, 365)

    const estimatedDate = new Date()
    estimatedDate.setDate(estimatedDate.getDate() + estimatedDays)

    return {
      estimatedDays,
      estimatedDate: estimatedDate.toISOString().split('T')[0],
      confidence: Math.max(0.2, Math.min(0.9, confidence)),
      feasible
    }
  }

  /**
   * Provide prediction with confidence intervals
   */
  predictWithConfidence(entries: WeightEntry[], daysAhead: number): {
    prediction: number
    confidenceInterval: {
      lower: number
      upper: number
      level: number // 0.95 for 95% confidence
    }
    reliability: 'high' | 'medium' | 'low'
  } {
    if (entries.length < 3) {
      return {
        prediction: entries[entries.length - 1]?.kg || 70,
        confidenceInterval: { lower: 65, upper: 75, level: 0.95 },
        reliability: 'low'
      }
    }

    const predictions = this.forecastTrajectory(entries, daysAhead)
    const finalPrediction = predictions[predictions.length - 1]

    if (!finalPrediction) {
      return {
        prediction: entries[entries.length - 1]?.kg || 70,
        confidenceInterval: { lower: 65, upper: 75, level: 0.95 },
        reliability: 'low'
      }
    }

    // Determine reliability based on data quality and prediction confidence
    let reliability: 'high' | 'medium' | 'low' = 'medium'
    if (entries.length >= 10 && finalPrediction.confidence >= 0.8) {
      reliability = 'high'
    } else if (entries.length < 5 || finalPrediction.confidence < 0.5) {
      reliability = 'low'
    }

    return {
      prediction: finalPrediction.predictedWeight,
      confidenceInterval: {
        lower: finalPrediction.lowerBound,
        upper: finalPrediction.upperBound,
        level: 0.95
      },
      reliability
    }
  }

  /**
   * Forecast with seasonal adjustment
   */
  forecastWithSeasonalAdjustment(entries: WeightEntry[], daysAhead: number): ProgressPrediction[] {
    const baseForecast = this.forecastTrajectory(entries, daysAhead)
    
    // Apply simple seasonal patterns (holidays, summer/winter effects)
    return baseForecast.map(prediction => {
      const predictionDate = new Date(prediction.date)
      const month = predictionDate.getMonth()
      
      let seasonalAdjustment = 0
      
      // Holiday season (November-January) - slight weight increase tendency
      if (month >= 10 || month <= 0) {
        seasonalAdjustment = 0.5
      }
      
      // Summer months (June-August) - slight weight decrease tendency
      if (month >= 5 && month <= 7) {
        seasonalAdjustment = -0.3
      }

      return {
        ...prediction,
        predictedWeight: prediction.predictedWeight + seasonalAdjustment,
        upperBound: prediction.upperBound + seasonalAdjustment,
        lowerBound: prediction.lowerBound + seasonalAdjustment,
        methodology: 'seasonal' as const
      }
    })
  }

  // === PRIVATE HELPER METHODS ===

  private calculateLinearRegression(entries: WeightEntry[]): { slope: number, intercept: number } {
    const n = entries.length
    if (n < 2) return { slope: 0, intercept: entries[0]?.kg || 70 }

    const baseDate = new Date(entries[0].dateISO)
    
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0

    entries.forEach(entry => {
      const x = this.daysBetween(baseDate, new Date(entry.dateISO))
      const y = entry.kg
      
      sumX += x
      sumY += y
      sumXY += x * y
      sumXX += x * x
    })

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    return { slope, intercept }
  }

  private calculateStandardError(entries: WeightEntry[], slope: number, intercept: number): number {
    if (entries.length < 3) return 1.0 // Default error

    const baseDate = new Date(entries[0].dateISO)
    const sumSquaredResiduals = entries.reduce((sum, entry) => {
      const x = this.daysBetween(baseDate, new Date(entry.dateISO))
      const predicted = slope * x + intercept
      const residual = entry.kg - predicted
      return sum + (residual * residual)
    }, 0)

    const variance = sumSquaredResiduals / (entries.length - 2)
    return Math.sqrt(variance)
  }

  private daysBetween(date1: Date, date2: Date): number {
    const timeDiff = date2.getTime() - date1.getTime()
    return timeDiff / (1000 * 60 * 60 * 24)
  }
} 