import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Card, CardContent } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Edit, Trash2 } from 'lucide-react'

import { WeightEntry, kgToLbs } from '../types'
import { useWeightActions } from '../hooks/useWeightActions'
import { WeightEditForm } from './WeightEditForm'

interface WeightRowProps {
  entry: WeightEntry
}

export function WeightRow({ entry }: WeightRowProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  )
  const [isPressed, setIsPressed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const { deleteWeight } = useWeightActions()

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatWeight = (kg: number) => {
    return `${kgToLbs(kg).toFixed(1)} lbs`
  }

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Delete weight entry for ${formatDate(entry.dateISO)}?`
    )
    if (confirmed) {
      deleteWeight(entry.id, entry.kg, entry.dateISO)
    }
  }

  const handleLongPress = () => {
    setShowActions(true)
  }

  const handleEdit = () => {
    setIsEditing(true)
    setShowActions(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = () => {
    setIsEditing(false)
  }

  const handleTouchStart = () => {
    setIsPressed(true)
    const timer = setTimeout(() => {
      handleLongPress()
    }, 500) // 500ms long press
    setLongPressTimer(timer)
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      handleLongPress()
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  // Show edit form if editing
  if (isEditing) {
    return (
      <WeightEditForm
        entry={entry}
        onCancel={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    )
  }

  return (
    <Card
      {...swipeHandlers}
      className={`
        cyber-card cursor-pointer py-3 transition-all duration-200
        ${isPressed ? 'scale-95 shadow-inner' : 'hover:scale-[1.01]'}
        ${showActions ? 'border-ki-green/50' : ''}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={() => !showActions && setShowActions(true)}
    >
      <CardContent className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-mono text-sm text-gray-400">
              {formatDate(entry.dateISO)}
            </span>
            <span className="gradient-text-ki metric-display text-lg font-semibold">
              {formatWeight(entry.kg)}
            </span>
          </div>
          
          {showActions ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit()
                }}
                className="border-ki-green/50 bg-transparent text-ki-green hover:bg-ki-green/10 h-8 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="border-red-500/50 bg-transparent text-red-400 hover:bg-red-500/10 h-8 px-2"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowActions(false)
                }}
                className="text-gray-400 hover:bg-gray-800 h-8 px-2 text-xs"
              >
                ✕
              </Button>
            </div>
          ) : (
            <div className="text-right font-mono text-xs text-gray-500">
              <div>Tap to edit</div>
              <div className="text-plasma-cyan">← Swipe left</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
