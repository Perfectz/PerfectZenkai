import React, { useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useWeightStore } from '../store'

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

  const { addWeight, isLoading } = useWeightStore()

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
        kg: parseFloat(weight)
      })

      // Reset form and close sheet
      setDate(new Date().toISOString().split('T')[0])
      setWeight('')
      setErrors({})
      onOpenChange(false)
    } catch (error) {
      // Error is handled by the store
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
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader>
          <SheetTitle>Add Weight Entry</SheetTitle>
          <SheetDescription>
            Log your weight for today or a specific date.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min="0"
              max="999.9"
              placeholder="75.5"
              value={weight}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
              className={errors.weight ? 'border-red-500' : ''}
            />
            {errors.weight && (
              <p className="text-sm text-red-500">{errors.weight}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Weight'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
} 