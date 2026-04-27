import React, { useState } from 'react'
import { Plus, Heart, Trash2, AlertCircle, Sparkles } from 'lucide-react'

interface GratitudeListProps {
  gratitude: string[]
  onChange: (gratitude: string[]) => void
  maxItems?: number
  required?: boolean
}

const prompts = [
  'Something that made me smile today',
  'A person who helped or supported me',
  'A small moment of joy or peace',
  'Something I learned or discovered',
  'A challenge that helped me grow',
  'Something beautiful I noticed',
  'A comfort or convenience I enjoyed',
  'Progress I made on a goal',
]

export default function GratitudeList({
  gratitude,
  onChange,
  maxItems = 3,
  required = false,
}: GratitudeListProps) {
  const [newGratitude, setNewGratitude] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [prompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)])

  const handleAddGratitude = () => {
    if (newGratitude.trim() && gratitude.length < maxItems) {
      onChange([...gratitude, newGratitude.trim()])
      setNewGratitude('')
      setIsAdding(false)
    }
  }

  const handleRemoveGratitude = (index: number) => {
    onChange(gratitude.filter((_, i) => i !== index))
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddGratitude()
    }

    if (event.key === 'Escape') {
      setIsAdding(false)
      setNewGratitude('')
    }
  }

  const canAddMore = gratitude.length < maxItems

  return (
    <div className="rounded-[1.35rem] border border-pink-300/15 bg-pink-300/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-pink-300/20 bg-pink-300/10">
            <Heart className="h-4 w-4 text-pink-100" />
          </span>
          <div>
            <label className="text-sm font-semibold text-white">
              Gratitude
              {required ? <span className="ml-1 text-rose-300">*</span> : null}
            </label>
            <p className="text-xs text-slate-500">Bank the wins before the run ends.</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-xs font-semibold text-slate-300">
          {gratitude.length}/{maxItems}
        </span>
      </div>

      {required && gratitude.length === 0 ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-300/25 bg-rose-300/10 p-3 text-xs text-rose-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          At least one gratitude item is required.
        </div>
      ) : null}

      <div className="mt-4 space-y-2">
        {gratitude.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-start gap-3 rounded-2xl border border-pink-300/15 bg-slate-950/35 p-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-pink-300 text-xs font-bold text-slate-950">
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-sm leading-6 text-slate-100">{item}</span>
            <button
              type="button"
              onClick={() => handleRemoveGratitude(index)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition hover:border-rose-300/30 hover:bg-rose-300/10 hover:text-rose-100"
              aria-label="Remove gratitude item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="mt-4 space-y-3 rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4">
          <div className="flex items-start gap-2 rounded-2xl border border-pink-300/15 bg-pink-300/10 p-3 text-xs leading-5 text-pink-50">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Prompt:</strong> {prompt}
            </span>
          </div>
          <textarea
            value={newGratitude}
            onChange={(event) => setNewGratitude(event.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="What are you grateful for today?"
            rows={2}
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-pink-300/45 focus:ring-2 focus:ring-pink-300/15"
            autoFocus
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleAddGratitude}
              disabled={!newGratitude.trim()}
              className="flex-1 rounded-2xl bg-pink-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-pink-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Gratitude
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setNewGratitude('')
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : canAddMore ? (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-pink-300/25 bg-pink-300/[0.03] p-3 text-sm font-semibold text-pink-100 transition hover:border-pink-300/45 hover:bg-pink-300/10"
        >
          <Plus className="h-4 w-4" />
          Add Gratitude
        </button>
      ) : (
        <div className="mt-4 rounded-2xl border border-pink-300/15 bg-pink-300/10 p-3 text-center text-xs font-semibold text-pink-100">
          All {maxItems} gratitude items completed.
        </div>
      )}

      {gratitude.length === 0 && !isAdding ? (
        <div className="px-3 py-5 text-center text-xs leading-6 text-slate-500">
          <p>Try a win, a helpful person, or a lesson that moved you forward.</p>
        </div>
      ) : null}

      {gratitude.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-pink-300/10 bg-slate-950/35 p-3 text-xs leading-6 text-slate-400">
          <p className="font-semibold text-pink-100">Gratitude bonus</p>
          <p>- Improves mood and mental well-being</p>
          <p>- Reduces stress before sleep</p>
          <p>- Strengthens social connection</p>
        </div>
      ) : null}
    </div>
  )
}
