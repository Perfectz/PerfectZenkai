import { useState, useRef, useEffect, ReactNode } from 'react'

interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}

interface PopoverTriggerProps {
  asChild?: boolean
  children: ReactNode
}

interface PopoverContentProps {
  className?: string
  align?: 'start' | 'center' | 'end'
  children: ReactNode
}

export function Popover({ open, onOpenChange, children }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(open || false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        const newOpen = false
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onOpenChange])

  const handleToggle = () => {
    const newOpen = !isOpen
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Clone children and add click handler to trigger */}
      {Array.isArray(children) ? (
        <>
          <div onClick={handleToggle}>{children[0]}</div>
          {isOpen && children[1]}
        </>
      ) : (
        children
      )}
    </div>
  )
}

export function PopoverTrigger({ children }: PopoverTriggerProps) {
  return <>{children}</>
}

export function PopoverContent({ className = '', align = 'start', children }: PopoverContentProps) {
  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0',
  }

  return (
    <div
      className={`absolute top-full mt-2 z-50 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none ${alignmentClasses[align]} ${className}`}
    >
      {children}
    </div>
  )
} 