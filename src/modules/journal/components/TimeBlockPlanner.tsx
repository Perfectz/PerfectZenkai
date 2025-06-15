import { useState } from 'react'
import { Plus, Clock, Trash2 } from 'lucide-react'
import { TimeBlock } from '../types'
import { generateTimeOptions, formatTimeBlock } from '../utils/journalHelpers'

interface TimeBlockPlannerProps {
  timeBlocks: TimeBlock[]
  onChange: (timeBlocks: TimeBlock[]) => void
}

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
        startTime: newBlock.startTime!,
        endTime: newBlock.endTime!,
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
    const updatedBlocks = timeBlocks.filter((_, i) => i !== index)
    onChange(updatedBlocks)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/20 text-red-400'
      case 'medium': return 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
      case 'low': return 'border-green-500 bg-green-500/20 text-green-400'
      default: return 'border-gray-500 bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-green-500" />
        <label className="text-sm font-medium text-white">Time Blocks</label>
      </div>

      {/* Existing time blocks */}
      <div className="space-y-2">
        {timeBlocks.map((block, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getPriorityColor(block.priority)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">
                    {formatTimeBlock(block.startTime, block.endTime)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(block.priority)}`}>
                    {block.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{block.activity}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveBlock(index)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new time block */}
      {isAdding ? (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Start Time</label>
              <select
                value={newBlock.startTime}
                onChange={(e) => setNewBlock({ ...newBlock, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">End Time</label>
              <select
                value={newBlock.endTime}
                onChange={(e) => setNewBlock({ ...newBlock, endTime: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Activity</label>
            <input
              type="text"
              value={newBlock.activity}
              onChange={(e) => setNewBlock({ ...newBlock, activity: e.target.value })}
              placeholder="What will you be doing?"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Priority</label>
            <select
              value={newBlock.priority}
              onChange={(e) => setNewBlock({ ...newBlock, priority: e.target.value as 'high' | 'medium' | 'low' })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddBlock}
              disabled={!newBlock.activity}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Block
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Time Block
        </button>
      )}

      {timeBlocks.length === 0 && !isAdding && (
        <p className="text-xs text-gray-500 text-center py-4">
          No time blocks planned yet. Add some to organize your day!
        </p>
      )}
    </div>
  )
} 