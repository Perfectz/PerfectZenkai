import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function ForceInstallButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    const handleAppInstalled = () => {
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Only show in development mode
  if (import.meta.env.PROD) {
    return null
  }

  const handleInstall = async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt()
        const { outcome } = await installPrompt.userChoice
        console.log('Install outcome:', outcome)
      } catch (error) {
        console.error('Installation failed:', error)
      }
    } else {
      // Force registration check
      if ('serviceWorker' in navigator) {
        try {
          // Use dev-dist path in development, default path in production
          const swPath = import.meta.env.DEV ? '/dev-dist/sw.js' : '/sw.js'
          const registration = await navigator.serviceWorker.register(swPath)
          console.log('Service worker registered:', registration)
        } catch (error) {
          console.warn('Service worker registration failed (this is expected without a proper build):', error)
          // Don't break the UI for development mode
        }
      }
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-500 text-white p-2 rounded-full z-50 text-xs font-bold shadow-lg"
        title={isVisible ? 'Hide Install Debug' : 'Show Install Debug'}
      >
        📱
      </button>

      {/* Install Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm z-50 shadow-xl border border-gray-600">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-purple-400">📱 PWA Install Debug</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white text-lg leading-none"
              title="Close"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            <div className={`px-2 py-1 rounded text-xs ${installPrompt ? 'bg-green-600' : 'bg-gray-600'}`}>
              Install Prompt: {installPrompt ? '✅ Available' : '❌ Not Available'}
            </div>
            
            <button
              onClick={handleInstall}
              className="w-full bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-xs font-medium"
            >
              {installPrompt ? '📲 Install PWA' : '🔄 Register SW'}
            </button>
            
            <button
              onClick={() => window.open('/pwa-debug.html', '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded text-xs"
            >
              🔧 Open Debug Page
            </button>
          </div>
        </div>
      )}
    </>
  )
} 