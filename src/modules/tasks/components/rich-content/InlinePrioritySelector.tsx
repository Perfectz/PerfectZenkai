import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Edit3 } from 'lucide-react'
import { getPriorityConfig } from '../../utils'
import { Priority } from '../../types'

interface InlinePrioritySelectorProps {
  value: Priority
  onChange: (value: Priority) => void
  disabled?: boolean
  className?: string
}

export function InlinePrioritySelector({
  value,
  onChange,
  disabled = false,
  className = '',
}: InlinePrioritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentConfig = getPriorityConfig(value)

  const handleSelect = (priority: Priority) => {
    onChange(priority)
    setIsOpen(false)
  }

  const handleKeyboardShortcut = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return
    
    const key = e.key.toLowerCase()
    const priorityKeys: Record<string, Priority> = {
      'l': 'low',
      'm': 'medium',
      'h': 'high'
    }
    
    if (priorityKeys[key]) {
      e.preventDefault()
      onChange(priorityKeys[key])
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
            <div className={`px-2 py-1 rounded text-xs font-medium ${currentConfig.color} border border-current`}>
              <span className="mr-1">{currentConfig.icon}</span>
              {currentConfig.label}
            </div>
            <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Set Priority</h4>
            <p className="text-xs text-muted-foreground">
              Use keys 1-3 or click to select
            </p>
          </div>

          <div className="space-y-1">
            {(['low', 'medium', 'high'] as Priority[]).map((priority, index) => {
              const config = getPriorityConfig(priority)
              const isSelected = value === priority
              
              return (
                <Button
                  key={priority}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSelect(priority)}
                  className={`w-full justify-start ${isSelected ? '' : config.color}`}
                >
                  <span className="mr-2">{config.icon}</span>
                  <span className="flex-1 text-left">{config.label}</span>
                  <span className="text-xs opacity-60">{index + 1}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
} 