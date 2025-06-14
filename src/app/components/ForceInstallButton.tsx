import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Download, Smartphone, AlertCircle } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function ForceInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [showButton, setShowButton] = useState(true)
  const [status, setStatus] = useState('Checking PWA status...')

  useEffect(() => {
    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
      setStatus('✅ PWA ready to install!')
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setIsInstallable(false)
      setShowButton(false)
      setStatus('✅ PWA installed successfully!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setStatus('✅ Already running as PWA')
      setShowButton(false)
    } else {
      // Set a timeout to show warning if no install prompt
      const timer = setTimeout(() => {
        if (!deferredPrompt) {
          setStatus('⚠️ PWA install not available - check requirements')
        }
      }, 3000)

      return () => {
        clearTimeout(timer)
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [deferredPrompt])

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        
        if (outcome === 'accepted') {
          setStatus('✅ Installing PWA...')
        } else {
          setStatus('❌ Installation declined')
        }
      } catch (error) {
        setStatus('❌ Installation failed')
        console.error('Install error:', error)
      }
    } else {
      setStatus('❌ No install prompt available')
    }
  }

  const handleManualInstall = () => {
    setStatus('📱 Use browser menu: "Add to Home Screen" or "Install app"')
  }

  if (!showButton) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-xs">
      <div className="bg-primary text-primary-foreground p-4 rounded-lg shadow-lg border">
        <div className="flex items-center gap-2 mb-2">
          <Smartphone className="h-5 w-5" />
          <span className="font-semibold">Install PWA</span>
        </div>
        
        <div className="text-sm mb-3 opacity-90">
          {status}
        </div>

        <div className="flex flex-col gap-2">
          {isInstallable ? (
            <Button 
              onClick={handleInstall}
              size="sm"
              className="w-full bg-white text-primary hover:bg-gray-100"
            >
              <Download className="mr-2 h-4 w-4" />
              Install Now
            </Button>
          ) : (
            <Button 
              onClick={handleManualInstall}
              size="sm"
              variant="outline"
              className="w-full"
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              Manual Install
            </Button>
          )}
          
          <Button 
            onClick={() => setShowButton(false)}
            size="sm"
            variant="ghost"
            className="w-full text-xs"
          >
            Hide
          </Button>
        </div>
      </div>
    </div>
  )
} 