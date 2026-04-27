import type { Todo } from '@/modules/tasks/types'
import type {
  BossPressureLevel,
  BossState,
  DailyQuest,
  PlayerAttribute,
  PlayerProfile,
  ProgressionInput,
  ProgressionSnapshot,
  RewardFeedItem,
} from './types'

const NEXT_LEVEL_XP = 500

const attributeSeeds: Record<PlayerAttribute, number> = {
  discipline: 0,
  recovery: 0,
  focus: 0,
  body: 0,
  reflection: 0,
}

const getPlayerTitle = (level: number) => {
  if (level >= 20) return 'Zenkai Legend'
  if (level >= 12) return 'Momentum Warden'
  if (level >= 7) return 'Quest Captain'
  if (level >= 3) return 'Habit Runner'
  return 'Rookie Operator'
}

const isSameDate = (value: string | undefined, date: string) => Boolean(value?.startsWith(date))

const buildBossState = (overdue: Todo[], highPriority: Todo[]): BossState => {
  const score = overdue.length * 2 + highPriority.length
  let label: BossPressureLevel = 'Calm'

  if (score >= 6) label = 'Boss fight'
  else if (score >= 3) label = 'Threat rising'
  else if (score > 0) label = 'Manageable'

  const description =
    label === 'Calm'
      ? 'No urgent blockers are pressing the run.'
      : label === 'Manageable'
        ? 'A few tasks need attention before they snowball.'
        : label === 'Threat rising'
          ? 'High-priority or overdue work is starting to shape the day.'
          : 'Overdue work has become the main boss. Clear one priority first.'

  return { label, score, description }
}

const addAttributeXp = (
  attributes: Record<PlayerAttribute, number>,
  attribute: PlayerAttribute,
  xp: number
) => {
  attributes[attribute] += xp
}

export const buildProgressionSnapshot = ({
  todayIso,
  weights,
  todos,
  notes,
  entries,
}: ProgressionInput): ProgressionSnapshot => {
  const todayEntry = entries.find((entry) => entry.entryDate === todayIso) ?? null
  const todayWeight = weights.find((entry) => entry.dateISO === todayIso) ?? null
  const latestNote = notes[0] ?? null
  const openTasks = todos.filter((todo) => !todo.done)
  const overdueTasks = openTasks.filter((todo) => todo.dueDate && todo.dueDate < todayIso)
  const highPriorityTasks = openTasks.filter((todo) => todo.priority === 'high')
  const completedTasks = todos.filter((todo) => isSameDate(todo.completedAt, todayIso))
  const morningComplete = Boolean(todayEntry?.morningEntry)
  const eveningComplete = Boolean(todayEntry?.eveningEntry)

  const quests: DailyQuest[] = [
    {
      id: 'morning',
      label: 'Morning check-in',
      description: 'Start the loop before the day gets noisy.',
      complete: morningComplete,
      status: morningComplete ? 'complete' : 'open',
      difficulty: 'easy',
      to: '/journal',
      reward: { xp: 80, attribute: 'reflection' },
    },
    {
      id: 'focus',
      label: 'Clear one priority',
      description: 'Complete at least one task to move the run forward.',
      complete: completedTasks.length > 0,
      status: completedTasks.length > 0 ? 'complete' : 'open',
      difficulty: highPriorityTasks.length > 0 ? 'hard' : 'standard',
      to: '/todo',
      reward: { xp: 100, attribute: 'focus' },
    },
    {
      id: 'body',
      label: 'Log body signal',
      description: 'Capture weight, food, or training data.',
      complete: Boolean(todayWeight),
      status: todayWeight ? 'complete' : 'open',
      difficulty: 'easy',
      to: '/health',
      reward: { xp: 70, attribute: 'body' },
    },
    {
      id: 'capture',
      label: 'Capture intel',
      description: 'Create or update a note for the current mission.',
      complete: Boolean(latestNote && isSameDate(latestNote.updatedAt, todayIso)),
      status: latestNote && isSameDate(latestNote.updatedAt, todayIso) ? 'complete' : 'open',
      difficulty: 'easy',
      to: '/notes',
      reward: { xp: 50, attribute: 'discipline' },
    },
    {
      id: 'reflection',
      label: 'Evening debrief',
      description: 'Close the loop with lessons, gratitude, and tomorrow focus.',
      complete: eveningComplete,
      status: eveningComplete ? 'complete' : 'open',
      difficulty: 'standard',
      to: '/journal',
      reward: { xp: 80, attribute: 'recovery' },
    },
  ]

  const attributes = { ...attributeSeeds }
  const questXp = quests.reduce((sum, quest) => {
    if (!quest.complete) return sum
    addAttributeXp(attributes, quest.reward.attribute, quest.reward.xp)
    return sum + quest.reward.xp
  }, 0)

  const completedTaskXp = completedTasks.reduce((sum, todo) => sum + (todo.points || 25), 0)
  addAttributeXp(attributes, 'focus', completedTaskXp)
  addAttributeXp(attributes, 'body', weights.length * 5)
  addAttributeXp(attributes, 'reflection', entries.length * 20)
  addAttributeXp(attributes, 'discipline', notes.length * 3)

  const totalXp = questXp + completedTaskXp + weights.length * 5 + notes.length * 3 + entries.length * 20
  const level = Math.max(1, Math.floor(totalXp / NEXT_LEVEL_XP) + 1)
  const player: PlayerProfile = {
    level,
    totalXp,
    levelProgress: totalXp % NEXT_LEVEL_XP,
    nextLevelXp: NEXT_LEVEL_XP,
    title: getPlayerTitle(level),
    attributes,
  }

  const questDrops: RewardFeedItem[] = quests
    .filter((quest) => quest.complete)
    .map((quest) => ({
      id: `quest-${quest.id}`,
      label: `${quest.label} complete`,
      reward: `+${quest.reward.xp} XP`,
      tone: quest.reward.attribute === 'body' ? 'emerald' : 'cyan',
    }))

  const taskDrops: RewardFeedItem[] = completedTasks.slice(0, 3).map((todo) => ({
    id: `task-${todo.id}`,
    label: `Task cleared: ${todo.summary}`,
    reward: `+${todo.points || 25} XP`,
    tone: 'amber',
  }))

  return {
    player,
    quests,
    rewardFeed: [...taskDrops, ...questDrops].slice(0, 8),
    completedQuestCount: quests.filter((quest) => quest.complete).length,
    questXp,
    boss: buildBossState(overdueTasks, highPriorityTasks),
    today: {
      completedTasks,
      openTasks,
      overdueTasks,
      highPriorityTasks,
      morningComplete,
      eveningComplete,
      todayWeight,
      latestNote,
    },
  }
}
