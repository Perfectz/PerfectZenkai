import React, { useState } from 'react'
import { Plus, Heart, Trash2, AlertCircle } from 'lucide-react'

interface GratitudeListProps {
  gratitude: string[]
  onChange: (gratitude: string[]) => void
  maxItems?: number
  required?: boolean
}

export default function GratitudeList({ 
  gratitude, 
  onChange, 
  maxItems = 3,
  required = false 
}: GratitudeListProps) {
  const [newGratitude, setNewGratitude] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddGratitude = () => {
    if (newGratitude.trim() && gratitude.length < maxItems) {
      onChange([...gratitude, newGratitude.trim()])
      setNewGratitude('')
      setIsAdding(false)
    }
  }

  const handleRemoveGratitude = (index: number) => {
    const updatedGratitude = gratitude.filter((_, i) => i !== index)
    onChange(updatedGratitude)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddGratitude()
    }
    if (e.key === 'Escape') {
      setIsAdding(false)
      setNewGratitude('')
    }
  }

  const canAddMore = gratitude.length < maxItems

  const gratitudePrompts = [
    "Something that made me smile today",
    "A person who helped or supported me",
    "A small moment of joy or peace",
    "Something I learned or discovered",
    "A challenge that helped me grow",
    "Something beautiful I noticed",
    "A comfort or convenience I enjoyed",
    "Progress I made on a goal"
  ]

  const getRandomPrompt = () => {
    return gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-500" />
          <label className="text-sm font-medium text-white">
            Gratitude ({maxItems} items)
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        </div>
        <span className="text-xs text-gray-400">
          {gratitude.length}/{maxItems}
        </span>
      </div>

      {/* Gratitude validation message */}
      {required && gratitude.length === 0 && (
        <div className="flex items-center gap-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-xs text-red-400">At least one gratitude item is required</span>
        </div>
      )}

      {/* Existing gratitude items */}
      <div className="space-y-2">
        {gratitude.map((item, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-pink-500/10 border border-pink-500/30 rounded-lg"
          >
            <div className="flex items-center justify-center w-6 h-6 bg-pink-500 text-white text-xs font-bold rounded-full mt-0.5">
              {index + 1}
            </div>
            <span className="flex-1 text-sm text-white leading-relaxed">{item}</span>
            <button
              type="button"
              onClick={() => handleRemoveGratitude(index)}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add new gratitude item */}
      {isAdding ? (
        <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg space-y-3">
          <div className="text-xs text-gray-400 mb-2">
            💡 <strong>Prompt:</strong> {getRandomPrompt()}
          </div>
          <textarea
            value={newGratitude}
            onChange={(e) => setNewGratitude(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="What are you grateful for today?"
            rows={2}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 resize-none"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddGratitude}
              disabled={!newGratitude.trim()}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-medium hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Gratitude
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false)
                setNewGratitude('')
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
          className="w-full p-3 border-2 border-dashed border-pink-500/50 rounded-lg text-pink-400 hover:border-pink-500 hover:text-pink-300 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Gratitude ({gratitude.length}/{maxItems})
        </button>
      ) : (
        <div className="text-center p-3 bg-pink-500/10 rounded-lg">
          <span className="text-xs text-pink-400">
            All {maxItems} gratitude items completed! 🙏
          </span>
        </div>
      )}

      {gratitude.length === 0 && !isAdding && (
        <div className="text-center py-6 space-y-2">
          <p className="text-xs text-gray-500">
            Take a moment to reflect on what you're grateful for today
          </p>
          <div className="text-xs text-gray-600 space-y-1">
            <p>🌟 Big wins or small moments</p>
            <p>💝 People who made a difference</p>
            <p>🌱 Lessons learned or growth experienced</p>
          </div>
        </div>
      )}

      {/* Gratitude benefits */}
      {gratitude.length > 0 && (
        <div className="text-xs text-gray-500 bg-pink-500/5 p-3 rounded-lg space-y-1">
          <p>✨ <strong>Benefits of gratitude:</strong></p>
          <p>• Improves mood and mental well-being</p>
          <p>• Enhances sleep quality and reduces stress</p>
          <p>• Strengthens relationships and social connections</p>
        </div>
      )}
    </div>
  )
} 