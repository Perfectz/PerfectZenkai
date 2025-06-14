import { useState, useEffect, useRef } from 'react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Check, X, Edit3 } from 'lucide-react'

interface EditableTextProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  maxLength?: number
  multiline?: boolean
  onEnter?: () => void
  onEscape?: () => void
  autoFocus?: boolean
}

export function EditableText({
  value,
  onChange,
  placeholder = 'Enter text...',
  disabled = false,
  className = '',
  maxLength = 500,
  multiline = false,
  onEnter,
  onEscape,
  autoFocus = true,
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [originalValue, setOriginalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(value)
    setOriginalValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && autoFocus) {
      const element = multiline ? textareaRef.current : inputRef.current
      if (element) {
        element.focus()
        element.select()
      }
    }
  }, [isEditing, multiline, autoFocus])

  const handleStartEdit = () => {
    if (disabled) return
    setIsEditing(true)
    setEditValue(value)
    setOriginalValue(value)
  }

  const handleSave = () => {
    if (editValue.trim() !== originalValue.trim()) {
      onChange(editValue.trim())
    }
    setIsEditing(false)
    onEnter?.()
  }

  const handleCancel = () => {
    setEditValue(originalValue)
    setIsEditing(false)
    onEscape?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  const handleBlur = () => {
    // Auto-save on blur
    handleSave()
  }

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {multiline ? (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            className="flex-1 min-h-[60px] p-2 text-sm border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            className="flex-1"
          />
        )}
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
            title="Save (Enter)"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
            title="Cancel (Esc)"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`group flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded ${className}`}
      onClick={handleStartEdit}
      onDoubleClick={handleStartEdit}
    >
      <span className="flex-1 truncate">
        {value || <span className="text-muted-foreground italic">{placeholder}</span>}
      </span>
      <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-70 transition-opacity" />
    </div>
  )
} 