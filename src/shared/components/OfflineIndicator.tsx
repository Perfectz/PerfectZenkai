import { useState, useEffect } from 'react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { 
  Wifi, 
  WifiOff, 
  Cloud, 
  CloudOff, 
  RotateCw, 
  AlertCircle, 
  CheckCircle2,
  Clock
} from 'lucide-react'

export interface OfflineStatus {
  isOnline: boolean
  lastSync: string | null
  pendingOperations: number
  syncInProgress: boolean
  hasErrors: boolean
}

export function OfflineIndicator() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    lastSync: localStorage.getItem('last-sync'),
    pendingOperations: 0,
    syncInProgress: false,
    hasErrors: false
  })

  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }))
      console.log('🌐 Network connection restored')
    }

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }))
      console.log('📵 Network connection lost')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const getStatusIcon = () => {
    if (status.syncInProgress) {
      return <RotateCw className="h-4 w-4 animate-spin" />
    }
    
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4" />
    }
    
    if (status.hasErrors) {
      return <AlertCircle className="h-4 w-4" />
    }
    
    if (status.pendingOperations > 0) {
      return <Clock className="h-4 w-4" />
    }
    
    return <CheckCircle2 className="h-4 w-4" />
  }

  const getStatusColor = () => {
    if (status.syncInProgress) return 'text-blue-400 border-blue-400/30 bg-blue-400/10'
    if (!status.isOnline) return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
    if (status.hasErrors) return 'text-red-400 border-red-400/30 bg-red-400/10'
    if (status.pendingOperations > 0) return 'text-orange-400 border-orange-400/30 bg-orange-400/10'
    return 'text-ki-green border-ki-green/30 bg-ki-green/10'
  }

  const getStatusText = () => {
    if (status.syncInProgress) return 'Syncing...'
    if (!status.isOnline) return 'Offline'
    if (status.hasErrors) return 'Sync Error'
    if (status.pendingOperations > 0) return `${status.pendingOperations} Pending`
    return 'Synced'
  }

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Never'
    
    const date = new Date(lastSync)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleManualSync = async () => {
    setStatus(prev => ({ ...prev, syncInProgress: true }))
    
    // Simulate sync process
    setTimeout(() => {
      setStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date().toISOString(),
        pendingOperations: 0
      }))
      localStorage.setItem('last-sync', new Date().toISOString())
    }, 2000)
  }

  if (!expanded) {
    return (
      <Badge
        variant="outline"
        className={`fixed bottom-4 left-4 z-50 cursor-pointer transition-all hover:scale-105 ${getStatusColor()}`}
        onClick={() => setExpanded(true)}
      >
        <div className="flex items-center gap-1.5">
          {getStatusIcon()}
          <span className="text-xs font-medium">{getStatusText()}</span>
        </div>
      </Badge>
    )
  }

  return (
    <Card className="fixed bottom-4 left-4 z-50 w-72 cyber-card animate-in slide-in-from-bottom-2">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="font-medium text-sm">{getStatusText()}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {status.isOnline ? (
              <Wifi className="h-3 w-3 text-ki-green" />
            ) : (
              <WifiOff className="h-3 w-3 text-yellow-400" />
            )}
            <span>{status.isOnline ? 'Connected' : 'Offline Mode'}</span>
          </div>
          <div className="flex items-center gap-2">
            {status.isOnline ? (
              <Cloud className="h-3 w-3 text-plasma-cyan" />
            ) : (
              <CloudOff className="h-3 w-3 text-gray-500" />
            )}
            <span>{status.isOnline ? 'Cloud Sync' : 'Local Only'}</span>
          </div>
        </div>

        {/* Sync Information */}
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Last Sync:</span>
            <span>{formatLastSync(status.lastSync)}</span>
          </div>
          
          {status.pendingOperations > 0 && (
            <div className="flex justify-between">
              <span>Pending:</span>
              <span className="text-orange-400">{status.pendingOperations} operations</span>
            </div>
          )}
          
          {status.hasErrors && (
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-red-400">Sync errors detected</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {status.isOnline && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSync}
              disabled={status.syncInProgress}
              className="flex-1 h-8"
            >
              {status.syncInProgress ? (
                <>
                  <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RotateCw className="h-3 w-3 mr-1" />
                  Sync Now
                </>
              )}
            </Button>
          )}
          
          {status.hasErrors && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatus(prev => ({ ...prev, hasErrors: false }))
                console.log('Cleared sync errors')
              }}
              className="flex-1 h-8"
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Clear Errors
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {!status.isOnline && (
          <div className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded p-2">
            You're working offline. Changes will sync when connection is restored.
          </div>
        )}
        
        {status.pendingOperations > 0 && status.isOnline && (
          <div className="text-xs text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded p-2">
            {status.pendingOperations} changes are queued for sync.
          </div>
        )}
      </CardContent>
    </Card>
  )
} 