import type { MorningEntry, EveningEntry, JournalEntryType } from '../modules/journal/types'
import type { ExerciseType, IntensityLevel } from '../modules/workout/types'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type GenericRow = Record<string, unknown>

type TableDefinition<
  Row extends GenericRow,
  Insert extends GenericRow = Partial<Row>,
  Update extends GenericRow = Partial<Row>,
> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

type TodoRow = {
  id: string
  user_id: string
  text?: string | null
  summary?: string | null
  description?: string | null
  description_format?: string | null
  done?: boolean | null
  priority?: string | null
  category?: string | null
  points?: number | null
  due_date?: string | null
  due_date_time?: string | null
  completed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type SubtaskRow = {
  id: string
  todo_id: string
  text: string
  done?: boolean | null
  created_at?: string | null
}

type WeightEntryRow = {
  id: string
  user_id: string
  date_iso?: string | null
  kg?: number | null
  created_at?: string | null
  updated_at?: string | null
}

type WeightGoalRow = {
  id: string
  user_id: string
  goal_type: 'lose' | 'gain' | 'maintain'
  target_weight?: number | null
  target_date?: string | null
  starting_weight?: number | null
  is_active?: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

type NoteRow = {
  id: string
  user_id: string
  title?: string | null
  content?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type ProfileRow = {
  id: string
  username?: string | null
  email?: string | null
}

type JournalEntryRow = {
  id: string
  user_id: string
  entry_date: string
  entry_type: JournalEntryType
  morning_entry?: MorningEntry | null
  evening_entry?: EveningEntry | null
  created_at?: string | null
  updated_at?: string | null
}

type WorkoutEntryRow = {
  id: string
  exerciseId: string
  exerciseName: string
  exerciseType: ExerciseType
  duration: number
  intensity: IntensityLevel
  calories?: number | null
  notes?: string | null
  sets?: number | null
  reps?: number | null
  weight?: number | null
  distance?: number | null
  createdAt: string
  updatedAt: string
}

type ExerciseRow = {
  id: string
  name: string
  type: ExerciseType
  category: string
  description?: string | null
  instructions?: string | null
  muscle_groups?: string[] | null
  equipment?: string[] | null
  is_custom: boolean
  created_at: string
  updated_at: string
}

type WorkoutTemplateRow = {
  id: string
  name: string
  description?: string | null
  exercises: {
    exerciseId: string
    exerciseName: string
    duration: number
    intensity: IntensityLevel
    sets?: number
    reps?: number
    weight?: number
    restTime?: number
  }[]
  estimatedDuration: number
  difficulty: IntensityLevel
  tags: string[]
  isCustom: boolean
  createdAt: string
  updatedAt: string
}

type WorkoutGoalRow = {
  id: string
  type: 'duration' | 'frequency' | 'calories' | 'streak'
  target: number
  period: 'daily' | 'weekly' | 'monthly'
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Database {
  public: {
    Tables: {
      [key: string]: TableDefinition<GenericRow, GenericRow, GenericRow>
      todos: TableDefinition<TodoRow>
      subtasks: TableDefinition<SubtaskRow>
      weight_entries: TableDefinition<WeightEntryRow>
      weight_goals: TableDefinition<WeightGoalRow>
      notes: TableDefinition<NoteRow>
      profiles: TableDefinition<ProfileRow>
      journal_entries: TableDefinition<JournalEntryRow>
      workout_entries: TableDefinition<WorkoutEntryRow>
      exercises: TableDefinition<ExerciseRow>
      workout_templates: TableDefinition<WorkoutTemplateRow>
      workout_goals: TableDefinition<WorkoutGoalRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}