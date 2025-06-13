import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Card, CardContent } from '@/shared/ui/card'
import { Edit, Calendar } from 'lucide-react'
import { Note } from '../types'
import { useNotesStore } from '../store'

interface NoteRowProps {
  note: Note
}

export function NoteRow({ note }: NoteRowProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(note.title)
  const [editContent, setEditContent] = useState(note.content)
  const { updateNote, deleteNote } = useNotesStore()

  const handleEdit = async () => {
    if (!editTitle.trim()) return

    try {
      await updateNote(note.id, {
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const handleCancel = () => {
    setEditTitle(note.title)
    setEditContent(note.content)
    setIsEditing(false)
  }

  const handleDelete = () => {
    const confirmed = window.confirm(`Delete note: "${note.title}"?`)
    if (confirmed) {
      deleteNote(note.id)
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isEditing) {
        handleDelete()
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year:
        date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    })
  }

  if (isEditing) {
    return (
      <Card className="border bg-card">
        <CardContent className="p-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="mb-3 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Note title..."
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="mb-3 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            rows={4}
            placeholder="Note content..."
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="rounded-md border border-input px-3 py-1 text-sm transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={!editTitle.trim()}
              className="rounded-md bg-primary px-3 py-1 text-sm text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      {...swipeHandlers}
      className={`cursor-pointer transition-all duration-150 ${
        isPressed ? 'scale-95 bg-muted' : 'hover:bg-muted/50'
      }`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={() => setIsEditing(true)}
    >
      <CardContent className="px-4 py-3">
        <div className="flex items-start justify-between">
          <div className="mr-3 min-w-0 flex-1">
            <h3 className="mb-1 truncate text-sm font-medium">{note.title}</h3>
            {note.content && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {note.content}
              </p>
            )}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(note.updatedAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Edit className="h-4 w-4 text-muted-foreground" />
            <div className="text-xs text-muted-foreground opacity-50">
              Swipe to delete
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
