import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function GlobalFab() {
  const location = useLocation()
  const [isPressed, setIsPressed] = useState(false)

  // Show FAB only on todo page now (weight page has inline form)
  if (!location.pathname.startsWith('/todo')) {
    return null
  }

  // Focus todo input
  const handleFabClick = () => {
    const input = document.getElementById('new-task')
    if (input) {
      input.focus()
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
            bg-hyper-magenta hover:bg-hyper-magenta magenta-glow hover:magenta-glow
            border-hyper-magenta/30 neon-button
            relative h-14 w-14
            animate-pulse overflow-hidden
            rounded-full border-2 text-lg
            font-bold text-white
            shadow-2xl transition-all
            duration-300 ease-out
            hover:scale-110
            hover:animate-none active:scale-95
          `}
          size="icon"
        >
          <Plus className="cyber-icon h-6 w-6 transition-transform duration-200" />

          {/* Cyber glow overlay */}
          <div className="absolute inset-0 translate-x-[-100%] transform bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ease-in-out hover:translate-x-[100%]"></div>

          {/* Pulsing ring effect */}
          <div className="border-hyper-magenta absolute inset-0 animate-pulse rounded-full border opacity-30"></div>
        </Button>

        {/* Floating label on hover */}
        <div className="pointer-events-none absolute bottom-full right-0 mb-2 opacity-0 transition-opacity duration-200 hover:opacity-100">
          <div className="whitespace-nowrap rounded-lg border border-gray-700 bg-gray-900 px-3 py-1 font-mono text-xs text-white">
            Focus quest input
          </div>
          <div className="absolute right-4 top-full h-2 w-2 -translate-y-1 rotate-45 transform border-b border-r border-gray-700 bg-gray-900"></div>
        </div>
      </div>


    </>
  )
}
