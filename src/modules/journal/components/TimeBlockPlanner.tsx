import { useState } from 'react'
import { Plus, Clock, Trash2 } from 'lucide-react'
import { TimeBlock } from '../types'
import { generateTimeOptions, formatTimeBlock } from '../utils/journalHelpers'

interface TimeBlockPlannerProps {
  timeBlocks: TimeBlock[]
  onChange: (timeBlocks: TimeBlock[]) => void
}

const inputClass =
  'w-full rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/45 focus:ring-2 focus:ring-emerald-300/15'

const priorityStyles = {
  high: 'border-rose-300/25 bg-rose-300/10 text-rose-100',
  medium: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
  low: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
} as const

export default function TimeBlockPlanner({ timeBlocks, onChange }: TimeBlockPlannerProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newBlock, setNewBlock] = useState<Partial<TimeBlock>>({
    startTime: '09:00',
    endTime: '10:00',
    activity: '',
    priority: 'medium',
  })

  const timeOptions = generateTimeOptions()

  const handleAddBlock = () => {
    if (newBlock.activity && newBlock.startTime && newBlock.endTime) {
      const block: TimeBlock = {
        startTime: newBlock.startTime,
        endTime: newBlock.endTime,
        activity: newBlock.activity,
        priority: newBlock.priority as 'high' | 'medium' | 'low',
      }

      onChange([...timeBlocks, block])
      setNewBlock({
        startTime: '09:00',
        endTime: '10:00',
        activity: '',
        priority: 'medium',
      })
      setIsAdding(false)
    }
  }

  const handleRemoveBlock = (index: number) => {
    onChange(timeBlocks.filter((_, i) => i !== index))
  }

  return (
    <div className="rounded-[1.35rem] border border-emerald-300/15 bg-emerald-300/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10">
            <Clock className="h-4 w-4 text-emerald-100" />
          </span>
          <div>
            <label className="text-sm font-semibold text-white">Time Blocks</label>
            <p className="text-xs text-slate-500">Lock the day into playable rounds.</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-xs font-semibold text-slate-300">
          {timeBlocks.length}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {timeBlocks.map((block, index) => {
          const priorityClass = priorityStyles[block.priority]

          return (
            <div
              key={`${block.startTime}-${block.endTime}-${index}`}
              className={`rounded-2xl border p-3 ${priorityClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {formatTimeBlock(block.startTime, block.endTime)}
                    </span>
                    <span className="rounded-full border border-current/20 bg-slate-950/30 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em]">
                      {block.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-6 text-slate-200">{block.activity}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBlock(index)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-slate-950/35 text-slate-400 transition hover:border-rose-300/30 hover:bg-rose-300/10 hover:text-rose-100"
                  aria-label="Remove time block"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {isAdding ? (
        <div className="mt-4 space-y-3 rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Start
              </label>
              <select
                value={newBlock.startTime}
                onChange={(event) => setNewBlock({ ...newBlock, startTime: event.target.value })}
                className={inputClass}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                End
              </label>
              <select
                value={newBlock.endTime}
                onChange={(event) => setNewBlock({ ...newBlock, endTime: event.target.value })}
                className={inputClass}
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Activity
            </label>
            <input
              type="text"
              value={newBlock.activity}
              onChange={(event) => setNewBlock({ ...newBlock, activity: event.target.value })}
              placeholder="What gets done in this block?"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Threat level
            </label>
            <select
              value={newBlock.priority}
              onChange={(event) =>
                setNewBlock({
                  ...newBlock,
                  priority: event.target.value as 'high' | 'medium' | 'low',
                })
              }
              className={inputClass}
            >
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={handleAddBlock}
              disabled={!newBlock.activity}
              className="flex-1 rounded-2xl bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Block
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-300/25 bg-emerald-300/[0.03] p-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/45 hover:bg-emerald-300/10"
        >
          <Plus className="h-4 w-4" />
          Add Time Block
        </button>
      )}

      {timeBlocks.length === 0 && !isAdding ? (
        <p className="px-3 py-5 text-center text-xs text-slate-500">
          No blocks planned yet. Add one to make the day easier to execute.
        </p>
      ) : null}
    </div>
  )
}
