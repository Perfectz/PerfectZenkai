import { useState, useEffect } from 'react'
import { Calendar, X } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

interface EnhancedDatePickerProps {
  value?: string // ISO datetime string
  onChange: (dateTime: string | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function EnhancedDatePicker({
  value,
  onChange,
  placeholder = 'Due date (e.g., tomorrow 2pm)',
  disabled = false,
  className = '',
}: EnhancedDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  // Initialize from value
  useEffect(() => {
    if (value) {
      const date = new Date(value)
      setSelectedDate(date.toISOString().split('T')[0])
      setSelectedTime(date.toTimeString().slice(0, 5))
    }
  }, [value])

  const handleManualDateTimeChange = () => {
    if (selectedDate) {
      const dateTime = new Date(`${selectedDate}T${selectedTime || '17:00'}`)
      if (!isNaN(dateTime.getTime())) {
        onChange(dateTime.toISOString())
        setIsOpen(false)
      }
    }
  }

  const handleClear = () => {
    onChange(undefined)
    setSelectedDate('')
    setSelectedTime('')
    setIsOpen(false)
  }

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString()
    
    let dateStr = date.toLocaleDateString()
    if (isToday) dateStr = 'Today'
    else if (isTomorrow) dateStr = 'Tomorrow'
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    
    return `${dateStr} at ${timeStr}`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={`justify-start text-left font-normal ${
            !value && 'text-muted-foreground'
          } ${className}`}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {value ? formatDateTime(value) : placeholder}
          {value && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-4" align="start">
        <div className="space-y-4">
          {/* Manual date/time picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Set Date & Time</label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-1">
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleManualDateTimeChange}
                  disabled={!selectedDate}
                >
                  Set
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}