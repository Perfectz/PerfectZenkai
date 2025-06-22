export interface CopingStrategy {
  technique: string
  description: string
  duration?: string
  effectiveness: number
  category: 'breathing' | 'mindfulness' | 'physical' | 'cognitive' | 'social'
  instructions?: string[]
}

export interface TherapeuticTechnique {
  name: string
  description: string
  steps: string[]
  duration: string
  evidenceBased: boolean
  suitableFor: string[]
}

export interface WellnessRecommendation {
  type: 'immediate' | 'short-term' | 'long-term'
  priority: 'low' | 'medium' | 'high'
  action: string
  rationale: string
  resources?: string[]
}

export interface PersonalizedAdvice {
  message: string
  tone: 'supportive' | 'encouraging' | 'calming' | 'motivational'
  actionItems: string[]
  followUp: string
}

export interface CrisisSupport {
  severity: 'low' | 'medium' | 'high' | 'critical'
  immediateActions: string[]
  resources: Array<{
    name: string
    contact: string
    description: string
  }>
  professionalHelp: boolean
  urgency: 'routine' | 'urgent' | 'immediate'
}

export class WellnessCoachingEngine {
  private copingStrategies: CopingStrategy[] = [
    {
      technique: 'Deep Breathing',
      description: 'Focus on slow, deep breaths to reduce anxiety',
      duration: '5 minutes',
      effectiveness: 0.8,
      category: 'breathing',
      instructions: ['Inhale for 4 counts', 'Hold for 4 counts', 'Exhale for 6 counts', 'Repeat']
    },
    {
      technique: 'Progressive Muscle Relaxation',
      description: 'Tense and release muscle groups to reduce physical tension',
      duration: '15 minutes',
      effectiveness: 0.85,
      category: 'physical',
      instructions: ['Start with your toes', 'Tense for 5 seconds', 'Release and relax', 'Move up your body']
    },
    {
      technique: 'Mindfulness Meditation',
      description: 'Focus on present moment awareness',
      duration: '10 minutes',
      effectiveness: 0.9,
      category: 'mindfulness',
      instructions: ['Find a quiet space', 'Focus on your breath', 'Notice thoughts without judgment', 'Return focus to breath']
    }
  ]

  private therapeuticTechniques: TherapeuticTechnique[] = [
    {
      name: 'Cognitive Restructuring',
      description: 'Challenge and reframe negative thought patterns',
      steps: ['Identify the negative thought', 'Examine the evidence', 'Consider alternatives', 'Develop balanced thinking'],
      duration: '10-15 minutes',
      evidenceBased: true,
      suitableFor: ['anxiety', 'depression', 'stress']
    },
    {
      name: 'Grounding Technique (5-4-3-2-1)',
      description: 'Use your senses to stay present during anxiety',
      steps: ['5 things you can see', '4 things you can touch', '3 things you can hear', '2 things you can smell', '1 thing you can taste'],
      duration: '3-5 minutes',
      evidenceBased: true,
      suitableFor: ['anxiety', 'panic', 'dissociation']
    }
  ]

  generateCopingStrategies(emotions: string[], intensity: number): CopingStrategy[] {
    // Minimal implementation for GREEN phase
    if (intensity > 4 || emotions.includes('anxiety')) {
      return this.copingStrategies.filter(strategy => 
        strategy.category === 'breathing' || strategy.category === 'mindfulness'
      )
    }
    
    if (emotions.includes('stress')) {
      return this.copingStrategies.filter(strategy => 
        strategy.category === 'physical' || strategy.category === 'breathing'
      )
    }
    
    return this.copingStrategies.slice(0, 2) // Return first two strategies as default
  }

  recommendTherapeuticTechniques(emotionalState: string): TherapeuticTechnique[] {
    // Minimal implementation for GREEN phase
    return this.therapeuticTechniques.filter(technique => 
      technique.suitableFor.includes(emotionalState.toLowerCase())
    )
  }

  providePersonalizedAdvice(emotions: string[], _context: string): PersonalizedAdvice {
    // Minimal implementation for GREEN phase
    if (emotions.includes('anxiety')) {
      return {
        message: 'I understand you\'re feeling anxious. Remember that anxiety is temporary and you have the tools to manage it.',
        tone: 'calming',
        actionItems: ['Take 5 deep breaths', 'Try the grounding technique', 'Remind yourself this feeling will pass'],
        followUp: 'How are you feeling after trying these techniques?'
      }
    }
    
    if (emotions.includes('stress')) {
      return {
        message: 'Stress can feel overwhelming, but you\'re stronger than you realize. Let\'s break this down into manageable steps.',
        tone: 'supportive',
        actionItems: ['Identify your top 3 priorities', 'Take a 10-minute break', 'Practice progressive muscle relaxation'],
        followUp: 'What\'s one small step you can take right now?'
      }
    }
    
    return {
      message: 'I\'m here to support you on your wellness journey. Every small step counts.',
      tone: 'encouraging',
      actionItems: ['Check in with yourself regularly', 'Practice self-compassion', 'Celebrate small wins'],
      followUp: 'What would be most helpful for you right now?'
    }
  }



