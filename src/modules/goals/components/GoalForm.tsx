import React, { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { ChevronDown } from 'lucide-react'
import { useGoalsStore } from '../store'
import { GoalCategory } from '../types'
import { GOAL_CATEGORIES, GOAL_COLORS } from '../utils'

interface GoalFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const GoalForm: React.FC<GoalFormProps> = ({ onSuccess, onCancel }) => {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<GoalCategory>('other')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0])
  
  const { addGoal, isLoading } = useGoalsStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    try {
      await addGoal({
        title: title.trim(),
        category,
        description: description.trim() || undefined,
        targetDate: targetDate || undefined,
        color: selectedColor,
        isActive: true,
      })
      
      // Reset form
      setTitle('')
      setCategory('other')
      setDescription('')
      setTargetDate('')
      setSelectedColor(GOAL_COLORS[0])
      
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create goal:', error)
    }
  }

  const categoryInfo = GOAL_CATEGORIES.find(cat => cat.value === category)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Create New Goal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              required
              maxLength={100}
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  type="button"
                >
                  {categoryInfo && (
                    <span className="flex items-center gap-2">
                      <span>{categoryInfo.icon}</span>
                      <span>{categoryInfo.label}</span>
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2">
                <div className="space-y-1">
                  {GOAL_CATEGORIES.map((cat) => (
                    <Button
                      key={cat.value}
                      variant={category === cat.value ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setCategory(cat.value)}
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </span>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            {categoryInfo && (
              <p className="text-sm text-muted-foreground">{categoryInfo.description}</p>
            )}
          </div>

          {/* Optional Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Brief description of your goal..."
              rows={2}
              maxLength={200}
            />
          </div>

          {/* Optional Target Date */}
          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date (Optional)</Label>
            <Input
              id="targetDate"
              type="date"
              value={targetDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTargetDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Goal Color</Label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-gray-800 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={!title.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Creating...' : 'Create Goal'}
            </Button>
            {onCancel && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 