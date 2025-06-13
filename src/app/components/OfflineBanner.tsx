import { useOnline } from '@/shared/hooks/useOnline'
import { WifiOff } from 'lucide-react'

export default function OfflineBanner() {
  const isOnline = useOnline()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed left-0 right-0 top-0 z-50 bg-red-600 px-4 py-2 text-white duration-300 animate-in slide-in-from-top">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm">
        <WifiOff className="h-4 w-4" />
        <span>You're offline</span>
      </div>
    </div>
  )
}