  generateWellnessRecommendations(emotions: string[], _patterns: unknown[]): WellnessRecommendation[] {
    // Minimal implementation for GREEN phase
    const recommendations: WellnessRecommendation[] = []
    
    if (emotions.includes('anxiety')) {
      recommendations.push({
        type: 'immediate',
        priority: 'high',
        action: 'Practice deep breathing exercises',
        rationale: 'Breathing techniques can quickly reduce anxiety symptoms',
        resources: ['Breathing exercise guide', 'Meditation apps']
      })
    }
    
    if (emotions.includes('stress')) {
      recommendations.push({
        type: 'short-term',
        priority: 'medium',
        action: 'Establish a daily relaxation routine',
        rationale: 'Regular relaxation helps build resilience to stress',
        resources: ['Progressive muscle relaxation guide', 'Stress management techniques']
      })
    }
    
    recommendations.push({
      type: 'long-term',
      priority: 'medium',
      action: 'Consider professional counseling',
      rationale: 'Professional support can provide personalized strategies',
      resources: ['Therapist directories', 'Mental health resources']
    })
    
    return recommendations
  }

  async recommendCopingStrategies(emotionalState: { currentEmotion: string; intensity: number }): Promise<CopingStrategy[]> {
    // Minimal implementation for GREEN phase
    const strategies = this.generateCopingStrategies([emotionalState.currentEmotion], emotionalState.intensity)
    return strategies
  }

  async assessCrisisLevel(state: { emotionalState: string; intensity: number; duration?: string; riskFactors?: string[] }): Promise<{
    level: string
    severity: string
    immediateActions: string[]
    resources: Array<{ name: string; contact: string; available: string }>
    followUp: string
    professionalHelp: boolean
  }> {
    // Minimal implementation for GREEN phase
    // const _severity = state.intensity > 8 ? 'severe' : state.intensity > 6 ? 'high' : 'moderate'
    
    const criticalFactors = state.riskFactors?.filter(factor => 
      ['suicide', 'self-harm', 'hopeless', 'trapped'].some(keyword => 
        factor.toLowerCase().includes(keyword)
      )
    ) || []

    if (criticalFactors.length > 0 || state.intensity > 8) {
      return {
        level: 'critical',
        severity: 'severe',
        immediateActions: [
          'Contact emergency services (911)',
          'Call National Suicide Prevention Lifeline (988)',
          'Reach out to trusted support person immediately'
        ],
        resources: [
          { name: 'National Suicide Prevention Lifeline', contact: '988', available: '24/7' },
          { name: 'Crisis Text Line', contact: 'Text HOME to 741741', available: '24/7' },
          { name: 'Emergency Services', contact: '911', available: '24/7' }
        ],
        followUp: 'immediate',
        professionalHelp: true
      }
    }

    if (state.intensity > 6 || state.emotionalState === 'severe depression') {
      return {
        level: 'high',
        severity: 'high',
        immediateActions: [
          'Consider calling a mental health professional',
          'Reach out to trusted friend or family member',
          'Use grounding techniques and coping strategies'
        ],
        resources: [
          { name: 'Crisis Text Line', contact: 'Text HOME to 741741', available: '24/7' },
          { name: 'Mental Health Hotline', contact: '1-800-950-NAMI', available: '24/7' }
        ],
        followUp: 'within 24 hours',
        professionalHelp: true
      }
    }

    return {
      level: 'moderate',
      severity: 'moderate',
      immediateActions: [
        'Practice self-care and coping strategies',
        'Monitor emotional state',
        'Consider reaching out to support network'
      ],
      resources: [
        { name: 'Self-Help Resources', contact: 'Online resources available', available: 'Always' }
      ],
      followUp: 'within a few days',
      professionalHelp: false
    }
  }

  async createWellnessGoals(input: { focusAreas: string[]; currentLevel: string; timeframe: string }): Promise<Array<{
    title: string
    description: string
    targetMetrics: string[]
    timeline: string
    techniques: string[]
  }>> {
    // Minimal implementation for GREEN phase
    const goals = []
    
    if (input.focusAreas.includes('stress')) {
      goals.push({
        title: 'Stress Management',
        description: 'Develop effective stress management techniques',
        targetMetrics: ['Stress level < 3/5', 'Daily relaxation practice'],
        timeline: input.timeframe,
        techniques: ['Deep breathing', 'Progressive muscle relaxation', 'Mindfulness']
      })
    }

    if (input.focusAreas.includes('anxiety')) {
      goals.push({
        title: 'Anxiety Reduction',
        description: 'Build anxiety management skills and confidence',
        targetMetrics: ['Anxiety episodes < 2/week', 'Confidence level > 7/10'],
        timeline: input.timeframe,
        techniques: ['Grounding techniques', 'Cognitive restructuring', 'Exposure therapy']
      })
    }

    if (input.focusAreas.includes('mood')) {
      goals.push({
        title: 'Mood Stability',
        description: 'Maintain consistent positive mood patterns',
        targetMetrics: ['Daily mood rating > 6/10', 'Mood swings < 1/week'],
        timeline: input.timeframe,
        techniques: ['Daily journaling', 'Regular exercise', 'Social connection']
      })
    }

    return goals.length > 0 ? goals : [{
      title: 'General Wellness',
      description: 'Improve overall mental health and wellbeing',
      targetMetrics: ['Daily self-care practice', 'Weekly mental health check-in'],
      timeline: input.timeframe,
      techniques: ['Mindfulness', 'Regular sleep schedule', 'Healthy boundaries']
    }]
  }

