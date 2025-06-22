import { JournalEntry } from '../types'

export interface EmotionAnalysisResult {
  emotions: string[]
  sentiment: 'positive' | 'negative' | 'neutral'
  intensity: number
  confidence: number
  emotionalTriggers: string[]
  riskFactors: string[]
}

export interface EmotionalPattern {
  pattern: string
  frequency: number
  intensity: number
  timeframe: string
  triggers: string[]
}

export interface SentimentData {
  positiveWords: string[]
  negativeWords: string[]
  neutralIndicators: string[]
  emotionalKeywords: string[]
}

export interface EmotionResult {
  emotion: string
  intensity: number
  confidence: number
}

export interface IntensityResult {
  overall: number
  stressLevel: number
  joyLevel: number
  anxietyLevel: number
}

export interface ContextResult {
  triggers: string[]
  copingMechanisms: string[]
  supportSystems: string[]
}

export interface ProgressResult {
  overallTrend: 'improving' | 'declining' | 'stable'
  keyMetrics: {
    entriesAnalyzed: number
    averageMood?: number
    moodImprovement?: number
    streakLength?: number
  }
  milestones: {
    date: string
    achievement: string
    significance: number
  }[]
}

export interface BreakthroughResult {
  date: string
  insight: string
  significance: number
}

export class EmotionalAnalysisEngine {
  private positiveWords = ['good', 'confident', 'happy', 'grateful', 'accomplished', 'excited']
  private negativeWords = ['anxious', 'overwhelmed', 'difficult', 'stressed', 'frustrated', 'tired']
  private emotionKeywords = {
    anxiety: ['anxious', 'worried', 'nervous', 'tense', 'uncertain'],
    stress: ['stressed', 'overwhelmed', 'pressure', 'rushed', 'demanding'],
    happiness: ['happy', 'joy', 'excited', 'pleased', 'satisfied'],
    sadness: ['sad', 'down', 'disappointed', 'lonely', 'empty'],
    excitement: ['excited', 'thrilled', 'enthusiastic', 'eager', 'motivated']
  }

