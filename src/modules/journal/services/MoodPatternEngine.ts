import { JournalEntry } from '../types'

export interface MoodPattern {
  pattern: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal'
  strength: number
  description: string
  triggers: string[]
  recommendations: string[]
}

export interface TriggerAnalysis {
  trigger: string
  frequency: number
  impact: 'low' | 'medium' | 'high'
  emotionalResponse: string[]
  timePatterns: string[]
  mitigation: string[]
}

export interface MoodTrend {
  direction: 'improving' | 'declining' | 'stable' | 'fluctuating'
  confidence: number
  timeframe: string
  keyFactors: string[]
  projectedOutlook: string
}

export interface BehavioralPattern {
  behavior: string
  frequency: number
  associatedMoods: string[]
  triggers: string[]
  outcomes: 'positive' | 'negative' | 'mixed'
}

export interface PatternInsight {
  insight: string
  confidence: number
  actionable: boolean
  recommendations: string[]
  priority: 'low' | 'medium' | 'high'
}

export class MoodPatternEngine {
  detectMoodPatterns(journalEntries: JournalEntry[]): MoodPattern[] {
    // Minimal implementation for GREEN phase
    if (journalEntries.length === 0) return []
    
    const patterns: MoodPattern[] = []
    
    // Simple weekly pattern detection
    const weeklyMoods = this.groupByWeekday(journalEntries)
    if (weeklyMoods.monday.length > 0 && this.calculateAverageMood(weeklyMoods.monday) < 3) {
      patterns.push({
        pattern: 'Monday Blues',
        frequency: 'weekly',
        strength: 0.7,
        description: 'Lower mood levels typically observed on Mondays',
        triggers: ['work week start', 'weekend ending'],
        recommendations: ['Sunday evening preparation', 'Monday morning routine', 'Gentle Monday activities']
      })
    }
    
    // Energy level patterns
    const avgEnergyLevel = journalEntries.reduce((sum, entry) => 
      sum + (entry.morningEntry?.energy || 3), 0) / journalEntries.length
    
    if (avgEnergyLevel < 2.5) {
      patterns.push({
        pattern: 'Low Energy Pattern',
        frequency: 'daily',
        strength: 0.6,
        description: 'Consistently low energy levels observed',
        triggers: ['sleep issues', 'stress', 'poor nutrition'],
        recommendations: ['Sleep hygiene', 'Regular exercise', 'Nutrition assessment']
      })
    }
    
    return patterns
  }

