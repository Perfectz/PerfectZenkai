import { useState } from 'react'
import { Star, TrendingUp } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'

interface PointSelectorProps {
  value?: number // Current point value (1-10)
  onChange: (points: number) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function PointSelector({
  value = 5,
  onChange,
  disabled = false,
  size = 'md',
  showLabel = true,
  className = '',
}: PointSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')

  // Quick preset values with labels
  const presets = [
    { value: 1, label: 'Trivial', color: 'bg-gray-100 text-gray-600', icon: '🟢' },
    { value: 3, label: 'Easy', color: 'bg-green-100 text-green-700', icon: '🟡' },
    { value: 5, label: 'Medium', color: 'bg-blue-100 text-blue-700', icon: '🟠' },
    { value: 7, label: 'Hard', color: 'bg-orange-100 text-orange-700', icon: '🔴' },
    { value: 10, label: 'Epic', color: 'bg-purple-100 text-purple-700', icon: '🟣' },
  ]

  const getPointConfig = (points: number) => {
    if (points <= 2) return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Trivial' }
    if (points <= 4) return { color: 'text-green-700', bg: 'bg-green-100', label: 'Easy' }
    if (points <= 6) return { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Medium' }
    if (points <= 8) return { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Hard' }
    return { color: 'text-purple-700', bg: 'bg-purple-100', label: 'Epic' }
  }

  const config = getPointConfig(value)

  const handlePresetClick = (presetValue: number) => {
    onChange(presetValue)
    setIsOpen(false)
  }

  const handleCustomSubmit = () => {
    const numValue = parseInt(customValue)
    if (numValue >= 1 && numValue <= 10) {
      onChange(numValue)
      setCustomValue('')
      setIsOpen(false)
    }
  }

  const renderStars = (points: number) => {
    const filledStars = Math.min(Math.ceil(points / 2), 5)
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < filledStars
                ? 'fill-current text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const sizeClasses = {
    sm: 'h-6 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-base',
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={`${sizeClasses[size]} ${config.bg} ${config.color} border-current hover:opacity-80 ${className}`}
        >
          <TrendingUp className="mr-1 h-3 w-3" />
          <span className="font-medium">{value}</span>
          {size !== 'sm' && renderStars(value)}
          {showLabel && size === 'lg' && (
            <span className="ml-1 text-xs opacity-75">{config.label}</span>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Task Points</h4>
            <p className="text-xs text-muted-foreground">
              Rate the difficulty or importance of this task (1-10 scale)
            </p>
          </div>

          {/* Quick presets */}
          <div className="space-y-2">
            <p className="text-xs font-medium">Quick Select:</p>
            <div className="grid grid-cols-1 gap-1">
              {presets.map((preset) => (
                <Button
                  key={preset.value}
                  variant={value === preset.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handlePresetClick(preset.value)}
                  className={`justify-start ${preset.color} ${
                    value === preset.value ? '' : 'hover:' + preset.color
                  }`}
                >
                  <span className="mr-2">{preset.icon}</span>
                  <span className="flex-1 text-left">{preset.value} - {preset.label}</span>
                  {renderStars(preset.value)}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom value input */}
          <div className="space-y-2">
            <p className="text-xs font-medium">Custom Value:</p>
            <div className="flex gap-2">
              <Input
                type="number"
                min="1"
                max="10"
                placeholder="1-10"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCustomSubmit()
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={handleCustomSubmit}
                disabled={!customValue || parseInt(customValue) < 1 || parseInt(customValue) > 10}
              >
                Set
              </Button>
            </div>
          </div>

          {/* Current selection preview */}
          <div className={`p-3 rounded-lg ${config.bg} ${config.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current: {value} points</p>
                <p className="text-xs opacity-75">{config.label} difficulty</p>
              </div>
              {renderStars(value)}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 