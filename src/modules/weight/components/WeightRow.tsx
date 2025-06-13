import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Card, CardContent } from '@/shared/ui/card'

import { WeightEntry } from '../types'
import { useWeightActions } from '../hooks/useWeightActions'

interface WeightRowProps {
  entry: WeightEntry
}

export function WeightRow({ entry }: WeightRowProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  )
  const [isPressed, setIsPressed] = useState(false)
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
    trackMouse: true,
  })

  return (
    <Card
      {...swipeHandlers}
      className={`
        cyber-card cursor-pointer py-3 transition-all duration-200
        ${isPressed ? 'scale-95 shadow-inner' : 'hover:scale-[1.01]'}
      `}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
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
          <div className="text-right font-mono text-xs text-gray-500">
            <div>Hold to delete</div>
            <div className="text-plasma-cyan">← Swipe left</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
