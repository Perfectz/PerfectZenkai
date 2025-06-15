// src/modules/journal/types/index.ts

// Core types
export type JournalEntryType = 'morning' | 'evening' | 'both';
export type MoodLevel = 1 | 2 | 3 | 4 | 5;
export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type ProductivityLevel = 1 | 2 | 3 | 4 | 5;

// Time block for morning planning
export interface TimeBlock {
  startTime: string; // HH:MM format
  endTime: string;
  activity: string;
  priority: 'high' | 'medium' | 'low';
}

// Morning entry structure
export interface MorningEntry {
  yesterdayAccomplishments: string[];
  todayPlans: string[];
  blockers: string[];
  mood: MoodLevel;
  energy: EnergyLevel;
  sleepQuality: number; // 1-5
  topPriorities: string[]; // Max 3
  timeBlocks: TimeBlock[];
  notes: string;
}

// Evening entry structure
export interface EveningEntry {
  accomplishments: string[];
  challenges: string[];
  learnings: string[];
  tomorrowFocus: string[];
  unfinishedTasks: string[];
  gratitude: string[]; // Max 3
  improvements: string[];
  productivity: ProductivityLevel;
  stressLevel: number; // 1-5
  satisfaction: number; // 1-5
  notes: string;
}

// Main journal entry
export interface JournalEntry {
  id: string;
  entryDate: string; // YYYY-MM-DD
  entryType: JournalEntryType;
  morningEntry?: MorningEntry;
  eveningEntry?: EveningEntry;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface JournalAnalytics {
  completionRate: {
    weekly: number;
    monthly: number;
    morningEntries: number;
    eveningEntries: number;
  };
  trends: {
    moodTrend: number[]; // Last 30 days
    energyTrend: number[];
    productivityTrend: number[];
    sleepQualityTrend: number[];
  };
  insights: {
    commonBlockers: string[];
    topGratitudeThemes: string[];
    mostProductiveDays: string[];
    improvementAreas: string[];
  };
  streaks: {
    currentStreak: number;
    longestStreak: number;
    lastEntryDate: string;
  };
}

// Form state types
export interface JournalFormState {
  selectedDate: string;
  activeTab: 'morning' | 'evening';
  isDraft: boolean;
  hasUnsavedChanges: boolean;
}

// Database row type (matches Supabase schema)
export interface JournalEntryRow {
  id: string;
  entry_date: string;
  entry_type: JournalEntryType;
  morning_entry: MorningEntry | null;
  evening_entry: EveningEntry | null;
  created_at: string;
  updated_at: string;
} 