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
    <div className="container mx-auto px-4 pb-24 pt-4">
      <h2 className="mb-4 text-lg font-semibold">Notes</h2>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add new note form */}
      {isAdding ? (
        <div className="mb-6 rounded-lg border bg-card p-4">
          <Input
            placeholder="Note title..."
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className="mb-3"
            disabled={isLoading}
          />
          <Textarea
            placeholder="Write your note..."
            value={contentInput}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setContentInput(e.target.value)
            }
            className="mb-3 min-h-[120px]"
            disabled={isLoading}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={isLoading || !titleInput.trim()}
            >
              Save Note
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          className="mb-6 w-full"
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Note
        </Button>
      )}

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
            <div className="text-center text-muted-foreground">
              <p className="mb-2 text-4xl">🔍</p>
              <p>No notes found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
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
