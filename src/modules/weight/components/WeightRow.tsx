import { useState } from 'react'
import { useSwipeable } from 'react-swipeable'
import { Card, CardContent } from '@/shared/ui/card'

import { WeightEntry } from '../types'
import { useWeightStore } from '../store'

interface WeightRowProps {
  entry: WeightEntry
}

export function WeightRow({ entry }: WeightRowProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [isPressed, setIsPressed] = useState(false)
  const { deleteWeight } = useWeightStore()

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
      deleteWeight(entry.id)
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
      className={`transition-all duration-150 ${
        isPressed ? 'bg-muted scale-95' : 'hover:bg-muted/50'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <CardContent className="py-3 px-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              {formatDate(entry.dateISO)}
            </span>
            <span className="text-lg font-semibold">
              {formatWeight(entry.kg)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Hold to delete
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 