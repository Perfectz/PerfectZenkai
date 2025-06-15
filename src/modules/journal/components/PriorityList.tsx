import React, { useState } from 'react'
import { Plus, Target, Trash2, AlertCircle } from 'lucide-react'

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
  required = false 
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
    const updatedPriorities = priorities.filter((_, i) => i !== index)
    onChange(updatedPriorities)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddPriority()
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewPriority('')
    }
  }

  const canAddMore = priorities.length < maxItems

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-green-500" />
          <label className="text-sm font-medium text-white">
            Top {maxItems} Priorities
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        </div>
        <span className="text-xs text-gray-400">
          {priorities.length}/{maxItems}
        </span>
      </div>

      {/* Priority validation message */}
      {required && priorities.length === 0 && (
        <div className="flex items-center gap-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-xs text-red-400">At least one priority is required</span>
        </div>
      )}

      {/* Existing priorities */}
      <div className="space-y-2">
        {priorities.map((priority, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-600 rounded-lg"
          >
            <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-black text-xs font-bold rounded-full">
              {index + 1}
            </div>
            <span className="flex-1 text-sm text-white">{priority}</span>
            <button
              type="button"
              onClick={() => handleRemovePriority(index)}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new priority */}
      {isAdding ? (
        <div className="p-3 bg-gray-800 border border-gray-600 rounded-lg space-y-3">
          <input
            type="text"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="What's your priority for today?"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddPriority}
              disabled={!newPriority.trim()}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Priority
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setNewPriority('')
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : canAddMore ? (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Priority ({priorities.length}/{maxItems})
        </button>
      ) : (
        <div className="text-center p-3 bg-gray-800/50 rounded-lg">
          <span className="text-xs text-gray-500">
            Maximum {maxItems} priorities reached
          </span>
        </div>
      )}

      {priorities.length === 0 && !isAdding && (
        <p className="text-xs text-gray-500 text-center py-4">
          No priorities set yet. What are your top {maxItems} goals for today?
        </p>
      )}

      {/* Priority tips */}
      {priorities.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Tip:</strong> Focus on completing these priorities first</p>
          <p>🎯 Keep them specific and actionable for better results</p>
        </div>
      )}
    </div>
  )
} 