import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { StatusChip } from '@/shared/ui/status-chip'
import { Download, HardDrive } from 'lucide-react'
import { exportAllData, downloadDataAsFile, getDataSummary, AppDataExport } from '@/shared/utils/dataExport'

export function DataExportCard() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [lastExport, setLastExport] = useState<AppDataExport | null>(null)

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
    <div className="cyber-card transition-cyber h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center">
          <HardDrive className="h-5 w-5 text-plasma-cyan cyber-icon glow-cyan" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Data Backup</h3>
          <p className="text-xs text-gray-400 font-mono">System export</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Status indicator */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300 font-inter">
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
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-xs text-gray-400 font-mono mb-2">
              Last Export: {new Date(summary.exportDate).toLocaleDateString()}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-sm font-bold text-ki-green font-mono">{summary.totalWeights}</div>
                <div className="text-xs text-gray-500">Weights</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-plasma-cyan font-mono">{summary.totalTasks}</div>
                <div className="text-xs text-gray-500">Quests</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-hyper-magenta font-mono">{summary.totalNotes}</div>
                <div className="text-xs text-gray-500">Notes</div>
              </div>
            </div>
          </div>
        )}

        {/* Export button */}
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="
            w-full neon-button transition-cyber
            bg-plasma-cyan hover:bg-plasma-cyan
            text-dark-navy font-mono font-semibold
            cyan-glow
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <Download className="h-4 w-4 mr-2 cyber-icon" />
          {isExporting ? 'EXPORTING...' : 'EXPORT DATA'}
        </Button>

        {/* Status messages */}
        {exportStatus === 'success' && (
          <div className="text-center p-2 bg-ki-green/10 border border-ki-green rounded-lg">
            <div className="text-sm text-ki-green font-mono">
              ✓ Data exported successfully!
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Backup file downloaded to your device
            </div>
          </div>
        )}
        
        {exportStatus === 'error' && (
          <div className="text-center p-2 bg-red-400/10 border border-red-400 rounded-lg">
            <div className="text-sm text-red-400 font-mono">
              ✗ Export failed. Please try again.
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Check console for error details
            </div>
          </div>
        )}

        {!summary && exportStatus === 'idle' && (
          <div className="text-xs text-gray-500 text-center font-mono">
            Secure backup for app updates and migrations
          </div>
        )}
      </div>
    </div>
  )
} 