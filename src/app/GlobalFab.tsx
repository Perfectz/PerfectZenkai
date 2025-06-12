import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import React, { useState } from 'react'
import { WeightSheet } from '@/modules/weight/components/WeightSheet'

export default function GlobalFab() {
  const location = useLocation()
  const [sheetOpen, setSheetOpen] = useState(false)

  // Show FAB only on weight pages
  if (!location.pathname.startsWith('/weight')) {
    return null
  }

  return (
    <>
      <Button
        size="icon"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg z-50"
        data-testid="global-fab"
        onClick={() => setSheetOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>
      <WeightSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
} 