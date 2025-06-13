import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { WeightSheet } from '@/modules/weight/components/WeightSheet'

export default function GlobalFab() {
  const location = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)

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

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg z-50"
        data-testid="global-fab"
        onClick={handleFabClick}
      >
        <Plus className="h-6 w-6" />
      </Button>
      {location.pathname.startsWith('/weight') && (
        <WeightSheet open={sheetOpen} onOpenChange={setSheetOpen} />
      )}
    </>
  )
} 