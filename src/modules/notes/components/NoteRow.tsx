import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Card, CardContent } from '@/shared/ui/card'
import { Edit, Calendar } from 'lucide-react'
import { Note } from '../types'
import { useNotesStore } from '../store'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Button } from '@/shared/ui/button'

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
      <Card className="cyber-card border-white/10 bg-slate-900/70">
        <CardContent className="p-4">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="mb-3 h-11 rounded-xl border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
            placeholder="Note title..."
          />
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="mb-3 min-h-[140px] rounded-xl border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
            rows={4}
            placeholder="Note content..."
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="min-h-[42px] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!editTitle.trim()}
              className="min-h-[42px] rounded-xl"
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      {...swipeHandlers}
      className={`cursor-pointer border-white/10 bg-slate-900/70 transition-all duration-150 ${
        isPressed ? 'scale-[0.99] bg-slate-800' : 'hover:bg-slate-800/70'
      }`}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={() => setIsEditing(true)}
    >
      <CardContent className="px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 truncate text-base font-medium text-white">{note.title}</h3>
            {note.content && (
              <p className="line-clamp-3 text-sm text-slate-400">
                {note.content}
              </p>
            )}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(note.updatedAt)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <div className="text-xs text-slate-500 sm:hidden">Tap to edit</div>
            <div className="hidden text-xs text-slate-500 opacity-70 sm:block">
              Swipe to delete
            </div>
            <Edit className="h-4 w-4 text-slate-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
