import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Button } from '@/shared/ui/button'
import { useDeferredInstallPrompt } from '@/shared/hooks/useDeferredInstallPrompt'
import { Download, X } from 'lucide-react'

const FIRST_VISIT_KEY = 'perfect-zenkai-first-visit'
const INSTALL_SHEET_DELAY = 30000 // 30 seconds

export default function InstallSheet() {
  const [showSheet, setShowSheet] = useState(false)
  const { isInstallable, showInstallPrompt, declineInstallPrompt } = useDeferredInstallPrompt()

  useEffect(() => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY)
    
    if (!hasVisited && isInstallable) {
      // Mark as visited
      localStorage.setItem(FIRST_VISIT_KEY, 'true')
      
      // Show install sheet after delay
      const timer = setTimeout(() => {
        setShowSheet(true)
      }, INSTALL_SHEET_DELAY)

      return () => clearTimeout(timer)
    }
  }, [isInstallable])

  const handleInstall = async () => {
    const success = await showInstallPrompt()
    if (success) {
      setShowSheet(false)
    }
  }

  const handleLater = () => {
    declineInstallPrompt()
    setShowSheet(false)
  }

  const handleClose = () => {
    // Same as "Later" - user dismissed the prompt
    handleLater()
  }

  if (!isInstallable || !showSheet) {
    return null
  }

  return (
    <Sheet open={showSheet} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Install Perfect Zenkai
          </SheetTitle>
          <SheetDescription>
            Install the app on your device for quick access and a better experience. 
            You can access it from your home screen just like any other app.
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleInstall} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Install App
          </Button>
          <Button variant="outline" onClick={handleLater} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Later
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center mt-4">
          You can always install later from your browser's menu
        </div>
      </SheetContent>
    </Sheet>
  )
} 