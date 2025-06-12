import { useRef } from 'react'
import { WeightEntry } from '../types'
import { useWeightStore } from '../store'
import { useSwipeable } from 'react-swipeable'

interface WeightRowProps {
  entry: WeightEntry
}

export function WeightRow({ entry }: WeightRowProps) {
  const { deleteWeight } = useWeightStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const handlers = useSwipeable({
    onSwipedLeft: () => onDelete(),
    preventScrollOnSwipe: true,
    trackTouch: true,
  })

  const onDelete = () => {
    if (confirm('Delete this weight entry?')) {
      deleteWeight(entry.id)
    }
  }

  const handleMouseDown = () => {
    timerRef.current = setTimeout(onDelete, 200)
  }
  const handleMouseUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const date = new Date(entry.dateISO)
  const formattedDate = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      {...handlers}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="p-4 bg-card rounded-md shadow-sm flex justify-between items-center"
    >
      <span>{formattedDate}</span>
      <span>{entry.kg.toFixed(1)} kg</span>
    </div>
  )
} 