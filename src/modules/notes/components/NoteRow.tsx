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
        content: editContent.trim()
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
    trackMouse: true
  })

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  if (isEditing) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full mb-3 px-3 py-2 text-sm font-medium bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Note title..."
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full mb-3 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={4}
            placeholder="Note content..."
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm border border-input rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={!editTitle.trim()}
              className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
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
      className={`transition-all duration-150 cursor-pointer ${
        isPressed ? 'bg-muted scale-95' : 'hover:bg-muted/50'
      }`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={() => setIsEditing(true)}
    >
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 mr-3">
            <h3 className="font-medium text-sm mb-1 truncate">
              {note.title}
            </h3>
            {note.content && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {note.content}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
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