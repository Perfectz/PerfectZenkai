import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Star, Edit3 } from 'lucide-react'

interface InlinePointSelectorProps {
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  className?: string
}

export function InlinePointSelector({
  value,
  onChange,
  disabled = false,
  className = '',
}: InlinePointSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')


  const getPointConfig = (points: number) => {
    if (points <= 2) return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Trivial' }
    if (points <= 4) return { color: 'text-green-700', bg: 'bg-green-100', label: 'Easy' }
    if (points <= 6) return { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Medium' }
    if (points <= 8) return { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Hard' }
    return { color: 'text-purple-700', bg: 'bg-purple-100', label: 'Epic' }
  }

  const renderStars = (points: number) => {
    const fullStars = Math.floor(points / 2)
    const hasHalfStar = points % 2 === 1
    
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < fullStars
                ? 'fill-current text-yellow-500'
                : i === fullStars && hasHalfStar
                ? 'text-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const config = getPointConfig(value)

  const quickPoints = [1, 3, 5, 7, 10]

  const handleQuickSelect = (points: number) => {
    onChange(points)
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

  const handleKeyboardShortcut = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return
    
    const key = e.key
    if (key >= '1' && key <= '9') {
      e.preventDefault()
      const points = parseInt(key)
      onChange(points)
      setIsOpen(false)
    }
  }, [isOpen, onChange])

  useEffect(() => {
    const handleGlobalKeyboard = (e: KeyboardEvent) => {
      if (isOpen) {
        handleKeyboardShortcut(e)
      }
    }

    document.addEventListener('keydown', handleGlobalKeyboard)
    return () => document.removeEventListener('keydown', handleGlobalKeyboard)
  }, [isOpen, handleKeyboardShortcut])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={`group h-auto p-2 hover:bg-muted/50 ${className}`}
        >
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.color}`}>
              {value}pt
            </div>
            {renderStars(value)}
            <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Edit Points</h4>
            <p className="text-xs text-muted-foreground">
              Use number keys 1-9, 0 for 10, or click to select
            </p>
          </div>

          {/* Quick selection buttons */}
          <div className="grid grid-cols-5 gap-2">
            {quickPoints.map((points) => {
              const pointConfig = getPointConfig(points)
              return (
                <Button
                  key={points}
                  variant={value === points ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleQuickSelect(points)}
                  className={`text-xs ${value === points ? '' : pointConfig.color}`}
                >
                  {points}
                </Button>
              )
            })}
          </div>

          {/* Custom input */}
          <div className="space-y-2">
            <p className="text-xs font-medium">Custom (1-10):</p>
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

          {/* Current selection display */}
          <div className={`p-3 rounded-lg ${config.bg} ${config.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{value} points</p>
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