  async trackGoalProgress(input: { goalId: string; currentData: Array<{ date: string; value: number }>; timeframe: string }): Promise<{
    goalId: string
    completionRate: number
    currentProgress: string
    trend: string
    recommendations: string[]
    nextMilestone: string
  }> {
    // Minimal implementation for GREEN phase
    const dataPoints = input.currentData.length
    const completionRate = dataPoints > 0 ? Math.min(dataPoints / 30, 1) : 0 // Assume 30 days for full completion
    
    return {
      goalId: input.goalId,
      completionRate: completionRate,
      currentProgress: `${Math.round(completionRate * 100)}%`,
      trend: completionRate > 0.7 ? 'excellent' : completionRate > 0.4 ? 'good' : 'needs improvement',
      recommendations: completionRate < 0.5 ? [
        'Consider adjusting goal timeline',
        'Break down into smaller milestones',
        'Increase accountability support'
      ] : [
        'Continue current practices',
        'Consider expanding goals',
        'Share progress with support network'
      ],
      nextMilestone: `Reach ${Math.min(Math.round(completionRate * 100) + 20, 100)}% completion`
    }
  }

  async recommendTechniques(input: { issueType: string; severity: string; preferences: string[] }): Promise<Array<{
    name: string
    category: string
    duration: string
    difficulty: string
  }>> {
    // Minimal implementation for GREEN phase
    const allTechniques = [
      { name: 'Deep Breathing', category: 'breathing', duration: '5 minutes', difficulty: 'easy' },
      { name: 'Progressive Muscle Relaxation', category: 'physical', duration: '15 minutes', difficulty: 'medium' },
      { name: 'Mindfulness Meditation', category: 'mindfulness', duration: '10 minutes', difficulty: 'medium' },
      { name: 'Cognitive Restructuring', category: 'cognitive', duration: '20 minutes', difficulty: 'hard' },
      { name: 'Grounding (5-4-3-2-1)', category: 'grounding', duration: '5 minutes', difficulty: 'easy' }
    ]

    // Filter by preferences if provided
    let recommended = allTechniques
    if (input.preferences.length > 0) {
      recommended = allTechniques.filter(technique => 
        input.preferences.some(pref => technique.category.includes(pref.toLowerCase()))
      )
    }

    // Adjust for severity
    if (input.severity === 'high' || input.severity === 'severe') {
      recommended = recommended.filter(technique => technique.difficulty === 'easy' || technique.difficulty === 'medium')
    }

    return recommended.slice(0, 3) // Return top 3 recommendations
  }

  async getMindfulnessExercises(input: { duration: string; focusArea: string; experienceLevel: string }): Promise<Array<{
    name: string
    duration: string
    instructions: string[]
    difficulty: string
    benefits: string[]
  }>> {
    // Minimal implementation for GREEN phase
    const exercises = [
      {
        name: 'Breath Awareness',
        duration: input.duration,
        instructions: [
          'Find a comfortable seated position',
          'Close your eyes or soften your gaze',
          'Focus on your natural breath',
          'When mind wanders, gently return to breath',
          'Continue for the full duration'
        ],
        difficulty: 'beginner',
        benefits: ['Reduces anxiety', 'Improves focus', 'Calms nervous system']
      },
      {
        name: 'Body Scan',
        duration: input.duration,
        instructions: [
          'Lie down comfortably',
          'Start at the top of your head',
          'Slowly scan down through your body',
          'Notice sensations without judgment',
          'Complete scan from head to toes'
        ],
        difficulty: 'intermediate',
        benefits: ['Releases tension', 'Improves body awareness', 'Promotes relaxation']
      },
      {
        name: 'Loving Kindness',
        duration: input.duration,
        instructions: [
          'Sit comfortably and close your eyes',
          'Begin with sending love to yourself',
          'Extend to loved ones',
          'Include neutral people',
          'Send love to all beings'
        ],
        difficulty: 'intermediate',
        benefits: ['Increases compassion', 'Reduces negative emotions', 'Improves relationships']
      }
    ]

    // Filter by experience level
    return exercises.filter(exercise => {
      if (input.experienceLevel === 'beginner') return exercise.difficulty === 'beginner'
      if (input.experienceLevel === 'intermediate') return exercise.difficulty !== 'advanced'
      return true // Advanced users can do all exercises
    })
  }

  private getCopingStrategies(_emotions: string[], _intensity: number): Array<{ strategy: string; type: string; effectiveness: number }> {
    // Extract severity for future analysis (commented out to avoid unused variable)
    // const _severity = intensity
    
    return this.copingStrategies.map(strategy => ({
      strategy: strategy.technique,
      type: strategy.category,
      effectiveness: strategy.effectiveness
    }))
  }
} 