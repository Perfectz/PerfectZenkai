import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { StatusChip } from '@/shared/ui/status-chip'
import { Download, HardDrive } from 'lucide-react'
import {
  exportAllData,
  downloadDataAsFile,
  getDataSummary,
  PerfectZenkaiDataExport,
} from '@/shared/utils/dataExport'
import { useTouchFeedback, useResponsiveBreakpoint } from '@/shared/hooks/useMobileInteractions'

export function DataExportCard() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle')
  const [lastExport, setLastExport] = useState<PerfectZenkaiDataExport | null>(null)
  
  // Mobile interactions
  const { isMobile } = useResponsiveBreakpoint()
  const buttonFeedback = useTouchFeedback<HTMLButtonElement>({ 
    scale: 0.95, 
    haptic: true 
  })

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setExportStatus('idle')

      const exportData = await exportAllData()
      downloadDataAsFile(exportData)

      setLastExport(exportData)
      setExportStatus('success')

      // Reset success status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportStatus('error')

      // Reset error status after 3 seconds
      setTimeout(() => setExportStatus('idle'), 3000)
    } finally {
      setIsExporting(false)
    }
  }

  const summary = lastExport ? getDataSummary(lastExport) : null

  return (
    <div className={`cyber-card transition-cyber flex h-full flex-col mobile-card mobile-responsive ${isMobile ? 'galaxy-s24-ultra-optimized' : ''}`}>
      <div className="mb-4 flex items-center gap-3 mobile-layout">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-600 bg-gray-700 touch-target">
          <HardDrive className="text-plasma-cyan cyber-icon glow-cyan h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white mobile-heading">Data Backup</h3>
          <p className="font-mono text-xs text-gray-400 mobile-caption">System export</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-4">
        {/* Status indicator */}
        <div className="flex items-center justify-between">
          <div className="font-inter text-sm text-gray-300">
            Export all training data
          </div>

          {exportStatus === 'success' && (
            <StatusChip variant="success" size="sm">
              Complete
            </StatusChip>
          )}
          {exportStatus === 'error' && (
            <StatusChip variant="error" size="sm">
              Failed
            </StatusChip>
          )}
          {isExporting && (
            <StatusChip variant="active" size="sm">
              Processing
            </StatusChip>
          )}
          {exportStatus === 'idle' && !isExporting && (
            <StatusChip variant="info" size="sm" showIcon={false}>
              Ready
            </StatusChip>
          )}
        </div>

        {/* Data summary */}
        {summary && (
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-3">
            <div className="mb-2 font-mono text-xs text-gray-400">
              Last Export: {summary.exportDate} • v{summary.exportVersion}
            </div>
            <div className="mb-2 font-mono text-xs text-gray-500">
              {summary.totalRecords} total records • {summary.exportDurationMs}ms export
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-ki-green font-mono text-sm font-bold">
                  {summary.totalWeights}
                </div>
                <div className="text-xs text-gray-500">Weight</div>
              </div>
              <div className="text-center">
                <div className="text-plasma-cyan font-mono text-sm font-bold">
                  {summary.totalTasks}
                </div>
                <div className="text-xs text-gray-500">Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-hyper-magenta font-mono text-sm font-bold">
                  {summary.totalMeals}
                </div>
                <div className="text-xs text-gray-500">Meals</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-mono text-sm font-bold">
                  {summary.totalWorkouts}
                </div>
                <div className="text-xs text-gray-500">Workouts</div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="text-center">
                <div className="text-purple-400 font-mono text-sm font-bold">
                  {summary.totalJournalEntries}
                </div>
                <div className="text-xs text-gray-500">Journal</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-mono text-sm font-bold">
                  {summary.totalStandups}
                </div>
                <div className="text-xs text-gray-500">Standups</div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-center">
                <div className="text-green-400 font-mono text-xs">
                  Data Quality: {summary.dataQualityScore}% • Completion: {summary.completionRate?.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export button */}
        <Button
          ref={buttonFeedback.elementRef}
          onClick={handleExport}
          disabled={isExporting}
          className={`
            neon-button transition-cyber bg-plasma-cyan
            hover:bg-plasma-cyan text-dark-navy
            cyan-glow w-full font-mono
            font-semibold touch-target mobile-button
            disabled:cursor-not-allowed disabled:opacity-50
            ${isMobile ? 'mobile-responsive' : ''}
          `}
          aria-label="Export all data as backup file"
        >
          <Download className="cyber-icon mr-2 h-4 w-4" />
          {isExporting ? 'EXPORTING...' : 'EXPORT DATA'}
        </Button>

        {/* Status messages */}
        {exportStatus === 'success' && (
          <div className="bg-ki-green/10 border-ki-green rounded-lg border p-2 text-center">
            <div className="text-ki-green font-mono text-sm">
              ✓ Data exported successfully!
            </div>
            <div className="mt-1 text-xs text-gray-400">
              Backup file downloaded to your device
            </div>
          </div>
        )}

        {exportStatus === 'error' && (
          <div className="rounded-lg border border-red-400 bg-red-400/10 p-2 text-center">
            <div className="font-mono text-sm text-red-400">
              ✗ Export failed. Please try again.
            </div>
            <div className="mt-1 text-xs text-gray-400">
              Check console for error details
            </div>
          </div>
        )}

        {!summary && exportStatus === 'idle' && (
          <div className="text-center font-mono text-xs text-gray-500">
            Secure backup for app updates and migrations
          </div>
        )}
      </div>
    </div>
  )
}
