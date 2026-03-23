import { BookOpenCheck, Calendar, Sparkles } from 'lucide-react'
import JournalPage from './pages/JournalPage'
import type { AppModuleManifest } from '@/app/module-system/types'

export const journalModule = {
  id: 'journal',
  version: '1.0.0',
  status: 'enabled',
  title: 'Journal',
  description: 'Canonical daily check-in and reflection surface.',
  permissions: {
    requiresAuth: true,
    dataDomains: ['journal'],
    sideEffectLevel: 'write',
  },
  routes: [
    {
      id: 'journal.main',
      title: 'Journal',
      route: { path: 'journal', element: <JournalPage /> },
    },
  ],
  nav: [
    {
      id: 'journal.primary-nav',
      surface: 'primary',
      label: 'Journal',
      to: '/journal',
      icon: Calendar,
      order: 30,
    },
  ],
  dashboard: [
    {
      id: 'journal.dashboard-card',
      surface: 'dashboard-home',
      order: 30,
      eyebrow: 'Journal',
      title: 'Morning and evening loop',
      description:
        'Use one canonical journal surface for planning, reflection, and daily continuity.',
      to: '/journal',
      icon: BookOpenCheck,
      quickActionLabel: 'Open journal',
      buildState: ({
        morningComplete,
        eveningComplete,
        latestJournalDate,
        recentEntries,
        journalStreak,
      }) => ({
        value:
          morningComplete && eveningComplete
            ? '2 of 2 complete'
            : morningComplete || eveningComplete
              ? '1 of 2 complete'
              : 'No entry today',
        meta: latestJournalDate
          ? `Latest journal ${new Date(latestJournalDate).toLocaleDateString()}`
          : 'No journal history yet.',
        statusLabel:
          morningComplete && eveningComplete
            ? 'Complete'
            : morningComplete || eveningComplete
              ? 'In progress'
              : 'Needs check-in',
        tone:
          morningComplete && eveningComplete
            ? 'sky'
            : morningComplete || eveningComplete
              ? 'amber'
              : 'rose',
        stats: [
          { label: 'Recent entries', value: `${recentEntries.length}` },
          { label: 'Current streak', value: `${journalStreak} days` },
        ],
        footer:
          journalStreak > 0
            ? `Reflection streak is active at ${journalStreak} day${journalStreak === 1 ? '' : 's'}.`
            : 'One journal page now owns the daily check-in workflow.',
      }),
    },
    {
      id: 'journal.check-in-card',
      surface: 'dashboard-tactical',
      order: 10,
      eyebrow: 'Next move',
      title: 'Start or close the day deliberately',
      description:
        'The journal should remain the canonical place for planning first and reflection last.',
      to: '/journal',
      icon: Sparkles,
      buildState: ({ morningComplete, eveningComplete }) => ({
        value: morningComplete ? 'Evening reflection' : 'Morning check-in',
        meta: morningComplete
          ? 'Reflection should happen before shutdown.'
          : 'Planning should happen before reacting.',
        statusLabel: morningComplete ? 'Pending tonight' : 'Priority now',
        tone: morningComplete ? 'amber' : 'rose',
        stats: [
          { label: 'Morning', value: morningComplete ? 'Done' : 'Open' },
          { label: 'Evening', value: eveningComplete ? 'Done' : 'Open' },
        ],
        footer: 'The journal is now the canonical daily loop.',
      }),
    },
  ],
  capabilities: [
    {
      id: 'journal.run-check-in',
      label: 'Run daily journal check-in',
      description: 'Read or update the daily planning and reflection loop.',
      visibility: 'agent',
      handlerKey: 'journal.run-check-in',
      legacyFunctionNames: ['fillStandupForm', 'getStandupData'],
      inputSchema: 'journal.check-in.request',
      outputSchema: 'journal.check-in.response',
      permissions: {
        requiresAuth: true,
        dataDomains: ['journal'],
        sideEffectLevel: 'write',
      },
    },
  ],
  test: {
    smokeRoute: '/journal',
    readinessText: 'Daily Journal',
    tags: ['pillar', 'journal'],
    isPrimaryPillar: true,
  },
} satisfies AppModuleManifest