import { useState, useEffect } from 'react'
import { Button } from '@/shared/ui/button'
import { Download, X, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isInWebAppiOS = (window.navigator as { standalone?: boolean }).standalone === true
    const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches
    
    if (isStandalone || isInWebAppiOS || isInWebAppChrome) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay to not be intrusive
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen')
        if (!hasSeenPrompt) {
          setShowPrompt(true)
        }
      }, 10000) // Show after 10 seconds
    }

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowPrompt(false)
      setDeferredPrompt(null)
      localStorage.setItem('pwa-install-prompt-seen', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
      } else {
        console.log('User dismissed the install prompt')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
      localStorage.setItem('pwa-install-prompt-seen', 'true')
    } catch (error) {
      console.error('Error during installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-prompt-seen', 'true')
  }

  // Don't show if already installed or no prompt available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="cyber-card relative overflow-hidden border-ki-green/30 bg-gray-900/95 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-ki-green/5 to-plasma-cyan/5"></div>
        
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:text-white"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ki-green/20">
              <Smartphone className="h-5 w-5 text-ki-green" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Install Perfect Zenkai</h3>
              <p className="text-xs text-gray-400">Get the full app experience</p>
            </div>
          </div>

          <p className="mb-4 text-sm text-gray-300">
            Install Perfect Zenkai for faster access, offline support, and a native app experience.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="neon-button flex-1 bg-ki-green text-dark-navy hover:bg-ki-green/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 