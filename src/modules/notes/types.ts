export interface Note {
  id: string // UUID v4
  title: string // Note title
  content: string // Note body content
  createdAt: string // ISO timestamp
  updatedAt: string // ISO timestamp for last edit
}
