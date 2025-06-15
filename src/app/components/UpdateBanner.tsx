import { RefreshCw } from 'lucide-react'
import { useServiceWorkerUpdater } from '@/shared/hooks/useServiceWorkerUpdater'

export default function UpdateBanner() {
  const { needRefresh, updateApp } = useServiceWorkerUpdater()

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-ki-green px-4 py-2 text-gray-900 animate-in slide-in-from-bottom">
      <div className="container mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <RefreshCw className="h-4 w-4" />
        <span>A new version is available.</span>
        <button
          onClick={updateApp}
          className="ml-4 rounded bg-gray-900 px-3 py-1 text-xs font-semibold text-ki-green transition-colors hover:bg-gray-700"
        >
          Refresh
        </button>
      </div>
    </div>
  )
} 