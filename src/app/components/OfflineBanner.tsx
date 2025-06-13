import { useOnline } from '@/shared/hooks/useOnline'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const isOnline = useOnline()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 animate-in slide-in-from-top duration-300">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        <span>You're offline</span>
      </div>
    </div>
  )
} 