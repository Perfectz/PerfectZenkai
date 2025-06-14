import { GoalCategory } from './types'

export const GOAL_CATEGORIES: {
  value: GoalCategory
  label: string
  icon: string
  description: string
}[] = [
  { 
    value: 'health', 
    label: 'Health & Fitness', 
    icon: '💪', 
    description: 'Physical and mental wellbeing goals' 
  },
  { 
    value: 'career', 
    label: 'Career & Work', 
    icon: '💼', 
    description: 'Professional development and work goals' 
  },
  { 
    value: 'learning', 
    label: 'Learning & Skills', 
    icon: '📚', 
    description: 'Education and skill development goals' 
  },
  { 
    value: 'personal', 
    label: 'Personal Growth', 
    icon: '🌱', 
    description: 'Self-improvement and personal development' 
  },
  { 
    value: 'finance', 
    label: 'Finance & Money', 
    icon: '💰', 
    description: 'Financial planning and money goals' 
  },
  { 
    value: 'relationships', 
    label: 'Relationships', 
    icon: '❤️', 
    description: 'Family, friends, and social connections' 
  },
  { 
    value: 'other', 
    label: 'Other', 
    icon: '🎯', 
    description: 'Miscellaneous goals' 
  },
]

export const GOAL_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
]

export const getRandomGoalColor = (): string => {
  return GOAL_COLORS[Math.floor(Math.random() * GOAL_COLORS.length)]
}

export const getCategoryInfo = (category: GoalCategory) => {
  return GOAL_CATEGORIES.find(cat => cat.value === category) || GOAL_CATEGORIES[GOAL_CATEGORIES.length - 1]
}

export const formatTargetDate = (dateString?: string): string => {
  if (!dateString) return 'No deadline'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)} days overdue`
  } else if (diffDays === 0) {
    return 'Due today'
  } else if (diffDays === 1) {
    return 'Due tomorrow'
  } else if (diffDays <= 7) {
    return `Due in ${diffDays} days`
  } else {
    return date.toLocaleDateString()
  }
} 