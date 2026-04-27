import React, { useState } from 'react'
import { AlertCircle, Plus, Target, Trash2 } from 'lucide-react'

interface PriorityListProps {
  priorities: string[]
  onChange: (priorities: string[]) => void
  maxItems?: number
  required?: boolean
}

export default function PriorityList({
  priorities,
  onChange,
  maxItems = 3,
  required = false,
}: PriorityListProps) {
  const [newPriority, setNewPriority] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddPriority = () => {
    if (newPriority.trim() && priorities.length < maxItems) {
      onChange([...priorities, newPriority.trim()])
      setNewPriority('')
      setIsAdding(false)
    }
  }

  const handleRemovePriority = (index: number) => {
    onChange(priorities.filter((_, itemIndex) => itemIndex !== index))
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddPriority()
    }
    if (event.key === 'Escape') {
      setIsAdding(false)
      setNewPriority('')
    }
  }

  const canAddMore = priorities.length < maxItems

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-emerald-300" />
          <label className="text-sm font-semibold text-white">
            Top {maxItems} Priorities
            {required && <span className="ml-1 text-rose-300">*</span>}
          </label>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-300">
          {priorities.length}/{maxItems}
        </span>
      </div>

      {required && priorities.length === 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-3">
          <AlertCircle className="h-4 w-4 text-rose-200" />
          <span className="text-xs text-rose-100">At least one priority is required</span>
        </div>
      )}

      <div className="space-y-2">
        {priorities.map((priority, index) => (
          <div
            key={`${priority}-${index}`}
            className="flex items-center gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-300 text-xs font-bold text-slate-950">
              {index + 1}
            </div>
            <span className="flex-1 text-sm text-white">{priority}</span>
            <button
              type="button"
              onClick={() => handleRemovePriority(index)}
              className="rounded-lg p-1 text-rose-200 hover:bg-rose-300/10 hover:text-rose-100"
              aria-label="Remove priority"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
          <input
            type="text"
            value={newPriority}
            onChange={(event) => setNewPriority(event.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="What is the highest value move?"
            className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddPriority}
              disabled={!newPriority.trim()}
              className="flex-1 rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Priority
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setNewPriority('')
              }}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : canAddMore ? (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 p-3 text-slate-400 transition-colors hover:border-cyan-300/30 hover:text-cyan-100"
        >
          <Plus className="h-4 w-4" />
          Add Priority ({priorities.length}/{maxItems})
        </button>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-center">
          <span className="text-xs text-slate-500">Maximum {maxItems} priorities reached</span>
        </div>
      )}

      {priorities.length === 0 && !isAdding && (
        <p className="py-4 text-center text-xs text-slate-500">
          No priorities set yet. Pick the top {maxItems} goals for today.
        </p>
      )}

      {priorities.length > 0 && (
        <div className="space-y-1 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-3 text-xs text-slate-300">
          <p><strong>Tip:</strong> Focus on completing these priorities first.</p>
          <p>Keep them specific and actionable for better results.</p>
        </div>
      )}
    </div>
  )
}
