import type { PerfectZenkaiDataExport } from '@/shared/utils/dataExport'

const SETTINGS_KEY = 'perfect-zenkai-openai-assistant-settings'

export interface OpenAIAssistantSettings {
  apiKey: string
  model: string
}

export interface AssistantMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface OpenAIResponse {
  output_text?: string
  output?: Array<{
    content?: Array<{
      text?: string
      type?: string
    }>
  }>
  error?: {
    message?: string
  }
}

const defaultSettings: OpenAIAssistantSettings = {
  apiKey: '',
  model: 'gpt-5.5',
}

export const getOpenAIAssistantSettings = (): OpenAIAssistantSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (!stored) {
      return defaultSettings
    }

    return { ...defaultSettings, ...JSON.parse(stored) }
  } catch {
    return defaultSettings
  }
}

export const saveOpenAIAssistantSettings = (settings: OpenAIAssistantSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export const clearOpenAIAssistantSettings = () => {
  localStorage.removeItem(SETTINGS_KEY)
}

const truncate = (value: unknown, maxLength = 1200) => {
  const text = typeof value === 'string' ? value : JSON.stringify(value)
  if (!text) {
    return ''
  }

  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
}

const simplifyExportForPrompt = (data: PerfectZenkaiDataExport) => ({
  exportedAt: data.exportMetadata.exportDate,
  recordCounts: data.dataIntegrity.recordCounts,
  profile: data.userProfile,
  health: {
    weights: {
      metadata: data.healthData.weights.metadata,
      entries: data.healthData.weights.entries.map((entry) => ({
        date: entry.dateISO,
        kg: entry.kg,
      })),
    },
    meals: {
      metadata: data.healthData.meals.metadata,
      entries: data.healthData.meals.entries.map((entry) => ({
        id: entry.id,
        timestamp: entry.timestamp,
        type: entry.type,
        foods: entry.foods.map((food) => food.name),
        notes: truncate(entry.notes, 500),
        nutrition: entry.nutrition,
      })),
    },
    workouts: {
      metadata: data.healthData.workouts.metadata,
      entries: data.healthData.workouts.entries.map((entry) => ({
        id: entry.id,
        createdAt: entry.createdAt,
        exerciseType: entry.exerciseType,
        duration: entry.duration,
        intensity: entry.intensity,
        notes: truncate(entry.notes, 500),
      })),
    },
  },
  productivity: {
    tasks: {
      metadata: data.productivityData.tasks.metadata,
      entries: data.productivityData.tasks.entries.map((todo) => ({
        id: todo.id,
        summary: todo.summary,
        done: todo.done,
        priority: todo.priority,
        category: todo.category,
        points: todo.points,
        dueDate: todo.dueDate,
        createdAt: todo.createdAt,
        completedAt: todo.completedAt,
        description: truncate(todo.description, 500),
      })),
    },
    dailyStandups: data.productivityData.dailyStandups,
  },
  wellness: {
    journal: {
      metadata: data.wellnessData.journal.metadata,
      entries: data.wellnessData.journal.entries.map((entry) => ({
        date: entry.entryDate,
        type: entry.entryType,
        morning: truncate(entry.morningEntry, 900),
        evening: truncate(entry.eveningEntry, 900),
      })),
    },
    notes: {
      metadata: data.wellnessData.notes.metadata,
      entries: data.wellnessData.notes.entries.map((note) => ({
        id: note.id,
        title: note.title,
        content: truncate(note.content, 1200),
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
    },
  },
})

const extractOutputText = (data: OpenAIResponse) => {
  if (data.output_text) {
    return data.output_text
  }

  const content = data.output
    ?.flatMap((item) => item.content ?? [])
    .map((item) => item.text)
    .filter(Boolean)
    .join('\n')

  return content || 'No assistant response was returned.'
}

export const runPersonalAssistantAnalysis = async ({
  settings,
  data,
  question,
  history,
}: {
  settings: OpenAIAssistantSettings
  data: PerfectZenkaiDataExport
  question: string
  history: AssistantMessage[]
}) => {
  if (!settings.apiKey.trim()) {
    throw new Error('Add your OpenAI API key before running analysis.')
  }

  const compactData = simplifyExportForPrompt(data)
  const recentHistory = history.slice(-8).map((message) => ({
    role: message.role,
    content: message.content,
  }))

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: settings.model.trim() || defaultSettings.model,
      instructions:
        'You are the private Perfect Zenkai assistant. Analyze the user data snapshot and act like a practical coach for health, tasks, journaling, workouts, meals, and notes. Be specific, cite concrete signals from the data, and propose a short next-action quest list. Do not claim cloud sync or database access.',
      input: [
        ...recentHistory,
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `${question}\n\nPerfect Zenkai local data snapshot:\n${JSON.stringify(compactData)}`,
            },
          ],
        },
      ],
      max_output_tokens: 1800,
    }),
    signal: AbortSignal.timeout(60000),
  })

  const payload = (await response.json().catch(() => ({}))) as OpenAIResponse

  if (!response.ok) {
    throw new Error(payload.error?.message || `OpenAI API error ${response.status}`)
  }

  return extractOutputText(payload)
}
