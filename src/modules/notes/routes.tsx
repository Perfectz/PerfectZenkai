// src/modules/notes/routes.tsx

import { RouteObject } from 'react-router-dom'
import NotesPage from './pages/NotesPage'

export const notesRoutes: RouteObject[] = [
  { path: '/notes', element: <NotesPage /> }
] 