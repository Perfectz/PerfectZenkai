import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Edit3, Search } from 'lucide-react'
import { Category } from '../../types'
import { getCategoryConfig } from '../../utils'

interface InlineCategorySelectorProps {
  value: Category
  onChange: (value: Category) => void
  disabled?: boolean
  className?: string
}

export function InlineCategorySelector({
  value,
  onChange,
  disabled = false,
  className = '',
}: InlineCategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const categories: Category[] = ['work', 'personal', 'health', 'learning', 'other']
  const currentConfig = getCategoryConfig(value)

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelect = (category: Category) => {
    onChange(category)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleKeyboardShortcut = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return
    
    const key = e.key
    const categoryKeys: Record<string, Category> = {
      'w': 'work',
      'p': 'personal', 
      'h': 'health',
      'l': 'learning',
      'o': 'other'
    }
    
    if (categoryKeys[key.toLowerCase()]) {
      e.preventDefault()
      onChange(categoryKeys[key.toLowerCase()])
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
      <PopoverContent className="w-56 p-3" align="start">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-medium text-sm">Set Category</h4>
            <p className="text-xs text-muted-foreground">
              Type to search or use shortcuts: W, P, H, L, O
            </p>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 text-xs"
            />
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto">
            {filteredCategories.map((category) => {
              const config = getCategoryConfig(category)
              const isSelected = value === category
              const shortcut = category.charAt(0).toUpperCase()
              
              return (
                <Button
                  key={category}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleSelect(category)}
                  className={`w-full justify-start ${isSelected ? '' : config.color}`}
                >
                  <span className="mr-2">{config.icon}</span>
                  <span className="flex-1 text-left capitalize">{category}</span>
                  <span className="text-xs opacity-60">{shortcut}</span>
                </Button>
              )
            })}
          </div>

          {filteredCategories.length === 0 && searchTerm && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No categories found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
} 