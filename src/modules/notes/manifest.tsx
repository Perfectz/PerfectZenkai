import { BookOpen, StickyNote } from 'lucide-react'
import NotesPage from './pages/NotesPage'
import type { AppModuleManifest } from '@/app/module-system/types'
import { initializeNotesStore } from './store'

export const notesModule = {
  id: 'notes',
  version: '1.0.0',
  status: 'enabled',
  title: 'Notes',
  description: 'Capture and organize raw thoughts, references, and working material.',
  permissions: {
    requiresAuth: true,
    dataDomains: ['notes'],
    sideEffectLevel: 'write',
  },
  routes: [
    {
      id: 'notes.main',
      title: 'Notes',
      route: { path: 'notes', element: <NotesPage /> },
    },
  ],
  nav: [
    {
      id: 'notes.primary-nav',
      surface: 'primary',
      label: 'Notes',
      to: '/notes',
      icon: BookOpen,
      order: 40,
    },
  ],
  dashboard: [
    {
      id: 'notes.dashboard-card',
      surface: 'dashboard-home',
      order: 40,
      eyebrow: 'Notes',
      title: 'Capture and clarify',
      description:
        'Quickly store raw thoughts, then return later to shape them into plans or journal material.',
      to: '/notes',
      icon: StickyNote,
      buildState: ({ notes, latestNote }) => ({
        value: `${notes.length} notes`,
        meta: latestNote
          ? `Updated ${new Date(latestNote.updatedAt).toLocaleDateString()}`
          : 'Create the first note to start your capture stream.',
        statusLabel: latestNote ? 'Active' : 'Ready',
        tone: 'slate',
        stats: [
          { label: 'Latest', value: latestNote?.title || 'No note yet' },
          { label: 'Journal ready', value: latestNote ? 'Yes' : 'Not yet' },
        ],
        footer: latestNote
          ? 'Notes stay separate from tasks until you intentionally promote them.'
          : 'Use notes for unstructured capture, not unfinished todo items.',
      }),
    },
  ],
  capabilities: [
    {
      id: 'notes.capture-knowledge',
      label: 'Capture and organize notes',
      description: 'Create notes and surface note knowledge for the OpenClaude workflow.',
      visibility: 'agent',
      handlerKey: 'notes.capture-knowledge',
      legacyFunctionNames: ['organizeNotes', 'searchNotes', 'extractInsights', 'connectKnowledge'],
      inputSchema: 'notes.capture.request',
      outputSchema: 'notes.capture.response',
      permissions: {
        requiresAuth: true,
        dataDomains: ['notes'],
        sideEffectLevel: 'write',
      },
    },
  ],
  hooks: [
    {
      phase: 'post-auth',
      name: 'notes.initialize-store',
      order: 20,
      run: async () => {
        await initializeNotesStore()
      },
    },
  ],
  test: {
    smokeRoute: '/notes',
    readinessText: 'Notes',
    tags: ['pillar', 'notes'],
    isPrimaryPillar: true,
  },
} satisfies AppModuleManifest