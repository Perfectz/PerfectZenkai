import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { WeightSheet } from '@/modules/weight/components/WeightSheet'

export default function GlobalFab() {
  const location = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Show FAB on weight and todo pages
  if (!location.pathname.startsWith('/weight') && !location.pathname.startsWith('/todo')) {
    return null
  }

  // Focus todo input if on todo page
  const handleFabClick = () => {
    if (location.pathname.startsWith('/todo')) {
      const input = document.getElementById('new-task')
      if (input) {
        input.focus()
      }
    } else if (location.pathname.startsWith('/weight')) {
      setSheetOpen(true)
    }
  }

  const handleMouseDown = () => setIsPressed(true)
  const handleMouseUp = () => setIsPressed(false)
  const handleMouseLeave = () => setIsPressed(false)

  return (
    <>
      <div 
        className={`
          fixed bottom-6 right-6 z-50 transition-all duration-300
          ${isPressed ? 'scale-90' : 'scale-100'}
        `}
        data-testid="global-fab"
      >
        <Button
          onClick={handleFabClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`
            w-14 h-14 rounded-full shadow-2xl
            bg-hyper-magenta hover:bg-hyper-magenta
            text-white font-bold text-lg
            magenta-glow hover:magenta-glow
            transition-all duration-300 ease-out
            hover:scale-110 active:scale-95
            border-2 border-hyper-magenta/30
            relative overflow-hidden
            neon-button
            animate-pulse hover:animate-none
          `}
          size="icon"
        >
          <Plus className="h-6 w-6 cyber-icon transition-transform duration-200" />
          
          {/* Cyber glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
          
          {/* Pulsing ring effect */}
          <div className="absolute inset-0 rounded-full border border-hyper-magenta animate-pulse opacity-30"></div>
        </Button>
        
        {/* Floating label on hover */}
        <div className="absolute bottom-full right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1 text-xs text-white font-mono whitespace-nowrap">
            {location.pathname.startsWith('/todo') ? 'Focus quest input' : 'Log weight'}
          </div>
          <div className="w-2 h-2 bg-gray-900 border-r border-b border-gray-700 transform rotate-45 absolute top-full right-4 -translate-y-1"></div>
        </div>
      </div>

      {/* Weight sheet for weight page */}
      {location.pathname.startsWith('/weight') && (
        <WeightSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      )}
    </>
  )
} 