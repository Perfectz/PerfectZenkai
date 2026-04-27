import React from 'react'
import { getRatingLabel, getRatingColor } from '../utils/journalHelpers'

interface MoodEnergySelectorProps {
  label: string
  value: number
  onChange: (value: number) => void
  icon?: React.ReactNode
  description?: string
  required?: boolean
}

export default function MoodEnergySelector({
  label,
  value,
  onChange,
  icon,
  description,
  required = false,
}: MoodEnergySelectorProps) {
  const ratings = [1, 2, 3, 4, 5]

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-4">
      <div className="flex items-center gap-2">
        {icon && <span className="text-cyan-200">{icon}</span>}
        <label className="text-sm font-semibold text-white">
          {label}
          {required && <span className="ml-1 text-rose-300">*</span>}
        </label>
      </div>
      
      {description && (
        <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
      )}
      
      <div className="mt-4 grid grid-cols-5 gap-2">
        {ratings.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`
              flex min-h-[4.25rem] flex-col items-center justify-center rounded-2xl border px-2 py-3 transition-all
              ${value === rating
                ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-100'
                : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200'
              }
            `}
          >
            <span className="text-lg font-semibold">{rating}</span>
            <span className="mt-1 text-center text-[0.65rem] leading-tight">
              {getRatingLabel(rating)}
            </span>
          </button>
        ))}
      </div>
      
      {value > 0 && (
        <div className="mt-3 text-center">
          <span className={`text-sm font-medium ${getRatingColor(value)}`}>
            Current: {getRatingLabel(value)} ({value}/5)
          </span>
        </div>
      )}
    </div>
  )
} 
