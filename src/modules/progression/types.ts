import type { JournalEntry } from '@/modules/journal/types'
import type { Note } from '@/modules/notes/types'
import type { Todo } from '@/modules/tasks/types'
import type { WeightEntry } from '@/modules/weight/types'

export type PlayerAttribute = 'discipline' | 'recovery' | 'focus' | 'body' | 'reflection'
export type QuestStatus = 'complete' | 'open'
export type QuestDifficulty = 'easy' | 'standard' | 'hard'
export type BossPressureLevel = 'Calm' | 'Manageable' | 'Threat rising' | 'Boss fight'

export interface ProgressionInput {
  todayIso: string
  weights: WeightEntry[]
  todos: Todo[]
  notes: Note[]
  entries: JournalEntry[]
}

export interface QuestReward {
  xp: number
  attribute: PlayerAttribute
}

export interface DailyQuest {
  id: string
  label: string
  description: string
  complete: boolean
  status: QuestStatus
  difficulty: QuestDifficulty
  to: string
  reward: QuestReward
}

export interface RewardFeedItem {
  id: string
  label: string
  reward: string
  tone: 'cyan' | 'emerald' | 'amber' | 'violet'
}

export interface PlayerProfile {
  level: number
  totalXp: number
  levelProgress: number
  nextLevelXp: number
  title: string
  attributes: Record<PlayerAttribute, number>
}

export interface BossState {
  label: BossPressureLevel
  score: number
  description: string
}

export interface ProgressionSnapshot {
  player: PlayerProfile
  quests: DailyQuest[]
  rewardFeed: RewardFeedItem[]
  completedQuestCount: number
  questXp: number
  boss: BossState
  today: {
    completedTasks: Todo[]
    openTasks: Todo[]
    overdueTasks: Todo[]
    highPriorityTasks: Todo[]
    morningComplete: boolean
    eveningComplete: boolean
    todayWeight: WeightEntry | null
    latestNote: Note | null
  }
}
