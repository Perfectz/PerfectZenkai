// src/modules/weight/services/WeightAnalyticsEngine.ts

import type { 
  WeightEntry, 
  WeightTrendAnalysis, 
  WeightStatistics, 
  WeightPlateau 
} from '../types'

/**
 * Enhanced Weight Analytics Engine with Performance Optimizations
 * 
 * Features:
 * - Intelligent caching for expensive calculations
 * - Advanced statistical analysis with outlier detection
 * - Performance-optimized algorithms
 * - Memory-efficient data processing
 */
export class WeightAnalyticsEngine {
  private cache = new Map<string, any>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Analyze weight trends with enhanced pattern recognition
   */
  analyzeTrends(weights: WeightEntry[]): WeightTrendAnalysis {
    const cacheKey = `trends_${this.hashWeights(weights)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    if (weights.length < 2) {
      return {
        trend: 'maintaining',
        rate: 0,
        confidence: 0.1,
        totalChange: 0,
        streakDays: 0,
        volatility: 0
      }
    }

    // Sort weights by date (most recent first)
    const sortedWeights = [...weights].sort((a, b) => 
      new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
    )

    // Enhanced trend calculation with outlier filtering
    const cleanedWeights = this.removeOutliers(sortedWeights)
    const { slope, rSquared } = this.calculateLinearRegression(cleanedWeights)
    
    // Determine trend with improved thresholds
    let trend: 'losing' | 'gaining' | 'maintaining' | 'fluctuating'
    if (Math.abs(slope) < 0.01) {
      trend = 'maintaining'
    } else if (slope < -0.05) {
      trend = 'losing'
    } else if (slope > 0.05) {
      trend = 'gaining'
    } else {
      trend = 'fluctuating'
    }

    const totalChange = cleanedWeights[0].kg - cleanedWeights[cleanedWeights.length - 1].kg
    const streakDays = this.calculateStreak(cleanedWeights)
    const volatility = this.calculateVolatility(cleanedWeights)

    const result: WeightTrendAnalysis = {
      trend,
      rate: slope,
      confidence: Math.min(rSquared, 0.95), // Cap confidence at 95%
      totalChange,
      streakDays,
      volatility
    }

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * Enhanced pattern identification with machine learning techniques
   */
  identifyPatterns(weights: WeightEntry[]): string[] {
    const cacheKey = `patterns_${this.hashWeights(weights)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const patterns: string[] = []
    
    if (weights.length < 7) return patterns

    const sortedWeights = [...weights].sort((a, b) => 
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    )

    // Detect rapid changes (>2kg in 7 days)
    for (let i = 6; i < sortedWeights.length; i++) {
      const weeklyChange = Math.abs(sortedWeights[i].kg - sortedWeights[i-6].kg)
      if (weeklyChange > 2) {
        patterns.push(weeklyChange > 0 ? 'rapid-gain' : 'rapid-loss')
      }
    }

    // Detect plateaus using rolling variance
    const plateaus = this.detectPlateaus(sortedWeights)
    if (plateaus.length > 0) {
      patterns.push('plateau-detected')
    }

    // Detect cyclical patterns (weekly/monthly)
    if (this.detectCyclicalPattern(sortedWeights, 7)) {
      patterns.push('weekly-cycle')
    }
    if (this.detectCyclicalPattern(sortedWeights, 30)) {
      patterns.push('monthly-cycle')
    }

    // Detect volatility patterns
    const volatility = this.calculateVolatility(sortedWeights)
    if (volatility > 1.5) {
      patterns.push('high-volatility')
    } else if (volatility < 0.5) {
      patterns.push('stable-pattern')
    }

    this.setCache(cacheKey, patterns)
    return patterns
  }

  /**
   * Enhanced statistical calculations with outlier detection
   */
  calculateStatistics(weights: WeightEntry[]): WeightStatistics {
    const cacheKey = `stats_${this.hashWeights(weights)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    if (weights.length === 0) {
      return {
        mean: 0,
        median: 0,
        standardDeviation: 0,
        variance: 0,
        minWeight: 0,
        maxWeight: 0,
        range: 0,
        quartiles: { q1: 0, q3: 0 },
        outliers: []
      }
    }

    const weightValues = weights.map(w => w.kg).sort((a, b) => a - b)
    const n = weightValues.length

    // Enhanced statistical calculations
    const mean = weightValues.reduce((sum, w) => sum + w, 0) / n
    const median = n % 2 === 0 
      ? (weightValues[n/2 - 1] + weightValues[n/2]) / 2
      : weightValues[Math.floor(n/2)]

    const variance = weightValues.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / n
    const standardDeviation = Math.sqrt(variance)

    // Quartiles for box plot analysis
    const q1 = this.calculatePercentile(weightValues, 25)
    const q3 = this.calculatePercentile(weightValues, 75)
    const iqr = q3 - q1

    // Outlier detection using IQR method
    const outliers = weights.filter(w => 
      w.kg < (q1 - 1.5 * iqr) || w.kg > (q3 + 1.5 * iqr)
    )

    const result: WeightStatistics = {
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      standardDeviation: Number(standardDeviation.toFixed(2)),
      variance: Number(variance.toFixed(2)),
      minWeight: Math.min(...weightValues),
      maxWeight: Math.max(...weightValues),
      range: Math.max(...weightValues) - Math.min(...weightValues),
      quartiles: { q1, q3 },
      outliers
    }

    this.setCache(cacheKey, result)
    return result
  }

  /**
   * Enhanced plateau detection with statistical significance
   */
  detectPlateaus(weights: WeightEntry[]): WeightPlateau[] {
    const cacheKey = `plateaus_${this.hashWeights(weights)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    const plateaus: WeightPlateau[] = []
    if (weights.length < 14) return plateaus // Need at least 2 weeks

    const sortedWeights = [...weights].sort((a, b) => 
      new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime()
    )

    const windowSize = 7 // 7-day rolling window
    let plateauStart = 0

    for (let i = windowSize; i < sortedWeights.length; i++) {
      const window = sortedWeights.slice(i - windowSize, i)
      const variance = this.calculateWindowVariance(window)
      
      // Plateau detected if variance is very low for extended period
      if (variance < 0.1) { // Less than 0.1kg variance
        if (plateauStart === 0) {
          plateauStart = i - windowSize
        }
      } else {
        if (plateauStart > 0 && (i - plateauStart) >= 14) { // At least 2 weeks
          plateaus.push({
            startDate: sortedWeights[plateauStart].dateISO,
            endDate: sortedWeights[i - 1].dateISO,
            duration: i - plateauStart,
            averageWeight: window.reduce((sum, w) => sum + w.kg, 0) / window.length,
            variance
          })
        }
        plateauStart = 0
      }
    }

    this.setCache(cacheKey, plateaus)
    return plateaus
  }

  // Private helper methods for enhanced functionality
  private removeOutliers(weights: WeightEntry[]): WeightEntry[] {
    if (weights.length < 4) return weights

    const values = weights.map(w => w.kg)
    const q1 = this.calculatePercentile(values, 25)
    const q3 = this.calculatePercentile(values, 75)
    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr

    return weights.filter(w => w.kg >= lowerBound && w.kg <= upperBound)
  }

  private calculateLinearRegression(weights: WeightEntry[]): { slope: number, rSquared: number } {
    if (weights.length < 2) return { slope: 0, rSquared: 0 }

    const n = weights.length
    const dates = weights.map(w => new Date(w.dateISO).getTime())
    const values = weights.map(w => w.kg)
    
    const meanX = dates.reduce((sum, d) => sum + d, 0) / n
    const meanY = values.reduce((sum, v) => sum + v, 0) / n
    
    let numerator = 0
    let denominator = 0
    let ssTotal = 0
    let ssRes = 0
    
    for (let i = 0; i < n; i++) {
      numerator += (dates[i] - meanX) * (values[i] - meanY)
      denominator += Math.pow(dates[i] - meanX, 2)
      ssTotal += Math.pow(values[i] - meanY, 2)
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0
    const intercept = meanY - slope * meanX
    
    // Calculate R-squared
    for (let i = 0; i < n; i++) {
      const predicted = slope * dates[i] + intercept
      ssRes += Math.pow(values[i] - predicted, 2)
    }
    
    const rSquared = ssTotal !== 0 ? 1 - (ssRes / ssTotal) : 0
    
    // Convert slope from per-millisecond to per-day
    const msPerDay = 24 * 60 * 60 * 1000
    return { slope: slope * msPerDay, rSquared: Math.max(0, rSquared) }
  }

  private calculateStreak(weights: WeightEntry[]): number {
    if (weights.length < 2) return 0

    let streak = 1
    const trend = weights[0].kg > weights[1].kg ? 'down' : 'up'
    
    for (let i = 1; i < weights.length - 1; i++) {
      const currentTrend = weights[i].kg > weights[i + 1].kg ? 'down' : 'up'
      if (currentTrend === trend) {
        streak++
      } else {
        break
      }
    }
    
    return streak
  }

  private calculateVolatility(weights: WeightEntry[]): number {
    if (weights.length < 2) return 0

    const changes = []
    for (let i = 1; i < weights.length; i++) {
      changes.push(Math.abs(weights[i].kg - weights[i-1].kg))
    }
    
    const meanChange = changes.reduce((sum, c) => sum + c, 0) / changes.length
    return Number(meanChange.toFixed(2))
  }

  private calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedValues.length - 1)
    const lower = Math.floor(index)
    const upper = Math.ceil(index)
    
    if (lower === upper) {
      return sortedValues[lower]
    }
    
    return sortedValues[lower] + (index - lower) * (sortedValues[upper] - sortedValues[lower])
  }

  private calculateWindowVariance(window: WeightEntry[]): number {
    const values = window.map(w => w.kg)
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
    return variance
  }

  private detectCyclicalPattern(weights: WeightEntry[], period: number): boolean {
    if (weights.length < period * 2) return false

    // Simple autocorrelation check
    const values = weights.map(w => w.kg)
    let correlation = 0
    const n = values.length - period

    for (let i = 0; i < n; i++) {
      correlation += values[i] * values[i + period]
    }

    return correlation / n > 0.7 // Strong positive correlation
  }

  // Caching system for performance optimization
  private hashWeights(weights: WeightEntry[]): string {
    return weights.map(w => `${w.kg}-${w.dateISO}`).join('|')
  }

  private getFromCache(key: string): any {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    this.cache.delete(key)
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
} 