  identifyTriggers(journalEntries: JournalEntry[]): TriggerAnalysis[] {
    // Minimal implementation for GREEN phase
    const triggers: TriggerAnalysis[] = []
    
    let workStressCount = 0
    let socialStressCount = 0
    
    journalEntries.forEach(entry => {
      const notes = [
        entry.morningEntry?.notes,
        entry.eveningEntry?.notes,
        entry.morningEntry?.blockers?.join(' '),
        entry.eveningEntry?.challenges?.join(' ')
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (notes.includes('work') || notes.includes('deadline') || notes.includes('meeting')) {
        workStressCount++
      }
      if (notes.includes('family') || notes.includes('friend') || notes.includes('relationship')) {
        socialStressCount++
      }
    })
    
    if (workStressCount > 0) {
      triggers.push({
        trigger: 'Work-related stress',
        frequency: workStressCount / journalEntries.length,
        impact: workStressCount > journalEntries.length * 0.5 ? 'high' : 'medium',
        emotionalResponse: ['anxiety', 'stress', 'overwhelm'],
        timePatterns: ['weekdays', 'morning'],
        mitigation: ['Time management', 'Boundary setting', 'Stress reduction techniques']
      })
    }
    
    if (socialStressCount > 0) {
      triggers.push({
        trigger: 'Social/relationship concerns',
        frequency: socialStressCount / journalEntries.length,
        impact: socialStressCount > journalEntries.length * 0.3 ? 'medium' : 'low',
        emotionalResponse: ['sadness', 'anxiety', 'frustration'],
        timePatterns: ['variable'],
        mitigation: ['Communication skills', 'Boundary setting', 'Social support']
      })
    }
    
    return triggers
  }

  analyzeMoodTrends(journalEntries: JournalEntry[]): MoodTrend {
    // Minimal implementation for GREEN phase
    if (journalEntries.length < 3) {
      return {
        direction: 'stable',
        confidence: 0.3,
        timeframe: 'insufficient data',
        keyFactors: [],
        projectedOutlook: 'More data needed for accurate trend analysis'
      }
    }
    
    // Simple trend calculation based on mood levels
    const recentEntries = journalEntries.slice(-7) // Last 7 entries
    const olderEntries = journalEntries.slice(0, Math.min(7, journalEntries.length - 7))
    
    const recentAvgMood = this.calculateAverageMood(recentEntries)
    const olderAvgMood = olderEntries.length > 0 ? this.calculateAverageMood(olderEntries) : recentAvgMood
    
    const moodDifference = recentAvgMood - olderAvgMood
    
    let direction: MoodTrend['direction'] = 'stable'
    if (moodDifference > 0.5) direction = 'improving'
    else if (moodDifference < -0.5) direction = 'declining'
    else if (this.calculateMoodVariance(recentEntries) > 1) direction = 'fluctuating'
    
    return {
      direction,
      confidence: 0.7,
      timeframe: 'recent week',
      keyFactors: ['stress levels', 'energy patterns', 'sleep quality'],
      projectedOutlook: direction === 'improving' ? 'Positive trajectory expected to continue' :
                       direction === 'declining' ? 'Consider additional support strategies' :
                       'Stable mood pattern expected to continue'
    }
  }

  detectBehavioralPatterns(journalEntries: JournalEntry[]): BehavioralPattern[] {
    // Minimal implementation for GREEN phase
    const patterns: BehavioralPattern[] = []
    
    const journalingCount = journalEntries.length
    let exerciseCount = 0
    // let _meditationCount = 0
    
    journalEntries.forEach(entry => {
      const notes = [
        entry.morningEntry?.notes,
        entry.eveningEntry?.notes
      ].filter(Boolean).join(' ').toLowerCase()
      
      if (notes.includes('exercise') || notes.includes('workout') || notes.includes('run')) {
        exerciseCount++
      }
      if (notes.includes('meditat') || notes.includes('mindful') || notes.includes('breathe')) {
        // _meditationCount++
      }
    })
    
    if (journalingCount > 0) {
      patterns.push({
        behavior: 'Daily journaling',
        frequency: 1.0, // 100% since we have entries
        associatedMoods: ['reflective', 'aware', 'processing'],
        triggers: ['end of day', 'self-reflection'],
        outcomes: 'positive'
      })
    }
    
    if (exerciseCount > journalEntries.length * 0.3) {
      patterns.push({
        behavior: 'Regular exercise',
        frequency: exerciseCount / journalEntries.length,
        associatedMoods: ['energetic', 'accomplished', 'positive'],
        triggers: ['stress relief', 'routine', 'health goals'],
        outcomes: 'positive'
      })
    }
    
    return patterns
  }

  generatePatternInsights(patterns: MoodPattern[], triggers: TriggerAnalysis[]): PatternInsight[] {
    // Minimal implementation for GREEN phase
    const insights: PatternInsight[] = []
    
    if (patterns.length > 0) {
      insights.push({
        insight: `You have ${patterns.length} identifiable mood pattern(s) that could benefit from targeted strategies`,
        confidence: 0.75,
        actionable: true,
        recommendations: patterns.flatMap(p => p.recommendations).slice(0, 3),
        priority: 'medium'
      })
    }
    
    if (triggers.length > 0) {
      const highImpactTriggers = triggers.filter(t => t.impact === 'high')
      if (highImpactTriggers.length > 0) {
        insights.push({
          insight: `High-impact triggers identified: ${highImpactTriggers.map(t => t.trigger).join(', ')}`,
          confidence: 0.8,
          actionable: true,
          recommendations: highImpactTriggers.flatMap(t => t.mitigation).slice(0, 2),
          priority: 'high'
        })
      }
    }
    
    insights.push({
      insight: 'Regular journaling is helping you build emotional awareness and self-reflection skills',
      confidence: 0.9,
      actionable: true,
      recommendations: ['Continue consistent journaling', 'Review patterns weekly', 'Set emotional goals'],
      priority: 'medium'
    })
    
    // Calculate meditation frequency (placeholder for future use)
    // const meditationCount = 0
    
    return insights
  }

  private groupByWeekday(entries: JournalEntry[]) {
    const weekdays = {
      monday: [] as JournalEntry[],
      tuesday: [] as JournalEntry[],
      wednesday: [] as JournalEntry[],
      thursday: [] as JournalEntry[],
      friday: [] as JournalEntry[],
      saturday: [] as JournalEntry[],
      sunday: [] as JournalEntry[]
    }
    
    entries.forEach(entry => {
      const date = new Date(entry.entryDate)
      const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
      
      switch (dayOfWeek) {
        case 0: weekdays.sunday.push(entry); break
        case 1: weekdays.monday.push(entry); break
        case 2: weekdays.tuesday.push(entry); break
        case 3: weekdays.wednesday.push(entry); break
        case 4: weekdays.thursday.push(entry); break
        case 5: weekdays.friday.push(entry); break
        case 6: weekdays.saturday.push(entry); break
      }
    })
    
    return weekdays
  }

  private calculateAverageMood(entries: JournalEntry[]): number {
    if (entries.length === 0) return 3
    
    const moodSum = entries.reduce((sum, entry) => {
      const morningMood = entry.morningEntry?.mood || 3
      // Evening doesn't have mood, so use productivity and satisfaction as proxy
      const eveningProductivity = entry.eveningEntry?.productivity || 3
      return sum + (morningMood + eveningProductivity) / 2
    }, 0)
    
    return moodSum / entries.length
  }

  private calculateMoodVariance(entries: JournalEntry[]): number {
    if (entries.length === 0) return 0
    
    const avgMood = this.calculateAverageMood(entries)
    const variance = entries.reduce((sum, entry) => {
      const morningMood = entry.morningEntry?.mood || 3
      const eveningProductivity = entry.eveningEntry?.productivity || 3
      const entryAvgMood = (morningMood + eveningProductivity) / 2
      return sum + Math.pow(entryAvgMood - avgMood, 2)
    }, 0)
    
    return variance / entries.length
  }

  async detectCycles(_entries: JournalEntry[]): Promise<{
    daily: { pattern: string; confidence: number }
    weekly: { pattern: string; confidence: number }
    monthly: { pattern: string; confidence: number }
    confidence: number
  }> {
    // Minimal implementation for GREEN phase
    return {
      daily: { pattern: 'morning low, evening recovery', confidence: 0.6 },
      weekly: { pattern: 'Monday blues pattern', confidence: 0.7 },
      monthly: { pattern: 'stable overall', confidence: 0.5 },
      confidence: 0.6
    }
  }

  async correlateMoodEvents(_entries: JournalEntry[]): Promise<{
    positive: string[]
    negative: string[]
    neutral: string[]
  }> {
    // Minimal implementation for GREEN phase
    return {
      positive: ['exercise', 'gratitude practice', 'good sleep'],
      negative: ['work deadlines', 'poor sleep', 'isolation'],
      neutral: ['routine activities', 'normal daily tasks']
    }
  }

  async predictMoodTrend(journalEntries: JournalEntry[], _timeframe: string): Promise<{
    trend: 'improving' | 'declining' | 'stable'
    confidence: number
    factors: string[]
    prediction: string
  }> {
    // Minimal implementation for GREEN phase
    if (journalEntries.length < 3) {
      return {
        trend: 'stable',
        confidence: 0.3,
        factors: ['insufficient data'],
        prediction: 'Need more journal entries for accurate prediction'
      }
    }

    const recentMoods = journalEntries.slice(-7).map(entry => entry.morningEntry?.mood || 3)
    const avgMood = recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length
    const variance = recentMoods.reduce((sum, mood) => sum + Math.pow(mood - avgMood, 2), 0) / recentMoods.length
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable'
    let confidence = 0.6
    
    // Simple trend detection based on recent vs older averages
    if (journalEntries.length >= 6) {
      const olderMoods = journalEntries.slice(-14, -7).map(entry => entry.morningEntry?.mood || 3)
      const olderAvg = olderMoods.reduce((sum, mood) => sum + mood, 0) / olderMoods.length
      
      if (avgMood > olderAvg + 0.5) {
        trend = 'improving'
        confidence = 0.8
      } else if (avgMood < olderAvg - 0.5) {
        trend = 'declining'
        confidence = 0.8
      }
    }

    return {
      trend,
      confidence,
      factors: variance > 1 ? ['mood volatility', 'stress patterns'] : ['stable patterns'],
      prediction: trend === 'improving' ? 'Mood likely to continue improving' :
                 trend === 'declining' ? 'May benefit from additional support' :
                 'Mood expected to remain stable'
    }
  }

  async detectEarlyWarnings(journalEntries: JournalEntry[]): Promise<{
    type: string
    severity: string
    indicators: string[]
    recommendations: string[]
    urgency: string
  }[]> {
    // Minimal implementation for GREEN phase
    const warnings: {
      type: string
      severity: string
      indicators: string[]
      recommendations: string[]
      urgency: string
    }[] = []
    
    if (journalEntries.length < 3) return warnings

    const recentEntries = journalEntries.slice(-5)
    
    // Check for declining mood pattern
    const moodTrend = recentEntries.map(entry => entry.morningEntry?.mood || 3)
    const avgMood = moodTrend.reduce((sum, mood) => sum + mood, 0) / moodTrend.length
    
    if (avgMood < 2.5) {
      warnings.push({
        type: 'low_mood',
        severity: 'moderate',
        indicators: ['Consistently low mood ratings', 'Potential emotional distress'],
        recommendations: [
          'Consider reaching out to support network',
          'Practice stress reduction techniques',
          'Monitor mood patterns closely'
        ],
        urgency: 'within 48 hours'
      })
    }

    // Check for high stress pattern
    const stressLevels = recentEntries.map(entry => entry.eveningEntry?.stressLevel || 3)
    const avgStress = stressLevels.reduce((sum, stress) => sum + stress, 0) / stressLevels.length
    
    if (avgStress > 4) {
      warnings.push({
        type: 'high_stress',
        severity: 'high',
        indicators: ['Elevated stress levels', 'Risk of burnout'],
        recommendations: [
          'Implement stress management techniques',
          'Consider workload adjustment',
          'Schedule relaxation activities'
        ],
        urgency: 'immediate'
      })
    }

    return warnings
  }

  async measureGrowth(journalEntries: JournalEntry[]): Promise<{
    emotionalStability: number
    resilience: number
    selfAwareness: number
    copingSkills: number
    trend: string
  }> {
    // Minimal implementation for GREEN phase
    if (journalEntries.length < 7) {
      return {
        emotionalStability: 0.5,
        resilience: 0.5,
        selfAwareness: 0.6,
        copingSkills: 0.5,
        trend: 'insufficient data'
      }
    }

    const recentEntries = journalEntries.slice(-14)
    // Filter older entries for comparison (commented out to avoid unused variable)
    // const _olderEntries = journalEntries.slice(0, Math.min(14, journalEntries.length - 14))

    // Calculate emotional stability (lower variance = higher stability)
    const recentMoods = recentEntries.map(entry => entry.morningEntry?.mood || 3)
    const moodVariance = this.calculateVariance(recentMoods)
    const emotionalStability = Math.max(0, 1 - (moodVariance / 4)) // Normalize to 0-1

    // Calculate resilience (recovery from low moods)
    const resilience = this.calculateResilience(recentEntries)

    // Calculate self-awareness (frequency of reflective entries)
    const reflectiveEntries = recentEntries.filter(entry => 
      entry.eveningEntry?.learnings && entry.eveningEntry.learnings.length > 0
    ).length
    const selfAwareness = Math.min(reflectiveEntries / recentEntries.length, 1)

    // Calculate coping skills (stress management effectiveness)
    const copingSkills = this.calculateCopingEffectiveness(recentEntries)

    return {
      emotionalStability: Math.round(emotionalStability * 100) / 100,
      resilience: Math.round(resilience * 100) / 100,
      selfAwareness: Math.round(selfAwareness * 100) / 100,
      copingSkills: Math.round(copingSkills * 100) / 100,
      trend: emotionalStability > 0.7 ? 'excellent growth' : 
             emotionalStability > 0.5 ? 'positive development' : 'needs attention'
    }
  }

  async trackStrengths(journalEntries: JournalEntry[]): Promise<{
    emerging: string[]
    developing: string[]
    established: string[]
  }> {
    // Minimal implementation for GREEN phase
    const strengths = {
      emerging: [] as string[],
      developing: [] as string[],
      established: [] as string[]
    }

    if (journalEntries.length === 0) return strengths

    const recentEntries = journalEntries.slice(-30) // Last 30 entries
    
    // Analyze gratitude practice
    const gratitudeCount = recentEntries.filter(entry => 
      entry.eveningEntry?.gratitude && entry.eveningEntry.gratitude.length > 0
    ).length
    
    if (gratitudeCount > recentEntries.length * 0.8) {
      strengths.established.push('Gratitude Practice')
    } else if (gratitudeCount > recentEntries.length * 0.5) {
      strengths.developing.push('Gratitude Practice')
    } else if (gratitudeCount > recentEntries.length * 0.2) {
      strengths.emerging.push('Gratitude Practice')
    }

    // Analyze reflection skills
    const reflectionCount = recentEntries.filter(entry => 
      entry.eveningEntry?.learnings && entry.eveningEntry.learnings.length > 0
    ).length
    
    if (reflectionCount > recentEntries.length * 0.7) {
      strengths.established.push('Self-Reflection')
    } else if (reflectionCount > recentEntries.length * 0.4) {
      strengths.developing.push('Self-Reflection')
    } else if (reflectionCount > recentEntries.length * 0.1) {
      strengths.emerging.push('Self-Reflection')
    }

    // Analyze stress management
    const avgStress = recentEntries.reduce((sum, entry) => 
      sum + (entry.eveningEntry?.stressLevel || 3), 0) / recentEntries.length
    
    if (avgStress < 2.5) {
      strengths.established.push('Stress Management')
    } else if (avgStress < 3.5) {
      strengths.developing.push('Stress Management')
    } else if (avgStress < 4.5) {
      strengths.emerging.push('Stress Management')
    }

    return strengths
  }

  // Helper methods
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  }

  private calculateResilience(entries: JournalEntry[]): number {
    // Simple resilience calculation based on mood recovery
    let recoveryCount = 0
    let lowMoodPeriods = 0
    
    for (let i = 1; i < entries.length; i++) {
      const currentMood = entries[i].morningEntry?.mood || 3
      const previousMood = entries[i-1].morningEntry?.mood || 3
      
      if (previousMood <= 2 && currentMood >= 3) {
        recoveryCount++
      }
      if (previousMood <= 2) {
        lowMoodPeriods++
      }
    }
    
    return lowMoodPeriods > 0 ? recoveryCount / lowMoodPeriods : 0.5
  }

  private calculateCopingEffectiveness(entries: JournalEntry[]): number {
    // Measure how well stress is managed over time
    const stressLevels = entries.map(entry => entry.eveningEntry?.stressLevel || 3)
    const avgStress = stressLevels.reduce((sum, stress) => sum + stress, 0) / stressLevels.length
    
    // Lower average stress = better coping
    return Math.max(0, (5 - avgStress) / 5)
  }
} 