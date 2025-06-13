import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useWeightStore } from '../store'
import { useWeightActions } from '../hooks/useWeightActions'

interface WeightSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WeightSheet({ open, onOpenChange }: WeightSheetProps) {
  const [date, setDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [weight, setWeight] = useState('')
  const [errors, setErrors] = useState<{ date?: string; weight?: string }>({})

  const { isLoading } = useWeightStore()
  const { addWeight } = useWeightActions()

  const validateForm = () => {
    const newErrors: { date?: string; weight?: string } = {}

    if (!date) {
      newErrors.date = 'Date is required'
    }

    const weightNum = parseFloat(weight)
    if (!weight) {
      newErrors.weight = 'Weight is required'
    } else if (isNaN(weightNum) || weightNum <= 0) {
      newErrors.weight = 'Weight must be a positive number'
    } else if (weightNum >= 1000) {
      newErrors.weight = 'Weight must be less than 1000 kg'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await addWeight({
        dateISO: date,
        kg: parseFloat(weight),
      })

      // Reset form and close sheet
      setDate(new Date().toISOString().split('T')[0])
      setWeight('')
      setErrors({})
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the useWeightActions hook with toasts
      console.error('Failed to add weight:', error)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setDate(new Date().toISOString().split('T')[0])
      setWeight('')
      setErrors({})
    }
    onOpenChange(newOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="cyber-card h-[400px]">
        <SheetHeader>
          <SheetTitle className="cyber-subtitle text-ki-green">
            Add Weight Entry
          </SheetTitle>
          <SheetDescription className="font-mono text-gray-400">
            Log your weight for today or a specific date.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="cyber-label text-gray-300">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setDate(e.target.value)
              }
              className={`
                focus:border-ki-green focus:ring-ki-green/20 border-gray-600
                bg-gray-900 text-white
                ${errors.date ? 'border-red-500' : ''}
              `}
            />
            {errors.date && (
              <p className="font-mono text-sm text-red-400">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight" className="cyber-label text-gray-300">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              max="999.9"
              placeholder="75.5"
              value={weight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setWeight(e.target.value)
              }
              className={`
                focus:border-ki-green focus:ring-ki-green/20 border-gray-600 bg-gray-900
                font-mono text-white
                ${errors.weight ? 'border-red-500' : ''}
              `}
            />
            {errors.weight && (
              <p className="font-mono text-sm text-red-400">{errors.weight}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1 border-gray-600 bg-transparent text-gray-300 hover:bg-gray-800"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="cyber-ki"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'LOGGING...' : 'LOG WEIGHT'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