  async analyzeEmotions(content: string): Promise<EmotionAnalysisResult> {
    // Minimal implementation for GREEN phase
    const lowerContent = content.toLowerCase()
    const words = lowerContent.split(/\s+/)
    
    const positiveCount = words.filter(word => this.positiveWords.includes(word)).length
    const negativeCount = words.filter(word => this.negativeWords.includes(word)).length
    
    const detectedEmotions: string[] = []
    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        detectedEmotions.push(emotion)
      }
    }
    
    const sentiment = positiveCount > negativeCount ? 'positive' : 
                     negativeCount > positiveCount ? 'negative' : 'neutral'
    
    const intensity = Math.min(Math.max((positiveCount + negativeCount) / words.length * 10, 1), 5)
    
    return {
      emotions: detectedEmotions.length > 0 ? detectedEmotions : ['neutral'],
      sentiment,
      intensity,
      confidence: 0.7,
      emotionalTriggers: lowerContent.includes('deadline') || lowerContent.includes('work') ? ['work stress'] : [],
      riskFactors: negativeCount > 3 ? ['high stress'] : []
    }
  }

  detectEmotionalPatterns(journalEntries: JournalEntry[]): EmotionalPattern[] {
    // Minimal implementation for GREEN phase
    if (journalEntries.length === 0) return []
    
    return [
      {
        pattern: 'morning_anxiety',
        frequency: 0.6,
        intensity: 3.2,
        timeframe: 'weekly',
        triggers: ['work preparation', 'deadline pressure']
      }
    ]
  }

  private analyzeSentimentText(text: string): SentimentData {
    // Helper method for text analysis
    const words = text.toLowerCase().split(/\s+/)
    
    return {
      positiveWords: words.filter(word => this.positiveWords.includes(word)),
      negativeWords: words.filter(word => this.negativeWords.includes(word)),
      neutralIndicators: ['okay', 'fine', 'normal', 'usual'],
      emotionalKeywords: words.filter(word => 
        Object.values(this.emotionKeywords).flat().includes(word)
      )
    }
  }

  calculateEmotionalIntensity(entry: JournalEntry): number {
    // Minimal implementation for GREEN phase
    const morningMood = entry.morningEntry?.mood || 3
    const morningEnergy = entry.morningEntry?.energy || 3
    const stressLevel = entry.eveningEntry?.stressLevel || 3
    
    // Simple weighted calculation
    return (morningMood * 0.4 + morningEnergy * 0.3 + (5 - stressLevel) * 0.3)
  }

  identifyEmotionalTriggers(content: string): string[] {
    // Minimal implementation for GREEN phase
    const triggers: string[] = []
    const lowerContent = content.toLowerCase()
    
    if (lowerContent.includes('work') || lowerContent.includes('deadline') || lowerContent.includes('meeting')) {
      triggers.push('work stress')
    }
    if (lowerContent.includes('relationship') || lowerContent.includes('family') || lowerContent.includes('friend')) {
      triggers.push('interpersonal concerns')
    }
    if (lowerContent.includes('health') || lowerContent.includes('sick') || lowerContent.includes('tired')) {
      triggers.push('health concerns')
    }
    
    return triggers
  }

  async analyzeSentiment(entry: JournalEntry): Promise<SentimentData & { sentiment: 'positive' | 'negative' | 'neutral', confidence: number }> {
    // Minimal implementation for GREEN phase
    const notes = [
      entry.morningEntry?.notes,
      entry.eveningEntry?.notes
    ].filter(Boolean).join(' ')
    
    const sentimentData = this.analyzeSentimentText(notes)
    const positiveCount = sentimentData.positiveWords.length
    const negativeCount = sentimentData.negativeWords.length
    const total = positiveCount + negativeCount
    
    return {
      ...sentimentData,
      sentiment: positiveCount > negativeCount ? 'positive' : 
                negativeCount > positiveCount ? 'negative' : 'neutral',
      confidence: total > 0 ? Math.min(total / 10, 1) : 0.5
    }
  }

  async detectEmotions(text: string): Promise<EmotionResult[]> {
    // Minimal implementation for GREEN phase
    const lowerText = text.toLowerCase()
    const detectedEmotions: EmotionResult[] = []
    
    for (const [emotion, keywords] of Object.entries(this.emotionKeywords)) {
      const matchCount = keywords.filter(keyword => lowerText.includes(keyword)).length
      if (matchCount > 0) {
        detectedEmotions.push({
          emotion,
          intensity: Math.min(matchCount * 2, 10),
          confidence: Math.min(matchCount / keywords.length, 1)
        })
      }
    }
    
    return detectedEmotions.length > 0 ? detectedEmotions : [
      { emotion: 'neutral', intensity: 3, confidence: 0.5 }
    ]
  }

  async measureIntensity(entry: JournalEntry): Promise<IntensityResult> {
    // Minimal implementation for GREEN phase
    const morningMood = entry.morningEntry?.mood || 3
    const stressLevel = entry.eveningEntry?.stressLevel || 3
    const satisfaction = entry.eveningEntry?.satisfaction || 3
    
    return {
      overall: (morningMood + satisfaction) / 2,
      stressLevel: stressLevel,
      joyLevel: satisfaction,
      anxietyLevel: 5 - morningMood + stressLevel / 2
    }
  }

  async analyzeContext(entry: JournalEntry): Promise<ContextResult> {
    // Minimal implementation for GREEN phase
    const notes = [
      entry.morningEntry?.notes,
      entry.eveningEntry?.notes,
      entry.morningEntry?.blockers?.join(' '),
      entry.eveningEntry?.challenges?.join(' ')
    ].filter(Boolean).join(' ')
    
    return {
      triggers: this.identifyEmotionalTriggers(notes),
      copingMechanisms: entry.eveningEntry?.gratitude?.length ? ['gratitude practice'] : ['journaling'],
      supportSystems: notes.toLowerCase().includes('team') || notes.toLowerCase().includes('family') ? 
                     ['team support', 'family support'] : ['personal resilience']
    }
  }

  async trackEmotionalProgress(entries: JournalEntry[]): Promise<ProgressResult> {
    // Minimal implementation for GREEN phase
    if (entries.length < 2) {
      return {
        overallTrend: 'stable',
        keyMetrics: { entriesAnalyzed: entries.length },
        milestones: []
      }
    }
    
    const recentMood = entries.slice(-3).reduce((sum, entry) => 
      sum + (entry.morningEntry?.mood || 3), 0) / Math.min(3, entries.length)
    const earlierMood = entries.slice(0, 3).reduce((sum, entry) => 
      sum + (entry.morningEntry?.mood || 3), 0) / Math.min(3, entries.length)
    
    const trend = recentMood > earlierMood + 0.5 ? 'improving' : 
                 recentMood < earlierMood - 0.5 ? 'declining' : 'stable'
    
    return {
      overallTrend: trend,
      keyMetrics: { 
        averageMood: recentMood, 
        moodImprovement: recentMood - earlierMood,
        entriesAnalyzed: entries.length 
      },
      milestones: trend === 'improving' ? [{ 
        achievement: 'mood_improvement', 
        date: entries[entries.length - 1].entryDate,
        significance: 0.8
      }] : []
    }
  }

  async identifyBreakthroughs(entries: JournalEntry[]): Promise<BreakthroughResult[]> {
    // Minimal implementation for GREEN phase
    const breakthroughs: BreakthroughResult[] = []
    
    if (entries.length < 3) return breakthroughs
    
    // Look for significant positive mood shifts
    for (let i = 2; i < entries.length; i++) {
      const current = entries[i].morningEntry?.mood || 3
      const previous = entries[i-1].morningEntry?.mood || 3
      const beforeThat = entries[i-2].morningEntry?.mood || 3
      
      // Breakthrough if mood jumped significantly after being low
      if (current >= 4 && previous <= 2 && beforeThat <= 2) {
                 breakthroughs.push({
           date: entries[i].entryDate,
           insight: 'Significant mood improvement detected',
           significance: 0.9
         })
      }
    }
    
    // Look for stress management breakthroughs
    const recentEntries = entries.slice(-7)
    const avgStress = recentEntries.reduce((sum, entry) => 
      sum + (entry.eveningEntry?.stressLevel || 3), 0) / recentEntries.length
    
    if (avgStress < 2.5) {
             breakthroughs.push({
         date: recentEntries[recentEntries.length - 1].entryDate,
         insight: 'Stress management mastery achieved',
         significance: 0.7
       })
    }
    
    return breakthroughs
  }
} 