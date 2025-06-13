import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

interface InstallPromptHook {
  deferredPrompt: BeforeInstallPromptEvent | null
  isInstallable: boolean
  isInstallPromptDeclined: boolean
  showInstallPrompt: () => Promise<boolean>
  declineInstallPrompt: () => void
  clearDeclineState: () => void
}

const INSTALL_DECLINED_KEY = 'perfect-zenkai-install-declined'

export function useDeferredInstallPrompt(): InstallPromptHook {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstallPromptDeclined, setIsInstallPromptDeclined] = useState(false)

  useEffect(() => {
    // Check if user previously declined
    const declined = localStorage.getItem(INSTALL_DECLINED_KEY)
    if (declined === 'true') {
      setIsInstallPromptDeclined(true)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()

      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      // Clear the deferredPrompt so it can be garbage collected
      setDeferredPrompt(null)
      setIsInstallable(false)
      // Clear declined state if user installs
      localStorage.removeItem(INSTALL_DECLINED_KEY)
      setIsInstallPromptDeclined(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const showInstallPrompt = async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice

      if (choiceResult.outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
        return true
      }

      return false
    } catch (error) {
      console.error('Error showing install prompt:', error)
      return false
    }
  }

  const declineInstallPrompt = () => {
    localStorage.setItem(INSTALL_DECLINED_KEY, 'true')
    setIsInstallPromptDeclined(true)
  }

  const clearDeclineState = () => {
    localStorage.removeItem(INSTALL_DECLINED_KEY)
    setIsInstallPromptDeclined(false)
  }

  return {
    deferredPrompt,
    isInstallable: isInstallable && !isInstallPromptDeclined,
    isInstallPromptDeclined,
    showInstallPrompt,
    declineInstallPrompt,
    clearDeclineState,
  }
}
