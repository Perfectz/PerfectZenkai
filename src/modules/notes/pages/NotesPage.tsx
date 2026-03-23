import { useState, useEffect } from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Textarea } from '@/shared/ui/textarea'
import { Plus, Search } from 'lucide-react'
import { useNotesStore } from '../store'
import { NoteRow } from '../components/NoteRow'

export default function NotesPage() {
  const [titleInput, setTitleInput] = useState('')
  const [contentInput, setContentInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const { notes, addNote, loadNotes, isLoading } = useNotesStore()

  useEffect(() => {
    if (notes.length === 0) {
      loadNotes()
    }
  }, [notes.length, loadNotes])

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddNote = async () => {
    if (!titleInput.trim()) return

    try {
      await addNote({
        title: titleInput.trim(),
        content: contentInput.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Reset form
      setTitleInput('')
      setContentInput('')
      setIsAdding(false)
    } catch (error) {
      console.error('Failed to add note:', error)
    }
  }

  const handleCancel = () => {
    setTitleInput('')
    setContentInput('')
    setIsAdding(false)
  }

  return (
    <div className="app-page space-y-6 pb-6 pt-2">
      <div className="page-header">
        <div className="space-y-2">
          <div className="inline-flex rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-200">
            Capture and refine
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Notes</h1>
          <p className="text-sm text-gray-400 sm:text-base">Quick thoughts, edits, and searchable notes with a cleaner mobile compose flow.</p>
        </div>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            className="min-h-[44px] w-full rounded-xl sm:w-auto"
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Note
          </Button>
        )}
      </div>

      {/* Search bar */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 sm:p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 rounded-xl border-white/10 bg-slate-950/80 pl-10 text-white placeholder:text-slate-500"
        />
        </div>
        <div className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-center sm:min-w-[8rem]">
          <div className="text-lg font-semibold text-white">{filteredNotes.length}</div>
          <div className="text-xs text-slate-400">Visible notes</div>
        </div>
        </div>
      </div>

      {/* Add new note form */}
      {isAdding ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-[0_18px_50px_rgba(2,8,23,0.28)]">
          <Input
            placeholder="Note title..."
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="mb-3 h-12 rounded-xl border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
            disabled={isLoading}
          />
          <Textarea
            placeholder="Write your note..."
            value={contentInput}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setContentInput(e.target.value)
            }
            className="mb-3 min-h-[150px] rounded-xl border-white/10 bg-slate-950/80 text-white placeholder:text-slate-500"
            disabled={isLoading}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="min-h-[44px] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={isLoading || !titleInput.trim()}
              className="min-h-[44px] rounded-xl"
            >
              Save Note
            </Button>
          </div>
        </div>
      ) : null}

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {/* Notes list */}
      {!isLoading && (
        <>
          {filteredNotes.length > 0 ? (
            <div className="space-y-3">
              {filteredNotes.map((note) => (
                <NoteRow key={note.id} note={note} />
              ))}
            </div>
          ) : searchQuery ? (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-12 text-center text-muted-foreground">
              <p className="mb-2 text-4xl">🔍</p>
              <p>No notes found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 px-6 py-12 text-center text-muted-foreground">
              <p className="mb-2 text-4xl">📝</p>
              <p>No notes yet</p>
              <p className="text-sm">Create your first note above</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
