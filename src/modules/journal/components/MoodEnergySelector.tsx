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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-green-500">{icon}</span>}
        <label className="text-sm font-medium text-white">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      </div>
      
      {description && (
        <p className="text-xs text-gray-400">{description}</p>
      )}
      
      <div className="flex items-center justify-between">
        {ratings.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`
              flex flex-col items-center p-3 rounded-lg border-2 transition-all
              ${value === rating
                ? 'border-green-500 bg-green-500/20 text-green-400'
                : 'border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500 hover:text-gray-300'
              }
            `}
          >
            <span className="text-lg font-bold">{rating}</span>
            <span className="text-xs mt-1 text-center leading-tight">
              {getRatingLabel(rating)}
            </span>
          </button>
        ))}
      </div>
      
      {value > 0 && (
        <div className="text-center">
          <span className={`text-sm font-medium ${getRatingColor(value)}`}>
            Current: {getRatingLabel(value)} ({value}/5)
          </span>
        </div>
      )}
    </div>
  )
} 