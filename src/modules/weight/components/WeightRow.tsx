import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Card, CardContent } from '@/shared/ui/card'

import { WeightEntry } from '../types'
import { useWeightActions } from '../hooks/useWeightActions'

interface WeightRowProps {
  entry: WeightEntry
}

export function WeightRow({ entry }: WeightRowProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isPressed, setIsPressed] = useState(false)
  const { deleteWeight } = useWeightActions()

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatWeight = (kg: number) => {
    return `${kg.toFixed(1)} kg`
  }

  const handleLongPress = () => {
    const confirmed = window.confirm(
      `Delete weight entry for ${formatDate(entry.dateISO)}?`
    )
    if (confirmed) {
      deleteWeight(entry.id, entry.kg, entry.dateISO)
    }
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
    trackMouse: true
  })

  return (
    <Card
      {...swipeHandlers}
      className={`
        cyber-card py-3 transition-all duration-200 cursor-pointer
        ${isPressed ? 'scale-95 shadow-inner' : 'hover:scale-[1.01]'}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <CardContent className="py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm text-gray-400 font-mono">
              {formatDate(entry.dateISO)}
            </span>
            <span className="text-lg font-semibold gradient-text-ki metric-display">
              {formatWeight(entry.kg)}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-mono text-right">
            <div>Hold to delete</div>
            <div className="text-plasma-cyan">← Swipe left</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 